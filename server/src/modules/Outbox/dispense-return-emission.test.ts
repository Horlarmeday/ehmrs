import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  Drug,
  Inventory,
  InventoryItem,
  InventoryItemHistory,
  OutboxEvent,
  Patient,
  PharmacyStore,
  PharmacyStoreHistory,
  ReturnItem,
  Staff,
  Unit,
  Visit,
} from '../../database/models';
import {
  PharmacyDrugType,
  AcceptedDrugType,
  DrugForm,
  HistoryType,
  ReturnItemStatus,
  VisitCategory,
} from '../../database/enums';
import { dispensePharmacyItems } from '../Store/store.repository';
import { getInventoryItemLayers, updateReturnRequests } from '../Inventory/inventory.repository';
import { dispenseDrug, returnDrugToInventory } from '../Pharmacy/pharmacy.repository';
import { applyInstruction } from '../Inbox/applier';
import { emitDispenseRecorded } from './outbox-writer';
import { logger } from '../../core/helpers/logger';

/**
 * Integration tests for the dispense/return emitters and the stock.received applier (Accounting
 * #297, ADR-0040). Against real MySQL: every claim here — that an event commits with the stock
 * movement, that a multi-layer dispense names BOTH layers, that a redelivery writes no second row
 * — is a claim about the DATABASE and cannot be shown against a mock.
 *
 * Fixture: one drug, two store batches with Accounting batch ids, plus a third with NO batch id
 * standing in for the legacy population (all 1,644 live rows today).
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const staffBody = () => ({
  firstname: 'Emission',
  lastname: 'Auditor',
  fullname: 'Emission Auditor',
  username: `emission_auditor_${suffix}`,
  gender: 'Male',
  address: 'Kubwa',
  photo: 'IMG_EMISSION.jpg',
  password: '123456',
  email: `emission_auditor_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1994-09-02',
  phone: `0704${suffix}`,
});

const storeBatch = (
  drug_id: number,
  unit_id: number,
  staff_id: number,
  overrides: { batch: string; expiration: Date }
) => ({
  drug_id,
  quantity_received: 500,
  quantity_remaining: 500,
  unit_id,
  unit_price: 100,
  selling_price: 100,
  total_price: 50000,
  drug_form: DrugForm.DRUG,
  drug_type: PharmacyDrugType.CASH,
  batch: overrides.batch,
  expiration: overrides.expiration,
  brand: 'Brand-X',
  staff_id,
  date_received: new Date(),
});

/**
 * A store row plus the SUPPLIED delivery row that carries Accounting's batch id.
 *
 * Since ADR-0041 the id lives on the DELIVERY, not the bin: a bin is reused across restocks, so an
 * id held there would name only the most recent one. This mirrors what the create path does in
 * production (#304 C0) — a store row is never created without its opening history row.
 */
const storeRowWithDelivery = async (
  drug_id: number,
  unit_id: number,
  staff_id: number,
  overrides: { batch: string; expiration: Date; external_batch_id: string | null }
): Promise<PharmacyStore> => {
  const row = await PharmacyStore.create(
    storeBatch(drug_id, unit_id, staff_id, {
      batch: overrides.batch,
      expiration: overrides.expiration,
    })
  );
  await PharmacyStoreHistory.create({
    pharmacy_store_id: row.id,
    quantity_supplied: 500,
    quantity_remaining: 500,
    unit_id,
    item_receiver: staff_id,
    history_date: Date.now(),
    history_type: HistoryType.SUPPLIED,
    external_batch_id: overrides.external_batch_id,
  });
  return row;
};

const prescribedStub = (quantity: number, visit_id: number, patient_id: number) => ({
  patient_id,
  visit_id,
  drug_id: 0,
  quantity_to_dispense: quantity,
  quantity_dispensed: 0,
  quantity_returned: 0,
  dispense_status: 'Pending',
  save: async function() {
    return this;
  },
});

describe('dispense.recorded and stock.returned emission (#297, ADR-0040)', () => {
  let VISIT_ID: number;
  let patient_id: number;
  let staff_id: number;
  let drug_id: number;
  let drug_code: string;
  let unit_id: number;
  let inventory_id: number;
  let storeRowA: PharmacyStore;
  let storeRowB: PharmacyStore;
  let storeRowLegacy: PharmacyStore;

  const transfer = (storeRow: PharmacyStore, quantity: number) =>
    dispensePharmacyItems(
      [
        {
          id: storeRow.id,
          drug_type: storeRow.drug_type,
          quantity_to_dispense: quantity,
          dispensary: inventory_id,
          unit_id,
          drug_name: 'Emissionamol',
          receiver: staff_id,
        },
      ],
      staff_id
    );

  const outboxFor = (eventType: string) =>
    OutboxEvent.findAll({
      where: { event_type: eventType, aggregate_id: `visit:${VISIT_ID}` },
      order: [['id', 'ASC']],
    });

  const bodyOf = (row: OutboxEvent): Record<string, unknown> => {
    const payload =
      typeof row.payload === 'string'
        ? (JSON.parse(row.payload) as Record<string, unknown>)
        : (row.payload as Record<string, unknown>);
    return payload.body as Record<string, unknown>;
  };

  const clearOutbox = () =>
    OutboxEvent.destroy({
      where: { aggregate_id: [`visit:${VISIT_ID}`, `store:${inventory_id}`] },
      force: true,
    });

  beforeAll(async () => {
    const staff = await Staff.create(staffBody());
    staff_id = staff.id;

    // A real Patient + Visit: Inventory_Item_Histories.visit_id is a foreign key, so a synthetic
    // id cannot be used, and the emitted aggregate id must be the real visit's.
    const patient = await Patient.create({
      firstname: 'Emission',
      lastname: 'Patient',
      gender: 'Male',
      phone: `0705${suffix}`,
      address: 'Kubwa',
      country: 'Nigeria',
      state: 'FCT',
      lga: 'Bwari',
      date_of_birth: new Date('1990-01-01'),
      hospital_id: `EMI${suffix}`,
      staff_id,
    } as never);
    patient_id = patient.id;

    const visit = await Visit.create({
      patient_id,
      category: VisitCategory.OPD,
      date_visit_start: new Date(),
      department: 'Pharmacy',
      type: 'General',
      professional: 'Pharmacist',
      staff_id,
    } as never);
    VISIT_ID = visit.id;
    drug_code = `EMI-${suffix}`;
    const [drug, unit, inventory] = await Promise.all([
      Drug.create({
        name: `Emissionamol ${suffix}`,
        code: drug_code,
        type: DrugForm.DRUG,
        staff_id,
      }),
      Unit.create({ name: `vial ${suffix}`, staff_id }),
      Inventory.create({
        name: `Emission Dispensary ${suffix}`,
        accepted_drug_type: AcceptedDrugType.CASH,
        staff_id,
      }),
    ]);
    drug_id = drug.id;
    unit_id = unit.id;
    inventory_id = inventory.id;

    storeRowA = await storeRowWithDelivery(drug_id, unit_id, staff_id, {
      batch: 'LOT-A',
      expiration: new Date('2027-01-31'),
      external_batch_id: `acct-batch-a-${suffix}`,
    });
    storeRowB = await storeRowWithDelivery(drug_id, unit_id, staff_id, {
      batch: 'LOT-B',
      expiration: new Date('2028-06-30'),
      external_batch_id: `acct-batch-b-${suffix}`,
    });
    storeRowLegacy = await storeRowWithDelivery(drug_id, unit_id, staff_id, {
      batch: 'LOT-LEGACY',
      expiration: new Date('2029-06-30'),
      external_batch_id: null,
    });
  });

  afterAll(async () => {
    const layerRows = await InventoryItem.findAll({
      where: { inventory_id },
      attributes: ['id'],
    });
    const layerIds = layerRows.map(row => row.id);

    // Child-first, and each step tolerated: a fixture row another suite already removed must not
    // fail the suite AFTER its assertions have all passed. The scratch database is recreated by
    // `test:db:setup`, so a leftover row is harmless; a false FAIL is not.
    const steps: Array<() => Promise<unknown>> = [
      () => clearOutbox(),
      () =>
        layerIds.length
          ? ReturnItem.destroy({ where: { inventory_item_id: layerIds }, force: true })
          : Promise.resolve(0),
      () => InventoryItemHistory.destroy({ where: { inventory_id }, force: true }),
      () => InventoryItem.destroy({ where: { inventory_id }, force: true }),
      () => PharmacyStoreHistory.destroy({ where: { inventory_id }, force: true }),
      () => PharmacyStore.destroy({ where: { drug_id }, force: true }),
      () => Inventory.destroy({ where: { id: inventory_id }, force: true }),
      () => Drug.destroy({ where: { id: drug_id }, force: true }),
      () => Unit.destroy({ where: { id: unit_id }, force: true }),
      () => Visit.destroy({ where: { id: VISIT_ID }, force: true }),
      () => Patient.destroy({ where: { id: patient_id }, force: true }),
      () => Staff.destroy({ where: { id: staff_id }, force: true }),
    ];

    for (const step of steps) {
      try {
        await step();
      } catch {
        // Cleanup only — never fails the suite.
      }
    }

    await sequelizeConnection.close();
  });

  it('a dispense spanning two layers emits ONE event naming BOTH layers', async () => {
    await transfer(storeRowA, 100);
    await transfer(storeRowB, 100);
    await clearOutbox();

    const layers = (await getInventoryItemLayers(inventory_id, drug_id)).filter(
      layer => layer.pharmacy_store_id === storeRowA.id || layer.pharmacy_store_id === storeRowB.id
    );
    const stub = prescribedStub(150, VISIT_ID, patient_id);
    stub.drug_id = drug_id;

    await dispenseDrug(layers, stub as never, {
      quantity_to_dispense: 150,
      staff_id,
      drug_prescription_id: 99999901,
      prescription_id: 5551,
    });

    const rows = await outboxFor('dispense.recorded');
    expect(rows).toHaveLength(1);

    const body = bodyOf(rows[0]);
    expect(body.quantity).toBe(150);
    expect(body.item_code).toBe(drug_code);

    const batches = body.batches as Array<{ external_batch_id: string; quantity: number }>;
    expect(batches).toHaveLength(2);
    expect(batches.reduce((sum, b) => sum + b.quantity, 0)).toBe(150);
    expect(batches.map(b => b.external_batch_id).sort()).toEqual(
      [`acct-batch-a-${suffix}`, `acct-batch-b-${suffix}`].sort()
    );
  });

  it('a dispense from a legacy layer emits WITHOUT a batch array, never a fabricated id', async () => {
    await transfer(storeRowLegacy, 50);
    await clearOutbox();

    const legacyLayer = (await getInventoryItemLayers(inventory_id, drug_id)).find(
      layer => layer.pharmacy_store_id === storeRowLegacy.id
    );
    const stub = prescribedStub(10, VISIT_ID, patient_id);
    stub.drug_id = drug_id;

    await dispenseDrug([legacyLayer], stub as never, {
      quantity_to_dispense: 10,
      staff_id,
      drug_prescription_id: 99999902,
      prescription_id: 5552,
    });

    const rows = await outboxFor('dispense.recorded');
    expect(rows).toHaveLength(1);

    const body = bodyOf(rows[0]);
    expect(body.quantity).toBe(10);
    expect(body).not.toHaveProperty('batches');
  });

  it('a failed dispense leaves NEITHER stock NOR outbox changed (ADR-0018)', async () => {
    await clearOutbox();

    const layer = (await getInventoryItemLayers(inventory_id, drug_id)).find(
      l => l.pharmacy_store_id === storeRowA.id || l.pharmacy_store_id === storeRowB.id
    );
    const remainingBefore = Number(layer.quantity_remaining);

    // A quantity no layer can satisfy: dispenseDrug throws INVENTORY_QUANTITY_LOW after the
    // decrement loop, so the whole transaction — stock rows AND the outbox row — must roll back.
    const stub = prescribedStub(999999, VISIT_ID, patient_id);
    stub.drug_id = drug_id;

    await expect(
      dispenseDrug([layer], stub as never, {
        quantity_to_dispense: 999999,
        staff_id,
        drug_prescription_id: 99999903,
        prescription_id: 5553,
      })
    ).rejects.toThrow();

    const layerAfter = await InventoryItem.findByPk(layer.id);
    expect(Number(layerAfter.quantity_remaining)).toBe(remainingBefore);
    expect(await outboxFor('dispense.recorded')).toHaveLength(0);
  });

  it('refuses a redelivered dispense: the idempotency key is UNIQUE, so a replay cannot double-emit', async () => {
    await clearOutbox();

    // Emitted directly rather than through dispenseDrug: the point under test is the outbox's
    // uniqueness guard, and re-running a whole dispense would consume stock a second time.
    const dispenseId = `redeliver-${suffix}`;
    const emit = () =>
      sequelizeConnection.transaction(t =>
        emitDispenseRecorded(
          {
            type: 'drug',
            id: 5555,
            visit_id: VISIT_ID,
            quantity: 5,
            dispense_id: dispenseId,
            item_code: drug_code,
          },
          t
        )
      );

    await emit();

    // A replay RAISES on the unique idempotency_key rather than silently writing a second row —
    // the same posture ADR-0039 records for the reversal writer. Accounting treats the key as
    // opaque and cannot validate it, so a key that varied across redeliveries would
    // double-recognise revenue with Accounting reporting success either way. The guard is here.
    await expect(emit()).rejects.toThrow();

    const rows = await outboxFor('dispense.recorded');
    expect(rows).toHaveLength(1);
    expect(rows[0].idempotency_key).toBe(`dispense:${dispenseId}`);
  });

  it('a patient return emits stock.returned naming the credited layer', async () => {
    await clearOutbox();

    const layer = (await getInventoryItemLayers(inventory_id, drug_id)).find(
      l => l.pharmacy_store_id === storeRowA.id || l.pharmacy_store_id === storeRowB.id
    );
    const stub = prescribedStub(0, VISIT_ID, patient_id);
    stub.drug_id = drug_id;
    stub.quantity_dispensed = 10;

    await returnDrugToInventory(layer, stub as never, {
      quantity_to_return: 3,
      staff_id,
      drug_prescription_id: 99999904,
      prescription_id: 5554,
      reason_for_return: 'patient refused',
    });

    const rows = await outboxFor('stock.returned');
    expect(rows).toHaveLength(1);

    const body = bodyOf(rows[0]);
    expect(body.source).toBe('patient_to_dispensary');
    expect(body.quantity).toBe(3);
    expect(typeof body.external_batch_id).toBe('string');
    // ADR-0016: the reason and the returning staff member stay EMR-side.
    expect(body).not.toHaveProperty('reason_for_return');
    expect(body).not.toHaveProperty('returned_by');
  });

  it('a granted store return emits ONE stock.returned per item, and no charge.returned', async () => {
    await clearOutbox();

    const layers = (await getInventoryItemLayers(inventory_id, drug_id)).filter(
      l => l.pharmacy_store_id === storeRowA.id || l.pharmacy_store_id === storeRowB.id
    );
    const returnItems = await Promise.all(
      layers.slice(0, 2).map(layer =>
        ReturnItem.create({
          inventory_item_id: layer.id,
          quantity: 2,
          status: ReturnItemStatus.PENDING,
          reason_for_return: 'overstocked',
          date_received: new Date(),
          staff_id,
        })
      )
    );

    await updateReturnRequests(
      returnItems.map((row, index) => ({
        id: row.id,
        inventory_item_id: layers[index].id,
        quantity: 2,
        status: 'Granted',
      })) as never,
      staff_id
    );

    const rows = await OutboxEvent.findAll({
      where: { event_type: 'stock.returned', aggregate_id: `store:${inventory_id}` },
      order: [['id', 'ASC']],
    });
    expect(rows).toHaveLength(2);
    rows.forEach(row => expect(bodyOf(row).source).toBe('dispensary_to_store'));

    expect(await OutboxEvent.count({ where: { event_type: 'charge.returned' } })).toBe(0);
  });

  it('a granted return from a LEGACY layer moves stock, emits nothing, and now LOGS the skip (#21)', async () => {
    // Deliberately does NOT clear the outbox: this case emits nothing by design, so draining the
    // table here would leave the later "no emitted body carries a cost or a price" scan with no
    // rows to inspect. The store-aggregate count is taken as a delta instead.
    const storeEventsBefore = await OutboxEvent.count({
      where: { event_type: 'stock.returned', aggregate_id: `store:${inventory_id}` },
    });

    // The defect #21 reports: this path used to move stock and emit nothing with no trace at all.
    // The guard must still hold — emitting would abort the clinical transaction — so what is
    // asserted is that the skip is now VISIBLE.
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger);

    const legacyLayer = (await getInventoryItemLayers(inventory_id, drug_id)).find(
      layer => layer.pharmacy_store_id === storeRowLegacy.id
    );
    const remainingBefore = Number(legacyLayer.quantity_remaining);

    const returnItem = await ReturnItem.create({
      inventory_item_id: legacyLayer.id,
      quantity: 2,
      status: ReturnItemStatus.PENDING,
      reason_for_return: 'overstocked',
      date_received: new Date(),
      staff_id,
    });

    await updateReturnRequests(
      [
        {
          id: returnItem.id,
          inventory_item_id: legacyLayer.id,
          quantity: 2,
          status: 'Granted',
        },
      ] as never,
      staff_id
    );

    // Stock still moved: the guard drops the EVENT, never the clinical write.
    const layerAfter = await InventoryItem.findByPk(legacyLayer.id);
    expect(Number(layerAfter.quantity_remaining)).toBe(remainingBefore - 2);
    expect((await ReturnItem.findByPk(returnItem.id)).status).toBe(ReturnItemStatus.RETURNED);

    // Still no event — a fabricated batch id is forbidden (#295 D3).
    expect(
      await OutboxEvent.count({
        where: { event_type: 'stock.returned', aggregate_id: `store:${inventory_id}` },
      })
    ).toBe(storeEventsBefore);

    // But no longer silent.
    const skipLines = warn.mock.calls
      .map(call => String(call[0]))
      .filter(line => line.includes('[stock.returned]'));
    expect(skipLines).toHaveLength(1);
    expect(skipLines[0]).toContain('reason=missing_batch_id');
    expect(skipLines[0]).toContain('dispensary_to_store');
    expect(skipLines[0]).toContain(`return_id=${returnItem.id}`);
    expect(skipLines[0]).toContain(`pharmacy_store_id=${storeRowLegacy.id}`);

    warn.mockRestore();
  });

  it('no emitted body carries a cost or a price', async () => {
    const rows = await OutboxEvent.findAll({
      where: { event_type: ['dispense.recorded', 'stock.returned'] },
    });
    expect(rows.length).toBeGreaterThan(0);

    rows.forEach(row => {
      const serialized = JSON.stringify(bodyOf(row));
      expect(serialized).not.toMatch(/cost/i);
      expect(serialized).not.toMatch(/price/i);
    });
  });

  describe('inbound stock.received persists the batch id on the DELIVERY (D5, ADR-0041)', () => {
    // The fixture store rows are created with quantity_received: 500, and the applier matches on
    // quantity as well as drug — see the two-unclaimed-rows test below for why.
    const FIXTURE_QUANTITY = 500;

    const receivedBody = (batchId: string) => ({
      external_batch_id: batchId,
      item_code: drug_code,
      drug_type: PharmacyDrugType.CASH,
      quantity: FIXTURE_QUANTITY,
      expiry_date: '2029-12-31',
      received_at: new Date().toISOString(),
    });

    const apply = (body: Record<string, unknown>) =>
      sequelizeConnection.transaction(t =>
        applyInstruction('stock.received', `visit:${VISIT_ID}`, 1, body, t)
      );

    /** An unpriced bin plus its unclaimed SUPPLIED delivery, as the create path writes them. */
    const pendingDelivery = async (batch: string, quantity: number, expiration: Date) => {
      const row = await PharmacyStore.create({
        ...storeBatch(drug_id, unit_id, staff_id, { batch, expiration }),
        quantity_received: quantity,
        quantity_remaining: quantity,
      });
      await PharmacyStoreHistory.create({
        pharmacy_store_id: row.id,
        quantity_supplied: quantity,
        quantity_remaining: quantity,
        unit_id,
        item_receiver: staff_id,
        history_date: Date.now(),
        history_type: HistoryType.SUPPLIED,
        external_batch_id: null,
      });
      return row;
    };

    const deliveryIdFor = async (storeRowId: number) =>
      (
        await PharmacyStoreHistory.findOne({
          where: { pharmacy_store_id: storeRowId, history_type: HistoryType.SUPPLIED },
          order: [['createdAt', 'DESC']],
        })
      )?.external_batch_id ?? null;

    it('writes the external batch id onto the unclaimed DELIVERY, not the bin', async () => {
      const batchId = `acct-inbound-${suffix}`;
      const result = await apply(receivedBody(batchId));

      expect(result.outcome).toBe('APPLIED');
      const claimed = await PharmacyStoreHistory.findOne({
        where: { external_batch_id: batchId },
      });
      expect(claimed).not.toBeNull();
      expect(claimed.pharmacy_store_id).toBe(storeRowLegacy.id);
    });

    it('NEVER changes quantity — the stock already arrived; the event only names the batch', async () => {
      const untouched = await pendingDelivery('LOT-QTY-PROOF', 31, new Date('2031-01-31'));

      const result = await apply({ ...receivedBody(`acct-qty-${suffix}`), quantity: 31 });
      expect(result.outcome).toBe('APPLIED');

      // Quantity is exactly what the EMR recorded when the stock physically arrived. Adding the
      // event's quantity on top would count the same receipt twice (ADR-0025 decision 9 — a
      // reverse event updates state the EMR owns and produces no side effects of its own).
      expect(await deliveryIdFor(untouched.id)).toBe(`acct-qty-${suffix}`);
      const claimed = await PharmacyStore.findByPk(untouched.id);
      expect(Number(claimed.quantity_received)).toBe(31);
      expect(Number(claimed.quantity_remaining)).toBe(31);
    });

    it('is idempotent: redelivering leaves the batch id on the SAME single delivery', async () => {
      const batchId = `acct-inbound-${suffix}`;
      const result = await apply(receivedBody(batchId));

      expect(result.outcome).toBe('APPLIED');
      const claimed = await PharmacyStoreHistory.findAll({
        where: { external_batch_id: batchId },
      });
      expect(claimed).toHaveLength(1);
    });

    it('a receipt for an unknown item_code FAILS rather than being silently dropped', async () => {
      await expect(
        apply({ ...receivedBody(`acct-unknown-${suffix}`), item_code: `NO-SUCH-${suffix}` })
      ).rejects.toThrow(/matches no drug/);
    });

    it('REFUSES a receipt whose quantity disagrees with the unclaimed store row', async () => {
      const pending = await pendingDelivery('LOT-MISMATCH', 40, new Date('2031-06-30'));

      // Both systems think they know what arrived, and they disagree. Attaching the batch id
      // anyway would hide the divergence behind a row that looks correctly linked.
      await expect(
        apply({ ...receivedBody(`acct-mismatch-${suffix}`), quantity: 41 })
      ).rejects.toThrow(/disagree about what arrived/);

      expect(
        await PharmacyStoreHistory.findOne({
          where: { external_batch_id: `acct-mismatch-${suffix}` },
        })
      ).toBeNull();
      expect(await deliveryIdFor(pending.id)).toBeNull();
    });

    it('matches the right row when two unclaimed receipts of one drug are pending', async () => {
      // The failure the quantity match exists to prevent: two receipts entered before either
      // event drains. Matching on drug alone would attach to whichever row is newest, regardless
      // of which receipt the event actually describes.
      const smaller = await pendingDelivery('LOT-PENDING-SMALL', 7, new Date('2030-01-31'));
      const larger = await pendingDelivery('LOT-PENDING-LARGE', 9, new Date('2030-06-30'));

      // Names the OLDER, smaller receipt. A drug-only match would have taken `larger`.
      const batchId = `acct-two-pending-${suffix}`;
      const result = await apply({ ...receivedBody(batchId), quantity: 7 });

      expect(result.outcome).toBe('APPLIED');
      expect(await deliveryIdFor(smaller.id)).toBe(batchId);
      expect(await deliveryIdFor(larger.id)).toBeNull();
    });

    it('REFUSES to create a first row for a drug this EMR has no unit of measure for', async () => {
      // The create path (#304 C2a) needs a unit, and the event does not carry one — a unit is EMR
      // catalogue vocabulary, not something Accounting knows. With no sibling row to take it from,
      // guessing would misstate every quantity that follows.
      const otherDrug = await Drug.create({
        name: `Unstocked ${suffix}`,
        code: `UNS-${suffix}`,
        type: DrugForm.DRUG,
        staff_id,
      });

      await expect(
        apply({
          ...receivedBody(`acct-norow-${suffix}`),
          item_code: `UNS-${suffix}`,
          unit_cost_kobo: '10000',
        })
      ).rejects.toThrow(/no other stock of that drug to take a unit of measure from/);

      await Drug.destroy({ where: { id: otherDrug.id }, force: true });
    });
  });
});
