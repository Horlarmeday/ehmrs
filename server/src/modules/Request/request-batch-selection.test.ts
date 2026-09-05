import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  Drug,
  Inventory,
  InventoryItem,
  InventoryItemHistory,
  PharmacyStore,
  PharmacyStoreHistory,
  Request,
  Staff,
  Unit,
} from '../../database/models';
import { AcceptedDrugType, DrugForm, PharmacyDrugType, RequestStatus } from '../../database/enums';
import { RequestService } from './request.service';
import { validateUpdateRequestsStatus } from './validations';

/**
 * Integration tests for #301: the request-approval flow must dispense from the batch the approver
 * chose, not an arbitrary one. Against real MySQL, because the claim is about WHICH ROW a write
 * lands on — a mock cannot distinguish "the chosen row" from "whichever row findOne returned".
 *
 * The fixture is two store batches of one drug+type. Before the fix, `getOnePharmacyStoreItem`
 * matched both and returned an arbitrary one; the decrement then landed wherever it landed.
 */

const suffix = Date.now()
  .toString()
  .slice(-8);

const staffBody = () => ({
  firstname: 'Batch',
  lastname: 'Approver',
  fullname: 'Batch Approver',
  username: `batch_approver_${suffix}`,
  gender: 'Female',
  address: 'Kubwa',
  photo: 'IMG_BATCH.jpg',
  password: '123456',
  email: `batch_approver_${suffix}@ehmrs.test`,
  department: 'Pharmacy',
  role: 'Pharmacist',
  sub_role: 'GP',
  date_of_birth: '1991-04-11',
  phone: `0704${suffix}`,
});

const storeBatch = (
  drug_id: number,
  unit_id: number,
  staff_id: number,
  overrides: { batch: string; expiration: Date; quantity: number }
) => ({
  drug_id,
  quantity_received: overrides.quantity,
  quantity_remaining: overrides.quantity,
  unit_id,
  unit_price: 100,
  selling_price: 120,
  total_price: 100 * overrides.quantity,
  drug_form: DrugForm.DRUG,
  drug_type: PharmacyDrugType.CASH,
  batch: overrides.batch,
  expiration: overrides.expiration,
  brand: 'Brand-X',
  staff_id,
  date_received: new Date(),
});

describe('#301 request approval dispenses from the chosen batch', () => {
  let staff_id: number;
  let drug_id: number;
  let otherDrugId: number;
  let unit_id: number;
  let inventory_id: number;
  let storeRowA: PharmacyStore;
  let storeRowB: PharmacyStore;
  let foreignBatch: PharmacyStore;
  let inventoryItemId: number;

  const makeRequest = async (quantity: number) =>
    Request.create({
      quantity,
      inventory_id,
      item_id: inventoryItemId,
      status: RequestStatus.PENDING,
      requested_by: staff_id,
    });

  beforeAll(async () => {
    const staff = await Staff.create(staffBody());
    staff_id = staff.id;

    const [drug, otherDrug, unit, inventory] = await Promise.all([
      Drug.create({
        name: `Batchamol ${suffix}`,
        code: `BAT-${suffix}`,
        type: DrugForm.DRUG,
        staff_id,
      }),
      Drug.create({
        name: `Otheramol ${suffix}`,
        code: `OTH-${suffix}`,
        type: DrugForm.DRUG,
        staff_id,
      }),
      Unit.create({ name: `tab ${suffix}`, staff_id }),
      Inventory.create({
        name: `Batch Dispensary ${suffix}`,
        accepted_drug_type: AcceptedDrugType.CASH,
        staff_id,
      }),
    ]);
    drug_id = drug.id;
    otherDrugId = otherDrug.id;
    unit_id = unit.id;
    inventory_id = inventory.id;

    // Two batches of the SAME drug+type — the shape that made findOne ambiguous.
    storeRowA = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-A',
        expiration: new Date('2027-01-31'),
        quantity: 500,
      }),
      { returning: true }
    );
    storeRowB = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-B',
        expiration: new Date('2028-06-30'),
        quantity: 500,
      }),
      { returning: true }
    );
    // A batch of a DIFFERENT drug, to prove the identity check.
    foreignBatch = await PharmacyStore.create(
      storeBatch(otherDrugId, unit_id, staff_id, {
        batch: 'LOT-FOREIGN',
        expiration: new Date('2027-05-31'),
        quantity: 500,
      }),
      { returning: true }
    );

    const inventoryItem = await InventoryItem.create({
      drug_id,
      inventory_id,
      pharmacy_store_id: storeRowA.id,
      unit_id,
      quantity_received: 0,
      quantity_remaining: 0,
      selling_price: 120,
      acquired_price: 100,
      drug_form: DrugForm.DRUG,
      drug_type: PharmacyDrugType.CASH,
      expiration: new Date('2027-01-31'),
      staff_id,
      date_received: new Date(),
    });
    inventoryItemId = inventoryItem.id;
  });

  afterAll(async () => {
    await Request.destroy({ where: { inventory_id }, force: true });
    await InventoryItemHistory.destroy({ where: { inventory_id }, force: true });
    await InventoryItem.destroy({ where: { inventory_id }, force: true });
    const storeRows = await PharmacyStore.unscoped().findAll({
      where: { drug_id: [drug_id, otherDrugId] },
      attributes: ['id'],
    });
    await PharmacyStoreHistory.destroy({
      where: { pharmacy_store_id: storeRows.map(row => row.id) },
      force: true,
    });
    await PharmacyStore.unscoped().destroy({
      where: { drug_id: [drug_id, otherDrugId] },
      force: true,
    });
    await Inventory.destroy({ where: { id: inventory_id }, force: true });
    await Drug.destroy({ where: { id: [drug_id, otherDrugId] }, force: true });
    await Unit.destroy({ where: { id: unit_id }, force: true });
    await Staff.destroy({ where: { id: staff_id }, force: true });
    await sequelizeConnection.close();
  });

  it('decrements the chosen batch and leaves the sibling untouched', async () => {
    const request = await makeRequest(30);
    const beforeA = (await PharmacyStore.findByPk(storeRowA.id)).quantity_remaining;
    const beforeB = (await PharmacyStore.findByPk(storeRowB.id)).quantity_remaining;

    await RequestService.processRequests(
      [
        {
          id: request.id,
          status: RequestStatus.GRANTED,
          pharmacy_store_id: storeRowB.id,
        },
      ],
      staff_id
    );

    const afterA = (await PharmacyStore.findByPk(storeRowA.id)).quantity_remaining;
    const afterB = (await PharmacyStore.findByPk(storeRowB.id)).quantity_remaining;

    expect(afterB).toBe(beforeB - 30);
    expect(afterA).toBe(beforeA);
  });

  it('refuses on the CHOSEN batch quantity, not a sibling that could have covered it', async () => {
    const thin = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-THIN',
        expiration: new Date('2029-01-31'),
        quantity: 5,
      }),
      { returning: true }
    );
    const request = await makeRequest(50);

    const result = await RequestService.processRequests(
      [{ id: request.id, status: RequestStatus.GRANTED, pharmacy_store_id: thin.id }],
      staff_id
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect((await PharmacyStore.findByPk(thin.id)).quantity_remaining).toBe(5);
  });

  it('refuses a batch belonging to a different drug', async () => {
    const request = await makeRequest(10);

    await expect(
      RequestService.processRequests(
        [{ id: request.id, status: RequestStatus.GRANTED, pharmacy_store_id: foreignBatch.id }],
        staff_id
      )
    ).rejects.toThrow(/different drug/i);

    expect((await PharmacyStore.findByPk(foreignBatch.id)).quantity_remaining).toBe(500);
  });

  it('lists only in-stock batches for the drug, nearest expiry first', async () => {
    const empty = await PharmacyStore.create(
      storeBatch(drug_id, unit_id, staff_id, {
        batch: 'LOT-EMPTY',
        expiration: new Date('2026-01-31'),
        quantity: 0,
      }),
      { returning: true }
    );
    const request = await makeRequest(10);

    const batches = await RequestService.getDispensableBatches(request.id);
    const ids = batches.map(b => b.id);

    expect(ids).not.toContain(empty.id);
    expect(batches.every(b => b.drug_id === drug_id)).toBe(true);
    expect(ids).not.toContain(foreignBatch.id);

    const expiries = batches.map(b => new Date(b.expiration).getTime());
    expect([...expiries].sort((a, b) => a - b)).toEqual(expiries);
  });
});

describe('#301 approval payload validation', () => {
  it('rejects a Granted request with no pharmacy_store_id', () => {
    const { error } = validateUpdateRequestsStatus({
      requests: [{ id: 1, status: RequestStatus.GRANTED }],
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/pharmacy_store_id/);
  });

  it('accepts a Granted request carrying a batch', () => {
    const { error } = validateUpdateRequestsStatus({
      requests: [{ id: 1, status: RequestStatus.GRANTED, pharmacy_store_id: 7 }],
    });
    expect(error).toBeUndefined();
  });

  it('accepts a Declined request with no batch, and forbids one on it', () => {
    expect(
      validateUpdateRequestsStatus({ requests: [{ id: 1, status: RequestStatus.DECLINED }] }).error
    ).toBeUndefined();
    expect(
      validateUpdateRequestsStatus({
        requests: [{ id: 1, status: RequestStatus.DECLINED, pharmacy_store_id: 7 }],
      }).error
    ).toBeDefined();
  });
});
