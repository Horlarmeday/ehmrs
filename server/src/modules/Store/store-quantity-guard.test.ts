import '../../core/config/env';
import '../../database/config/data-source';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { Drug, PharmacyStore, PharmacyStoreLog, Staff, Unit, Vendor } from '../../database/models';
import { DrugForm, PharmacyDrugType } from '../../database/enums';
import { BadException } from '../../common/util/api-error';
import { createCashItem, reorderPharmacyItems } from './store.repository';
import { validatePharmacyItem, validateReorderItems } from './validations';
import { applyInstruction } from '../Inbox/applier';

/**
 * EMR #29 defect B — the negative-receipt guard, pinned per writer (plan §3 / T6).
 *
 * Every path that writes `quantity_received` is floored, and each floor is pinned by a test so a
 * later refactor cannot quietly remove it. The applier's guard predates this change (it shipped
 * with #304's `stock.received`); it is pinned here anyway because "already correct" is exactly
 * the state a refactor silently destroys.
 *
 * Against real MySQL, like #304's suites: the claims are that rows do NOT land and shelves do
 * NOT move — database claims, tested against the database.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const VISIT_ID = 9_100_000;

const staffBody = () => ({
  firstname: 'Quantity',
  lastname: 'Guard',
  fullname: 'Quantity Guard',
  username: `quantity_guard_${suffix}`,
  gender: 'Male',
  address: 'Kubwa',
  photo: 'IMG_GUARD.jpg',
  password: '123456',
  email: `quantity_guard_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1994-09-02',
  phone: `0706${suffix}`,
});

describe('negative receipt quantities are refused at every writer (#29)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  let drug_code: string;
  let vendor_id: number;

  const receipt = (overrides: Record<string, unknown> = {}) => ({
    drug_id,
    shelf: 'G1',
    product_code: `PC-${suffix}`,
    batch: `B-${suffix}`,
    voucher: `V-${suffix}`,
    quantity_received: 50,
    unit_id,
    unit_price: 400,
    selling_price: 450,
    expiration: new Date('2027-09-07'),
    staff_id,
    date_received: new Date(),
    drug_form: DrugForm.DRUG,
    drug_type: PharmacyDrugType.CASH,
    vendor_id,
    ...overrides,
  });

  beforeAll(async () => {
    const staff = await Staff.create(staffBody());
    staff_id = staff.id;
    drug_code = `GD-${suffix}`;
    const drug = await Drug.create({
      name: `Guardamol ${suffix}`,
      code: drug_code,
      type: DrugForm.DRUG,
      staff_id,
    });
    const unit = await Unit.create({ name: `crate ${suffix}`, staff_id });
    const vendor = await Vendor.create({ name: `Guardemzor ${suffix}`, staff_id });
    drug_id = drug.id;
    unit_id = unit.id;
    vendor_id = vendor.id;
  }, 20000);

  afterAll(async () => {
    try {
      const rows = await PharmacyStore.unscoped().findAll({
        where: { drug_id },
        attributes: ['id'],
      });
      if (rows.length) {
        await PharmacyStoreLog.destroy({ where: { pharmacy_store_id: rows.map(r => r.id) } });
        await PharmacyStore.unscoped().destroy({ where: { drug_id } });
      }
      await Drug.destroy({ where: { id: drug_id } });
      await Vendor.destroy({ where: { id: vendor_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // Fixtures are namespaced by `suffix`; leftovers are inert.
    }
  });

  describe('the model rejects negative', () => {
    it("refuses a negative quantity_received at the Sequelize validator, mirroring quantity_remaining's", async () => {
      await expect(
        PharmacyStore.create(receipt({ quantity_received: -30, total_price: -12000 }) as any)
      ).rejects.toThrow(/minimum quantity_received cannot be less than zero/i);

      expect(await PharmacyStore.count({ where: { drug_id } })).toBe(0);
    });

    it('still accepts a zero receipt — an empty delivery is odd, not corrupting', async () => {
      const zeroed = await PharmacyStore.create({
        ...receipt({ quantity_received: 0 }),
        quantity_remaining: 0,
        total_price: 0,
      } as any);
      expect(Number(zeroed.quantity_received)).toBe(0);

      // Removed at once: later suites in this file assert on the drug's row count.
      await PharmacyStore.destroy({ where: { id: zeroed.id } });
    });
  });

  describe('the request boundary rejects negative', () => {
    it('validatePharmacyItem refuses a negative quantity_received with a readable message', () => {
      const { error } = validatePharmacyItem(receipt({ quantity_received: -10 }));
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('quantity_received');
    });

    it('validateReorderItems refuses a negative quantity_received in any line of the batch', () => {
      const { error } = validateReorderItems({
        items: [
          {
            id: 1,
            selling_price: 450,
            unit_price: 400,
            quantity_received: 25,
            voucher: 'V-1',
            batch: 'B-1',
            expiration: new Date(),
            date_received: new Date(),
            vendor_id,
          },
          {
            id: 2,
            selling_price: 450,
            unit_price: 400,
            quantity_received: -5,
            voucher: 'V-2',
            batch: 'B-2',
            expiration: new Date(),
            date_received: new Date(),
            vendor_id,
          },
        ],
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('quantity_received');
    });
  });

  describe('createStoreItem rejects negative', () => {
    it('refuses a negative receipt and writes no row, rather than clamping silently', async () => {
      await expect(createCashItem(receipt({ quantity_received: -30 }))).rejects.toThrow(
        BadException
      );
      await expect(createCashItem(receipt({ quantity_received: -30 }))).rejects.toThrow(
        /whole number of 0 or more/i
      );

      expect(await PharmacyStore.count({ where: { drug_id } })).toBe(0);
    });
  });

  describe('reorderPharmacyItems rejects negative', () => {
    let bin: PharmacyStore;

    beforeEach(async () => {
      bin = await PharmacyStore.create({
        ...receipt({ quantity_received: 100 }),
        drug_type: PharmacyDrugType.CASH,
        quantity_remaining: 100,
        total_price: 40000,
      } as any);
    });

    afterEach(async () => {
      await PharmacyStoreLog.destroy({ where: { pharmacy_store_id: bin.id } });
      await PharmacyStore.unscoped().destroy({ where: { id: bin.id } });
    });

    it('refuses a negative receipt before any shelf moves', async () => {
      await expect(
        reorderPharmacyItems(
          [
            {
              id: bin.id,
              selling_price: 450,
              unit_price: 400,
              quantity_received: -20,
              voucher: `V-${suffix}`,
              batch: `B-${suffix}`,
              vendor_id,
              expiration: new Date('2027-09-07'),
              date_received: new Date(),
            },
          ],
          staff_id
        )
      ).rejects.toThrow(/whole number of 0 or more/i);

      const untouched = await PharmacyStore.findByPk(bin.id);
      expect(Number(untouched.quantity_remaining)).toBe(100);
      expect(Number(untouched.quantity_received)).toBe(100);
      expect(await PharmacyStoreLog.count({ where: { pharmacy_store_id: bin.id } })).toBe(0);
    });

    it('refuses the WHOLE batch when any line is negative — no half-applied reorders', async () => {
      await expect(
        reorderPharmacyItems(
          [
            {
              id: bin.id,
              selling_price: 450,
              unit_price: 400,
              quantity_received: 10,
              voucher: `V1-${suffix}`,
              batch: `B1-${suffix}`,
              vendor_id,
              expiration: new Date('2027-09-07'),
              date_received: new Date(),
            },
            {
              id: bin.id,
              selling_price: 450,
              unit_price: 400,
              quantity_received: -1,
              voucher: `V2-${suffix}`,
              batch: `B2-${suffix}`,
              vendor_id,
              expiration: new Date('2027-09-07'),
              date_received: new Date(),
            },
          ],
          staff_id
        )
      ).rejects.toThrow(/whole number of 0 or more/i);

      const untouched = await PharmacyStore.findByPk(bin.id);
      expect(Number(untouched.quantity_remaining)).toBe(100);
      expect(await PharmacyStoreLog.count({ where: { pharmacy_store_id: bin.id } })).toBe(0);
    });
  });

  describe('the accounting applier paths keep their existing guard', () => {
    const apply = (body: Record<string, unknown>) =>
      sequelizeConnection.transaction(t =>
        applyInstruction('stock.received', `visit:${VISIT_ID}`, 1, body, t)
      );

    const receiptEvent = (overrides: Record<string, unknown> = {}) => ({
      external_batch_id: `acct-guard-${suffix}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      item_code: drug_code,
      drug_type: PharmacyDrugType.CASH,
      quantity: 100,
      unit_cost_kobo: '35000',
      ...overrides,
    });

    it('refuses a negative quantity — shared guard for the increment and create bins', async () => {
      await expect(apply(receiptEvent({ quantity: -25 }))).rejects.toThrow(
        /no positive integer quantity/i
      );
      expect(await PharmacyStore.count({ where: { drug_id } })).toBe(0);
    });

    it('refuses a zero quantity too — the guard demands a real delivery', async () => {
      await expect(apply(receiptEvent({ quantity: 0 }))).rejects.toThrow(
        /no positive integer quantity/i
      );
      expect(await PharmacyStore.count({ where: { drug_id } })).toBe(0);
    });
  });

  describe('the database CHECK rejects negative', () => {
    it('blocks a raw UPDATE that bypasses every model validator (plan D1)', async () => {
      const row = await PharmacyStore.create({
        ...receipt({ quantity_received: 10 }),
        drug_type: PharmacyDrugType.CASH,
        quantity_remaining: 10,
        total_price: 4000,
      } as any);

      await expect(
        sequelizeConnection.query(
          'UPDATE `Pharmacy_Store_Items` SET `quantity_received` = -1 WHERE `id` = :id',
          { replacements: { id: row.id }, type: QueryTypes.UPDATE }
        )
      ).rejects.toThrow(/chk_psi_quantity_received_nonnegative/i);

      const untouched = await PharmacyStore.findByPk(row.id);
      expect(Number(untouched.quantity_received)).toBe(10);

      await PharmacyStore.unscoped().destroy({ where: { id: row.id } });
    });
  });
});
