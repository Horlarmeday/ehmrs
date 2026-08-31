import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  Drug,
  PharmacyStore,
  PharmacyStoreHistory,
  Staff,
  Unit,
  Vendor,
} from '../../database/models';
import { DrugForm, HistoryType, PharmacyDrugType, Status } from '../../database/enums';
import { applyInstruction } from './applier';

/**
 * Integration tests for #304 C2a (create) and C2b (increment) — the Accounting-originated goods
 * receipt path that #26 specified and #297 could not serve.
 *
 * Against real MySQL: every claim here is about rows landing, or deliberately not landing, in the
 * database. The create path was blocked because `Pharmacy_Store_Items` demanded a price the event
 * did not carry; ADR-0041 gives the event a cost and an optional price, and C1 made the price
 * nullable, so the row can now be created without inventing anything.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const VISIT_ID = 9_000_000;

/** Plaschema is a real class: a live dispensary and a production store row (#304 R5). */
const PLASCHEMA = PharmacyDrugType.PLASCHEMA;

describe('stock.received creates or increments a store row (#304 C2a/C2b)', () => {
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  let drug_code: string;
  let vendor_id: number;

  const body = (overrides: Record<string, unknown> = {}) => ({
    external_batch_id: `acct-${suffix}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    item_code: drug_code,
    drug_type: PharmacyDrugType.CASH,
    quantity: 100,
    expiry_date: '2029-12-31',
    received_at: new Date().toISOString(),
    unit_cost_kobo: '35000',
    ...overrides,
  });

  const apply = (b: Record<string, unknown>) =>
    sequelizeConnection.transaction(t =>
      applyInstruction('stock.received', `visit:${VISIT_ID}`, 1, b, t)
    );

  const binFor = (drug_type: PharmacyDrugType) =>
    PharmacyStore.findOne({ where: { drug_id, drug_type } });

  const deliveriesFor = (storeId: number) =>
    PharmacyStoreHistory.findAll({
      where: { pharmacy_store_id: storeId, history_type: HistoryType.SUPPLIED },
      order: [['createdAt', 'ASC']],
    });

  beforeAll(async () => {
    const staff = await Staff.create({
      firstname: 'Receipt',
      lastname: 'Applier',
      fullname: 'Receipt Applier',
      username: `receipt_applier_${suffix}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG.jpg',
      password: '123456',
      email: `receipt_applier_${suffix}@ehmrs.test`,
      department: 'Pharmacy',
      role: 'Pharmacist',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
      phone: `0705${suffix}`,
    });
    staff_id = staff.id;
    drug_code = `CRT-${suffix}`;

    const [drug, unit, vendor] = await Promise.all([
      Drug.create({ name: `Createamol ${suffix}`, code: drug_code, type: DrugForm.DRUG, staff_id }),
      Unit.create({ name: `tin ${suffix}`, staff_id }),
      Vendor.create({ name: `Emzor ${suffix}`, staff_id }),
    ]);
    drug_id = drug.id;
    unit_id = unit.id;
    vendor_id = vendor.id;

    // A Cash bin already exists, as it does for 493 of 504 drugs on production. Its delivery is
    // already claimed, so the applier cannot attach to it and must increment instead.
    const seed = await PharmacyStore.create({
      drug_id,
      drug_type: PharmacyDrugType.CASH,
      product_code: '',
      quantity_received: 500,
      quantity_remaining: 500,
      unit_id,
      unit_price: 300,
      selling_price: 500,
      total_price: 150000,
      drug_form: DrugForm.DRUG,
      status: Status.ACTIVE,
      staff_id,
      date_received: new Date(),
    });
    await PharmacyStoreHistory.create({
      pharmacy_store_id: seed.id,
      quantity_supplied: 500,
      quantity_remaining: 500,
      unit_id,
      item_receiver: staff_id,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
      external_batch_id: `acct-seed-${suffix}`,
    });
  }, 20000);

  afterAll(async () => {
    try {
      // unscoped(): the model's @DefaultScope is `status: ACTIVE`, so a plain destroy would leave
      // this suite's deliberately-retired row behind, and its FK would block the Drug delete.
      const rows = await PharmacyStore.unscoped().findAll({
        where: { drug_id },
        attributes: ['id'],
      });
      await PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: rows.map(r => r.id) } });
      await PharmacyStore.unscoped().destroy({ where: { drug_id } });
      await Drug.destroy({ where: { id: drug_id } });
      await Vendor.destroy({ where: { id: vendor_id } });
      await Unit.destroy({ where: { id: unit_id } });
      await Staff.destroy({ where: { id: staff_id } });
    } catch {
      // Fixtures are namespaced by `suffix`; leftovers are inert.
    }
  });

  describe('C2b — increment, the common case (493 of 504 drugs already have a bin)', () => {
    it('adds to the existing bin instead of creating a second row', async () => {
      const before = await binFor(PharmacyDrugType.CASH);
      const result = await apply(body({ quantity: 40 }));

      expect(result.outcome).toBe('APPLIED');
      const after = await binFor(PharmacyDrugType.CASH);
      expect(after.id).toBe(before.id);
      expect(Number(after.quantity_remaining)).toBe(Number(before.quantity_remaining) + 40);

      // Exactly one bin for this (drug, class) — a second row would double the apparent stock.
      expect(
        await PharmacyStore.count({ where: { drug_id, drug_type: PharmacyDrugType.CASH } })
      ).toBe(1);
    });

    it('records the increment as its own delivery carrying the batch id', async () => {
      const bin = await binFor(PharmacyDrugType.CASH);
      const batchId = `acct-incr-${suffix}`;
      const before = (await deliveriesFor(bin.id)).length;

      await apply(body({ external_batch_id: batchId, quantity: 25 }));

      const deliveries = await deliveriesFor(bin.id);
      expect(deliveries).toHaveLength(before + 1);
      const latest = deliveries[deliveries.length - 1];
      expect(latest.external_batch_id).toBe(batchId);
      expect(Number(latest.quantity_supplied)).toBe(25);
    });

    it('leaves an existing price alone when the receipt carries none', async () => {
      const before = await binFor(PharmacyDrugType.CASH);
      await apply(body({ quantity: 10 }));

      const after = await binFor(PharmacyDrugType.CASH);
      expect(Number(after.selling_price)).toBe(Number(before.selling_price));
    });

    it('updates cost, price and vendor when the receipt carries them', async () => {
      await apply(
        body({ quantity: 15, unit_cost_kobo: '44400', selling_price_kobo: '99900', vendor_id })
      );

      const after = await binFor(PharmacyDrugType.CASH);
      expect(Number(after.unit_price)).toBe(444);
      expect(Number(after.selling_price)).toBe(999);
      expect(after.vendor_id).toBe(vendor_id);
    });
  });

  describe('C2a — create, for a class this EMR has never stocked', () => {
    it('creates the row, taking its unit of measure from the sibling class', async () => {
      const batchId = `acct-new-nhis-${suffix}`;
      const result = await apply(
        body({
          external_batch_id: batchId,
          drug_type: PharmacyDrugType.NHIS,
          quantity: 60,
          selling_price_kobo: '80000',
        })
      );

      expect(result.outcome).toBe('APPLIED');
      const created = await binFor(PharmacyDrugType.NHIS);
      expect(created).not.toBeNull();
      expect(Number(created.quantity_received)).toBe(60);
      expect(Number(created.quantity_remaining)).toBe(60);
      expect(Number(created.selling_price)).toBe(800);
      expect(Number(created.unit_price)).toBe(350);
      // The unit is the sibling Cash bin's — Accounting does not know the EMR's units.
      expect(created.unit_id).toBe(unit_id);

      const [delivery] = await deliveriesFor(created.id);
      expect(delivery.external_batch_id).toBe(batchId);
    });

    it('creates an UNPRICED row when the receipt carries no selling price', async () => {
      const result = await apply(body({ drug_type: PharmacyDrugType.PRIVATE, quantity: 20 }));

      expect(result.outcome).toBe('APPLIED');
      const created = await binFor(PharmacyDrugType.PRIVATE);
      // Null, not a fabricated number: the row is simply not dispensable until a human prices it.
      expect(created.selling_price).toBeNull();
      expect(Number(created.unit_price)).toBe(350);
    });

    it('REFUSES to create without a cost rather than inventing one', async () => {
      await expect(
        apply({
          ...body({ drug_type: PharmacyDrugType.RETAINERSHIP, quantity: 5 }),
          unit_cost_kobo: undefined,
        })
      ).rejects.toThrow(/carries no unit_cost_kobo/);

      expect(await binFor(PharmacyDrugType.RETAINERSHIP)).toBeNull();
    });
  });

  describe('guards', () => {
    it('refuses a receipt naming no drug type — the class cannot be guessed', async () => {
      await expect(apply({ ...body(), drug_type: undefined })).rejects.toThrow(/is not one of/);
    });

    it('refuses a drug type outside the closed set', async () => {
      await expect(apply(body({ drug_type: 'Charity' }))).rejects.toThrow(/is not one of/);
    });

    it('refuses a malformed cost rather than silently dropping it', async () => {
      await expect(apply(body({ unit_cost_kobo: '350.00' }))).rejects.toThrow(/malformed/);
    });

    it('is idempotent: a redelivered receipt increments nothing a second time', async () => {
      const batchId = `acct-replay-${suffix}`;
      await apply(body({ external_batch_id: batchId, quantity: 30 }));
      const afterFirst = await binFor(PharmacyDrugType.CASH);

      const result = await apply(body({ external_batch_id: batchId, quantity: 30 }));

      expect(result.outcome).toBe('APPLIED');
      const afterSecond = await binFor(PharmacyDrugType.CASH);
      expect(Number(afterSecond.quantity_remaining)).toBe(Number(afterFirst.quantity_remaining));
    });

    it('treats an INACTIVE bin as not existing, rather than resurrecting it (C3b)', async () => {
      // 6 rows are Inactive on production. Incrementing one would silently return stock a human
      // deliberately retired; creating alongside it is the honest outcome.
      //
      // Belt and braces: the model's @DefaultScope already hides Inactive rows from every query,
      // so this passes even without the applier's explicit filter. The filter stays because the
      // applier should not depend on a scope another module could change.
      const retired = await PharmacyStore.create({
        drug_id,
        drug_type: PLASCHEMA,
        product_code: '',
        quantity_received: 5,
        quantity_remaining: 5,
        unit_id,
        unit_price: 100,
        selling_price: 200,
        total_price: 500,
        drug_form: DrugForm.DRUG,
        status: Status.INACTIVE,
        staff_id,
        date_received: new Date(),
      });

      await apply(body({ drug_type: PLASCHEMA, quantity: 12 }));

      // `unscoped()` is required to see it at all: the model carries a @DefaultScope of
      // `status: ACTIVE` (pharmacyStore.ts:28-32), so every ordinary query already hides Inactive
      // rows. That scope — not the applier's own filter — is what makes a retired bin invisible.
      const untouched = await PharmacyStore.unscoped().findByPk(retired.id);
      expect(Number(untouched.quantity_remaining)).toBe(5);

      const active = await PharmacyStore.findOne({
        where: { drug_id, drug_type: PLASCHEMA, status: Status.ACTIVE },
      });
      expect(active).not.toBeNull();
      expect(Number(active.quantity_remaining)).toBe(12);
    });

    it('never files stock into a class the receipt did not name', async () => {
      const cashBefore = await binFor(PharmacyDrugType.CASH);
      await apply(body({ drug_type: PharmacyDrugType.NHIS, quantity: 11 }));

      const cashAfter = await binFor(PharmacyDrugType.CASH);
      expect(Number(cashAfter.quantity_remaining)).toBe(Number(cashBefore.quantity_remaining));
    });
  });
});
