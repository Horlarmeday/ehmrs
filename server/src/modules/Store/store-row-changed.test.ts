import '../../core/config/env';
import '../../database/config/data-source';
import { sequelizeConnection } from '../../database/config/data-source';
import { Drug, PharmacyStore, PharmacyStoreHistory, Staff, Unit } from '../../database/models';
import { DrugForm, PharmacyDrugType, Status } from '../../database/enums';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import {
  createCashItem,
  createNHISItem,
  reorderPharmacyItems,
  updatePharmacyStoreItems,
} from './store.repository';
import StoreService from './store.service';

/**
 * Integration tests for #81: the store flows that change a (drug, class) bin's existence or
 * selling price must put a `store.row.changed` on the outbox, in the SAME transaction as the
 * write, carrying the row's POST-WRITE state.
 *
 * Against real MySQL, asserting the EMITTED ROW and not just the write: an event that never
 * landed is exactly the failure the cache cannot recover from on its own.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const staffBody = () => ({
  firstname: 'StoreRow',
  lastname: 'Auditor',
  fullname: 'StoreRow Auditor',
  username: `store_row_auditor_${suffix}`,
  gender: 'Male',
  address: 'Kubwa',
  photo: 'IMG_SROW.jpg',
  password: '123456',
  email: `store_row_auditor_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1994-09-02',
  phone: `0704${suffix}`,
});

describe('store.row.changed emissions from the EMR store flows (#81)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  let drug_code: string;

  const storeEvents = () => OutboxEvent.findAll({ where: { event_type: 'store.row.changed' } });

  const receipt = (overrides: Record<string, unknown> = {}) => ({
    drug_id,
    shelf: 'A1',
    product_code: `PC-${suffix}`,
    batch: `B-${suffix}`,
    voucher: `V-${suffix}`,
    quantity_received: 50,
    unit_id,
    unit_price: 400,
    expiration: new Date('2027-09-07'),
    staff_id,
    date_received: new Date(),
    drug_form: DrugForm.DRUG,
    ...overrides,
  });

  beforeEach(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });

    const [staff] = await Staff.findOrCreate({
      where: { username: staffBody().username },
      defaults: staffBody(),
    });
    staff_id = staff.id;
    drug_code = `SROW-${suffix}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const [drug] = await Drug.findOrCreate({
      where: { code: drug_code },
      defaults: { name: `StoreRowamol ${suffix}`, type: DrugForm.DRUG, staff_id },
    });
    const [unit] = await Unit.findOrCreate({
      where: { name: `srow pack ${suffix}` },
      defaults: { staff_id },
    });
    drug_id = drug.id;
    unit_id = unit.id;
  }, 20000);

  afterAll(async () => {
    try {
      const rows = await PharmacyStore.unscoped().findAll({
        where: { drug_id },
        attributes: ['id'],
      });
      if (rows.length) {
        await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: rows.map(r => r.id) } });
        await PharmacyStore.unscoped().destroy({ where: { drug_id } });
      }
      await Drug.destroy({ where: { id: drug_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
      await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
      await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
    } catch {
      // fixtures are namespaced; leftovers are inert
    }
  });

  it('createCashItem emits row_exists with the kobo price, in the same commit', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].aggregate_id).toBe(`store-row:${drug_code}:Cash`);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'Cash',
      row_exists: true,
      selling_price_kobo: '45000',
    });
    expect(Number(events[0].sequence)).toBe(1);
    expect(item.id).toBeGreaterThan(0);
  });

  it('an unpriced create emits row_exists with a null price', async () => {
    await createNHISItem(receipt());

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'NHIS',
      row_exists: true,
      selling_price_kobo: null,
    });
  });

  it('a repricing update emits the NEW price; a cosmetic edit emits nothing', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });

    // The update screen posts the FULL row back (PharmacyStoreLog needs the fields), so the
    // fixture does too.
    const row = (await PharmacyStore.unscoped().findByPk(item.id)).toJSON() as Record<
      string,
      unknown
    >;
    const { id, createdAt: _c, updatedAt: _u, ...fields } = row;

    await updatePharmacyStoreItems([{ ...fields, id, selling_price: 500 } as never], staff_id);

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'Cash',
      row_exists: true,
      selling_price_kobo: '50000',
    });
    expect(Number(events[0].sequence)).toBeGreaterThan(0);

    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    const shelfRow = (await PharmacyStore.unscoped().findByPk(item.id)).toJSON() as Record<
      string,
      unknown
    >;
    const { id: shelfId, ...shelfFields } = shelfRow;
    await updatePharmacyStoreItems([{ ...shelfFields, id: shelfId } as never], staff_id);
    expect(await storeEvents()).toHaveLength(0);
  });

  it('a reorder that carries a price emits the repriced row; quantity-only writes never do', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });

    await reorderPharmacyItems(
      [
        {
          id: item.id,
          quantity_received: 30,
          selling_price: 475,
          unit_price: 400,
          voucher: `V2-${suffix}`,
          batch: `B2-${suffix}`,
          vendor_id: null,
          expiration: new Date('2027-09-07'),
          date_received: new Date(),
        } as never,
      ],
      staff_id
    );

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'Cash',
      row_exists: true,
      selling_price_kobo: '47500',
    });

    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await reorderPharmacyItems(
      [
        {
          id: item.id,
          quantity_received: 5,
          selling_price: null,
          unit_price: 400,
          voucher: `V3-${suffix}`,
          batch: `B3-${suffix}`,
          vendor_id: null,
          expiration: new Date('2027-09-07'),
          date_received: new Date(),
        } as never,
      ],
      staff_id
    );
    expect(await storeEvents()).toHaveLength(0);
  });

  it('deactivation emits row_exists false with no price', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });

    await StoreService.deactivatePharmacyStoreItems([item.id]);

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'Cash',
      row_exists: false,
      selling_price_kobo: null,
    });

    const row = await PharmacyStore.unscoped().findByPk(item.id);
    expect(row.status).toBe(Status.INACTIVE);
  });

  it('deactivating one of two duplicate bins answers for the sibling, not the slot', async () => {
    const item = await createCashItem(receipt({ selling_price: 450 }));
    const duplicate = await PharmacyStore.create({
      drug_id,
      drug_type: PharmacyDrugType.CASH,
      product_code: '',
      quantity_received: 10,
      quantity_remaining: 10,
      unit_id,
      unit_price: 300,
      selling_price: 525,
      total_price: 3000,
      drug_form: DrugForm.DRUG,
      status: Status.ACTIVE,
      staff_id,
      date_received: new Date(),
    });
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });

    await StoreService.deactivatePharmacyStoreItems([item.id]);

    const events = await storeEvents();
    expect(events).toHaveLength(1);
    expect(events[0].payload.body).toEqual({
      item_code: drug_code,
      drug_type: 'Cash',
      row_exists: true,
      selling_price_kobo: '52500',
    });

    await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: item.id } });
    await PharmacyStore.unscoped().destroy({ where: { id: [item.id, duplicate.id] } });
  });

  it('a codeless drug is skipped: the write commits, no event is emitted', async () => {
    const codeless = await Drug.create({
      name: `Codelessamol ${suffix}`,
      code: `CLS-${suffix}`,
      type: DrugForm.DRUG,
      staff_id,
    });
    // The model requires a code, but legacy production rows predate the column's backfill —
    // blank it the way those rows look (a raw UPDATE bypasses the validators).
    await sequelizeConnection.query(`UPDATE Drugs SET code = '' WHERE id = :id`, {
      replacements: { id: codeless.id },
    });

    const item = await createCashItem({ ...receipt({ drug_id: codeless.id, selling_price: 450 }) });

    expect(await storeEvents()).toHaveLength(0);
    expect(item.id).toBeGreaterThan(0);

    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(
        `DELETE FROM Pharmacy_Store_Histories WHERE pharmacy_store_id = :id`,
        { replacements: { id: item.id }, transaction }
      );
      await sequelizeConnection.query(`DELETE FROM Pharmacy_Store_Items WHERE id = :id`, {
        replacements: { id: item.id },
        transaction,
      });
      await sequelizeConnection.query(`DELETE FROM Drugs WHERE id = :id`, {
        replacements: { id: codeless.id },
        transaction,
      });
    });
  });
});
