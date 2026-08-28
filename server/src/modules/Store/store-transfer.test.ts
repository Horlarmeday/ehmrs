import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  Drug,
  Inventory,
  InventoryItem,
  InventoryItemHistory,
  PharmacyStore,
  PharmacyStoreHistory,
  ReturnItem,
  Staff,
  Unit,
} from '../../database/models';
import { PharmacyDrugType, AcceptedDrugType, DrugForm, HistoryType } from '../../database/enums';
import { dispensePharmacyItems } from './store.repository';
import {
  getInventoryItemLayers,
  sumLayerQuantityRemaining,
  updateReturnRequests,
} from '../Inventory/inventory.repository';
import { dispenseDrug, returnDrugToInventory } from '../Pharmacy/pharmacy.repository';

/**
 * Integration tests for the Store→Inventory transfer's batch identity (issue #295, Accounting
 * repo). Against real MySQL: the claims — one dispensary layer per store batch, a merge that
 * never rewrites cost/expiry/brand, FEFO consumption across layers, and history rows naming
 * their layer — are claims about the DATABASE, so they cannot be unit-tested against a mock.
 *
 * The fixture is the plan's §3: one drug, two store batches, deliberately different costs and
 * expiries, so a merge that clobbers is visible rather than plausible.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const staffBody = () => ({
  firstname: 'Transfer',
  lastname: 'Auditor',
  fullname: 'Transfer Auditor',
  username: `transfer_auditor_${suffix}`,
  gender: 'Male',
  address: 'Kubwa',
  photo: 'IMG_TRANSFER.jpg',
  password: '123456',
  email: `transfer_auditor_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1994-09-02',
  phone: `0703${suffix}`,
});

const storeBatch = (
  drug_id: number,
  unit_id: number,
  staff_id: number,
  overrides: { batch: string; unit_price: number; expiration: Date; brand: string }
) => ({
  drug_id,
  quantity_received: 500,
  quantity_remaining: 500,
  unit_id,
  unit_price: overrides.unit_price,
  selling_price: overrides.unit_price,
  total_price: overrides.unit_price * 500,
  drug_form: DrugForm.DRUG,
  drug_type: PharmacyDrugType.CASH,
  batch: overrides.batch,
  expiration: overrides.expiration,
  brand: overrides.brand,
  staff_id,
  date_received: new Date(),
});

describe('store → inventory transfer keeps batch identity (#295)', () => {
  let staff_id: number;
  let drug_id: number;
  let unit_id: number;
  let inventory_id: number;
  let storeRowA: PharmacyStore;
  let storeRowB: PharmacyStore;

  const transfer = (storeRow: PharmacyStore, quantity: number) =>
    dispensePharmacyItems(
      [
        {
          id: storeRow.id,
          drug_type: storeRow.drug_type,
          quantity_to_dispense: quantity,
          dispensary: inventory_id,
          unit_id,
          drug_name: 'Auditamol',
          receiver: staff_id,
        },
      ],
      staff_id
    );

  beforeAll(async () => {
    const staff = await Staff.create(staffBody());
    staff_id = staff.id;
    const [drug, unit, inventory] = await Promise.all([
      Drug.create({
        name: `Auditamol ${suffix}`,
        code: `AUD-${suffix}`,
        type: DrugForm.DRUG,
        staff_id,
      }),
      Unit.create({ name: `vial ${suffix}`, staff_id }),
      Inventory.create({
        name: `Audit Dispensary ${suffix}`,
        accepted_drug_type: AcceptedDrugType.CASH,
        staff_id,
      }),
    ]);
    drug_id = drug.id;
    unit_id = unit.id;
    inventory_id = inventory.id;

    // §3 fixture: same drug, two batches, different cost/expiry/brand.
    storeRowA = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-A',
        unit_price: 100,
        expiration: new Date('2027-01-31'),
        brand: 'Brand-X',
      }),
      { returning: true }
    );
    storeRowB = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-B',
        unit_price: 150,
        expiration: new Date('2028-06-30'),
        brand: 'Brand-Y',
      }),
      { returning: true }
    );
  });

  afterAll(async () => {
    const layerRows = await InventoryItem.findAll({
      where: { inventory_id },
      attributes: ['id'],
    });
    const layerIds = layerRows.map(row => row.id);
    await ReturnItem.destroy({ where: { inventory_item_id: layerIds }, force: true });
    await InventoryItemHistory.destroy({ where: { inventory_id }, force: true });
    await InventoryItem.destroy({ where: { inventory_id }, force: true });
    await PharmacyStoreHistory.destroy({ where: { inventory_id }, force: true });
    await PharmacyStore.destroy({ where: { drug_id }, force: true });
    await Inventory.destroy({ where: { id: inventory_id }, force: true });
    await Drug.destroy({ where: { id: drug_id }, force: true });
    await Unit.destroy({ where: { id: unit_id }, force: true });
    await Staff.destroy({ where: { id: staff_id }, force: true });
    await sequelizeConnection.close();
  });

  it('two different store batches produce two dispensary layers', async () => {
    await transfer(storeRowA, 100);
    await transfer(storeRowB, 100);

    const layers = await InventoryItem.findAll({
      where: { inventory_id, drug_id },
      order: [['id', 'ASC']],
    });
    expect(layers).toHaveLength(2);

    const layerA = layers.find(l => l.pharmacy_store_id === storeRowA.id);
    const layerB = layers.find(l => l.pharmacy_store_id === storeRowB.id);
    expect(layerA).toBeDefined();
    expect(layerB).toBeDefined();

    expect(Number(layerA.acquired_price)).toBe(100);
    expect(new Date(layerA.expiration).toISOString().slice(0, 10)).toBe('2027-01-31');
    expect(layerA.brand).toBe('Brand-X');
    expect(layerA.batch).toBe('LOT-A');

    expect(Number(layerB.acquired_price)).toBe(150);
    expect(new Date(layerB.expiration).toISOString().slice(0, 10)).toBe('2028-06-30');
    expect(layerB.brand).toBe('Brand-Y');
    expect(layerB.batch).toBe('LOT-B');
  });

  it('a newly created dispensary layer always carries its pharmacy_store_id', async () => {
    const layers = await InventoryItem.findAll({ where: { inventory_id, drug_id } });
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer.pharmacy_store_id).not.toBeNull();
      expect(layer.batch).not.toBeNull();
    }
  });

  it('a repeat transfer of the same store batch merges quantities only', async () => {
    await transfer(storeRowA, 50);

    const layers = await InventoryItem.findAll({ where: { inventory_id, drug_id } });
    const layerA = layers.find(l => l.pharmacy_store_id === storeRowA.id);
    expect(Number(layerA.quantity_received)).toBe(150);
    expect(Number(layerA.quantity_remaining)).toBe(150);
    expect(Number(layerA.acquired_price)).toBe(100);
    expect(new Date(layerA.expiration).toISOString().slice(0, 10)).toBe('2027-01-31');
    expect(layerA.brand).toBe('Brand-X');

    const sameBatchLayers = layers.filter(l => l.pharmacy_store_id === storeRowA.id);
    expect(sameBatchLayers).toHaveLength(1);
  });

  it('a failed transfer leaves both store and dispensary unchanged', async () => {
    const storeBefore = await PharmacyStore.findByPk(storeRowA.id);
    const layersBefore = await InventoryItem.findAll({
      where: { inventory_id, drug_id },
    });
    const historyBefore = await InventoryItemHistory.count({
      where: { inventory_id },
    });

    const createSpy = jest
      .spyOn(InventoryItemHistory, 'create')
      .mockRejectedValueOnce(new Error('simulated failure after the layer write'));
    const results = await transfer(storeRowA, 10);
    createSpy.mockRestore();

    expect(results[0].status).toBe('rejected');
    const storeAfter = await PharmacyStore.findByPk(storeRowA.id);
    expect(Number(storeAfter.quantity_remaining)).toBe(Number(storeBefore.quantity_remaining));
    const layersAfter = await InventoryItem.findAll({ where: { inventory_id, drug_id } });
    expect(layersAfter.map(l => Number(l.quantity_remaining)).sort()).toEqual(
      layersBefore.map(l => Number(l.quantity_remaining)).sort()
    );
    expect(await InventoryItemHistory.count({ where: { inventory_id } })).toBe(historyBefore);
  });

  it('layers are returned soonest expiry first, and availability sums across them', async () => {
    const layers = await getInventoryItemLayers(inventory_id, drug_id);
    expect(layers[0].pharmacy_store_id).toBe(storeRowA.id);
    expect(layers[1].pharmacy_store_id).toBe(storeRowB.id);
    expect(sumLayerQuantityRemaining(layers)).toBe(250);
  });

  it('a dispense spanning two layers writes a history row per layer, consuming FEFO', async () => {
    const layersBefore = await getInventoryItemLayers(inventory_id, drug_id);
    const layerA = layersBefore.find(l => l.pharmacy_store_id === storeRowA.id);
    const layerB = layersBefore.find(l => l.pharmacy_store_id === storeRowB.id);
    const aRemaining = Number(layerA.quantity_remaining);
    const bRemaining = Number(layerB.quantity_remaining);
    const span = aRemaining + 20;

    const prescribedStub = {
      patient_id: null,
      visit_id: null,
      quantity_to_dispense: span,
      quantity_dispensed: 0,
      quantity_returned: 0,
      dispense_status: 'Pending',
      save: async () => prescribedStub,
    };

    await dispenseDrug(layersBefore, prescribedStub as never, {
      quantity_to_dispense: span,
      staff_id,
      drug_prescription_id: 99999999,
    });

    const layerAAfter = await InventoryItem.findByPk(layerA.id);
    const layerBAfter = await InventoryItem.findByPk(layerB.id);
    expect(Number(layerAAfter.quantity_remaining)).toBe(0);
    expect(Number(layerBAfter.quantity_remaining)).toBe(bRemaining - 20);

    const history = await InventoryItemHistory.findAll({
      where: { inventory_id, history_type: HistoryType.DISPENSED },
      order: [['id', 'ASC']],
    });
    expect(history).toHaveLength(2);
    expect(history.map(h => h.pharmacy_store_id).sort()).toEqual(
      [storeRowA.id, storeRowB.id].sort()
    );
    const fromA = history.find(h => h.pharmacy_store_id === storeRowA.id);
    const fromB = history.find(h => h.pharmacy_store_id === storeRowB.id);
    expect(Number(fromA.quantity_dispensed)).toBe(aRemaining);
    expect(Number(fromB.quantity_dispensed)).toBe(20);
  });

  it('a patient return credits the soonest-expiring layer and names it in history', async () => {
    const layers = await getInventoryItemLayers(inventory_id, drug_id);
    const target = layers[0];
    const before = Number(target.quantity_remaining);

    const prescribedStub = {
      patient_id: null,
      visit_id: null,
      quantity_to_dispense: 0,
      quantity_dispensed: 10,
      quantity_returned: 0,
      dispense_status: 'Dispensed',
      save: async () => prescribedStub,
    };

    await returnDrugToInventory(target, prescribedStub as never, {
      quantity_to_return: 10,
      staff_id,
      drug_prescription_id: 99999999,
      reason_for_return: 'audit return',
    });

    const after = await InventoryItem.findByPk(target.id);
    expect(Number(after.quantity_remaining)).toBe(before + 10);

    const history = await InventoryItemHistory.findOne({
      where: {
        inventory_id,
        history_type: HistoryType.RETURNED,
        inventory_item_id: target.id,
      },
      order: [['id', 'DESC']],
    });
    expect(history.pharmacy_store_id).toBe(target.pharmacy_store_id);
  });

  it('a granted dispensary→store return still works against the multi-layer shape', async () => {
    const layers = await getInventoryItemLayers(inventory_id, drug_id);
    const target = layers[0];
    const before = Number(target.quantity_remaining);

    const request = await ReturnItem.create({
      inventory_item_id: target.id,
      quantity: 5,
      date_received: new Date(),
      reason_for_return: 'audit store return',
      staff_id,
    });

    await updateReturnRequests(
      [{ id: request.id, inventory_item_id: target.id, quantity: 5, status: 'Granted' }],
      staff_id
    );

    const after = await InventoryItem.findByPk(target.id);
    expect(Number(after.quantity_remaining)).toBe(before - 5);

    const history = await InventoryItemHistory.findOne({
      where: {
        inventory_id,
        history_type: HistoryType.RETURNED,
        inventory_item_id: target.id,
      },
      order: [['id', 'DESC']],
    });
    expect(Number(history.quantity_returned)).toBe(5);
    expect(history.pharmacy_store_id).toBe(target.pharmacy_store_id);

    await ReturnItem.destroy({ where: { id: request.id }, force: true });
  });
});
