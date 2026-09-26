import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { Drug, PharmacyStore, PharmacyStoreHistory, Staff, Unit } from '../../database/models';
import { DrugForm, HistoryType, PharmacyDrugType, Status } from '../../database/enums';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { applyInstruction } from './applier';

/**
 * Integration tests for #81's inbound half: `store.row.requested`, Accounting's cache-miss resync,
 * and the `store.row.changed` emissions the `stock.received` applier owes on its create and
 * repricing paths.
 *
 * Asserting the EMITTED ROW, not just the outcome — an APPLIED over an empty outbox would be a
 * green test for a broken remedy.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const VISIT_ID = 9_100_000;

describe('store.row.requested and stock.received emissions (#81)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  let drug_code: string;

  const apply = (eventType: string, b: Record<string, unknown>) =>
    sequelizeConnection.transaction(t => applyInstruction(eventType, `visit:${VISIT_ID}`, 1, b, t));

  const eventBodies = async () =>
    (await OutboxEvent.findAll({ where: { event_type: 'store.row.changed' } })).map(
      event => event.payload.body
    );

  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'RowResync',
      lastname: 'Applier',
      fullname: 'RowResync Applier',
      username: `row_resync_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG.jpg',
      password: '123456',
      email: `row_resync_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0705${suffix}`,
    });
    staff_id = staff.id;
    drug_code = `RSQ-${suffix}`;

    const [drug, unit] = await Promise.all([
      Drug.create({ name: `Resyncamol ${suffix}`, code: drug_code, type: DrugForm.DRUG, staff_id }),
      Unit.create({ name: `rsq tin ${suffix}`, staff_id }),
    ]);
    drug_id = drug.id;
    unit_id = unit.id;

    // A sibling-class bin for the drug gives the applier's CREATE path a unit of measure to
    // inherit (ADR-0041) — the same shape production holds, 486 of 504 drugs sharing one unit.
    const sibling = await PharmacyStore.create({
      drug_id,
      drug_type: PharmacyDrugType.NHIS,
      product_code: '',
      quantity_received: 40,
      quantity_remaining: 40,
      unit_id,
      unit_price: 300,
      selling_price: 600,
      total_price: 12000,
      drug_form: DrugForm.DRUG,
      status: Status.ACTIVE,
      staff_id,
      date_received: new Date(),
    });
    await PharmacyStoreHistory.create({
      pharmacy_store_id: sibling.id,
      quantity_supplied: 40,
      quantity_remaining: 40,
      unit_id,
      item_receiver: staff_id,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
      external_batch_id: `rsq-sibling-${suffix}`,
    });
  }, 20000);

  beforeEach(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

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
    await sequelizeConnection.close();
  });

  describe('store.row.requested', () => {
    it('answers with the row and its kobo price when the bin exists', async () => {
      const bin = await PharmacyStore.create({
        drug_id,
        drug_type: PharmacyDrugType.CASH,
        product_code: '',
        quantity_received: 10,
        quantity_remaining: 10,
        unit_id,
        unit_price: 300,
        selling_price: 450,
        total_price: 3000,
        drug_form: DrugForm.DRUG,
        status: Status.ACTIVE,
        staff_id,
        date_received: new Date(),
      });

      const result = await apply('store.row.requested', {
        item_code: drug_code,
        drug_type: 'Cash',
      });

      expect(result.outcome).toBe('APPLIED');
      const bodies = await eventBodies();
      expect(bodies).toEqual([
        {
          item_code: drug_code,
          drug_type: 'Cash',
          row_exists: true,
          selling_price_kobo: '45000',
        },
      ]);

      await PharmacyStore.unscoped().destroy({ where: { id: bin.id } });
    });

    it('answers row_exists false — an answer, not a silence — when no bin exists', async () => {
      const result = await apply('store.row.requested', {
        item_code: drug_code,
        drug_type: 'Plaschema',
      });

      expect(result.outcome).toBe('APPLIED');
      expect(await eventBodies()).toEqual([
        {
          item_code: drug_code,
          drug_type: 'Plaschema',
          row_exists: false,
          selling_price_kobo: null,
        },
      ]);
    });

    it('answers row_exists false for an INACTIVE bin, which the default scope hides', async () => {
      const bin = await PharmacyStore.create({
        drug_id,
        drug_type: PharmacyDrugType.PRIVATE,
        product_code: '',
        quantity_received: 10,
        quantity_remaining: 10,
        unit_id,
        unit_price: 300,
        selling_price: 450,
        total_price: 3000,
        drug_form: DrugForm.DRUG,
        status: Status.INACTIVE,
        staff_id,
        date_received: new Date(),
      });

      const result = await apply('store.row.requested', {
        item_code: drug_code,
        drug_type: 'Private',
      });

      expect(result.outcome).toBe('APPLIED');
      expect(await eventBodies()).toEqual([
        { item_code: drug_code, drug_type: 'Private', row_exists: false, selling_price_kobo: null },
      ]);

      await PharmacyStore.unscoped().destroy({ where: { id: bin.id } });
    });

    it('is UNHANDLED and emits nothing for a code no drug carries', async () => {
      const result = await apply('store.row.requested', {
        item_code: 'NO-SUCH-CODE',
        drug_type: 'Cash',
      });

      expect(result.outcome).toBe('UNHANDLED');
      expect(await OutboxEvent.count()).toBe(0);
    });

    it('is UNHANDLED for a malformed or out-of-vocabulary body', async () => {
      for (const body of [
        { drug_type: 'Cash' },
        { item_code: drug_code, drug_type: 'Wholesale' },
        { item_code: '   ', drug_type: 'Cash' },
      ]) {
        const result = await apply('store.row.requested', body);
        expect(result.outcome).toBe('UNHANDLED');
      }
      expect(await OutboxEvent.count()).toBe(0);
    });
  });

  describe('stock.received emissions', () => {
    const receiptBody = (overrides: Record<string, unknown> = {}) => ({
      external_batch_id: `rsq-${suffix}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      item_code: drug_code,
      drug_type: PharmacyDrugType.CASH,
      quantity: 20,
      unit_cost_kobo: '35000',
      ...overrides,
    });

    it('the CREATE path emits row_exists true, priced when the receipt carried a price', async () => {
      const result = await apply('stock.received', receiptBody({ selling_price_kobo: '80000' }));

      expect(result.outcome).toBe('APPLIED');
      const bodies = await eventBodies();
      expect(bodies).toEqual([
        { item_code: drug_code, drug_type: 'Cash', row_exists: true, selling_price_kobo: '80000' },
      ]);

      const bin = await PharmacyStore.findOne({ where: { drug_id, drug_type: 'Cash' } });
      await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: bin.id } });
      await PharmacyStore.unscoped().destroy({ where: { id: bin.id } });
    });

    it('the CREATE path emits a null price for an unpriced row', async () => {
      const result = await apply('stock.received', receiptBody());

      expect(result.outcome).toBe('APPLIED');
      expect(await eventBodies()).toEqual([
        { item_code: drug_code, drug_type: 'Cash', row_exists: true, selling_price_kobo: null },
      ]);
    });

    it('the INCREMENT path emits only when the receipt reprices the bin', async () => {
      const bin = await PharmacyStore.create({
        drug_id,
        drug_type: PharmacyDrugType.RETAINERSHIP,
        product_code: '',
        quantity_received: 50,
        quantity_remaining: 50,
        unit_id,
        unit_price: 300,
        selling_price: 500,
        total_price: 15000,
        drug_form: DrugForm.DRUG,
        status: Status.ACTIVE,
        staff_id,
        date_received: new Date(),
      });
      await PharmacyStoreHistory.create({
        pharmacy_store_id: bin.id,
        quantity_supplied: 50,
        quantity_remaining: 50,
        unit_id,
        item_receiver: staff_id,
        history_date: Date.now(),
        history_type: HistoryType.SUPPLIED,
        external_batch_id: `rsq-seed-${suffix}`,
      });

      await apply('stock.received', receiptBody({ drug_type: 'Retainership', quantity: 10 }));
      expect(await eventBodies()).toEqual([]);

      const result = await apply(
        'stock.received',
        receiptBody({ drug_type: 'Retainership', quantity: 5, selling_price_kobo: '99900' })
      );
      expect(result.outcome).toBe('APPLIED');
      expect(await eventBodies()).toEqual([
        {
          item_code: drug_code,
          drug_type: 'Retainership',
          row_exists: true,
          selling_price_kobo: '99900',
        },
      ]);

      await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: bin.id } });
      await PharmacyStore.unscoped().destroy({ where: { id: bin.id } });
    });
  });
});
