/* eslint-disable camelcase */
import { describe, afterAll, it, expect, beforeAll } from '@jest/globals';
import server from '../../core/startup/server';

import request from 'supertest';

import {
  Staff,
  Drug,
  Unit,
  Inventory,
  PharmacyStore,
  PharmacyStoreHistory,
  InventoryItem,
  InventoryItemHistory,
  ReturnItem,
} from '../../database/models';
import { AcceptedDrugType } from '../../database/enums';

const q = 10;

describe('Inventory Endpoints /inventory request-return/update', () => {
  let token;
  let storeTotalBefore: number;
  let staff_id: number;
  let unit_id: number;
  let drug_id: number;
  let inventory_id: number;
  let rowA: PharmacyStore;
  let rowB: PharmacyStore;
  let rowC: PharmacyStore;
  let sourcedItem: InventoryItem;
  let legacyItem: InventoryItem;
  let mixedValidItem: InventoryItem;
  let returnItem: ReturnItem;
  let returnItem2: ReturnItem;
  let returnItem3: ReturnItem;
  let declinedReturnItem: ReturnItem;
  let pendingReturnItem: ReturnItem;
  let legacyReturnItem: ReturnItem;
  let mixedValidReturnItem: ReturnItem;

  const makeStoreRow = (batch: string, unit_price: number, expiration: string) =>
    PharmacyStore.create({
      drug_id,
      product_code: `PC-${batch}`,
      shelf: '296',
      voucher: 'V296',
      batch,
      quantity_received: 100,
      quantity_remaining: 100,
      unit_id,
      unit_price,
      selling_price: unit_price + 50,
      total_price: unit_price * 100,
      expiration,
      staff_id,
      date_received: new Date(),
      drug_form: 'Drug',
      drug_type: 'Cash',
      status: 'Active',
    });

  const makeInventoryItem = (overrides: Partial<InventoryItem> = {}) =>
    InventoryItem.create({
      inventory_id,
      drug_id,
      quantity_received: 30,
      unit_id,
      selling_price: 150,
      acquired_price: 100,
      expiration: new Date('2028-06-30'),
      date_received: new Date(),
      quantity_remaining: 30,
      drug_form: 'Drug',
      drug_type: 'Cash',
      status: 'Active',
      staff_id,
      ...overrides,
    } as any);

  const makeReturnItem = (inventory_item_id: number) =>
    ReturnItem.create({
      inventory_item_id,
      quantity: q,
      date_received: new Date(),
      reason_for_return: '296 regression fixture',
      staff_id,
      status: 'Pending',
    });

  const grantedBody = (item: ReturnItem, inventoryItem: InventoryItem, quantity = q) => [
    {
      id: item.id,
      inventory_item_id: inventoryItem.id,
      quantity,
      status: 'Granted',
    },
  ];

  const grant = (body: ReturnType<typeof grantedBody>) =>
    request(server)
      .put('/api/inventory/request-return/update')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const reloadRows = () => Promise.all([rowA.reload(), rowB.reload(), rowC.reload()]);

  const returnedHistoryCount = () =>
    PharmacyStoreHistory.count({
      where: { pharmacy_store_id: [rowA.id, rowB.id, rowC.id], history_type: 'Returned' },
    });

  beforeAll(async () => {
    const marker = `${Date.now()}`;
    const staff = await Staff.create({
      firstname: 'Fatai',
      phone: `0703${marker.slice(-8)}`,
      lastname: 'Mahmud',
      fullname: 'Mahmud Aze',
      username: `296wale${marker}`,
      gender: 'Male',
      address: 'Kubwa',
      photo: 'IMG_20202022.jpg',
      password: '123456',
      email: `296-${marker}@gmail.com`,
      department: 'Medical',
      role: 'Doctor',
      sub_role: 'GP',
      date_of_birth: '1994-09-02',
    });
    token = await staff.generateAuthToken();
    staff_id = staff.id;

    const unit = await Unit.create({ name: `vial 296-${marker}`, staff_id });
    unit_id = unit.id;
    const drug = await Drug.create({
      name: `Auditamol 296-${marker}`,
      code: `AUD296-${marker}`,
      type: 'Drug',
      staff_id,
    });
    drug_id = drug.id;
    const inventory = await Inventory.create({
      name: `Main Store 296-${marker}`,
      accepted_drug_type: AcceptedDrugType.CASH,
      staff_id,
    });
    inventory_id = inventory.id;

    rowA = await makeStoreRow('LOT-A', 100, '2027-01-31');
    rowB = await makeStoreRow('LOT-B', 150, '2028-06-30');
    rowC = await makeStoreRow('LOT-C', 200, '2029-03-31');
    storeTotalBefore = rowA.quantity_remaining + rowB.quantity_remaining + rowC.quantity_remaining;

    sourcedItem = await makeInventoryItem({
      pharmacy_store_id: rowB.id,
      batch: 'LOT-B',
    } as any);
    legacyItem = await makeInventoryItem({
      pharmacy_store_id: null,
      batch: null,
    } as any);
    mixedValidItem = await makeInventoryItem({
      pharmacy_store_id: rowB.id,
      batch: 'LOT-B',
    } as any);

    returnItem = await makeReturnItem(sourcedItem.id);
    returnItem2 = await makeReturnItem(sourcedItem.id);
    returnItem3 = await makeReturnItem(sourcedItem.id);
    declinedReturnItem = await makeReturnItem(mixedValidItem.id);
    pendingReturnItem = await makeReturnItem(mixedValidItem.id);
    legacyReturnItem = await makeReturnItem(legacyItem.id);
    mixedValidReturnItem = await makeReturnItem(mixedValidItem.id);
  }, 30000);

  afterAll(async () => {
    const bestEffort = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch {
        // seeded rows in ehmrs_test carry dangling FK references; leftover
        // fixture rows are inert (unique markers, never globally asserted)
      }
    };
    const storeIds = [rowA?.id, rowB?.id, rowC?.id].filter(id => id != null);
    const itemIds = [sourcedItem?.id, legacyItem?.id, mixedValidItem?.id].filter(id => id != null);
    if (storeIds.length)
      await bestEffort(() =>
        PharmacyStoreHistory.destroy({ where: { pharmacy_store_id: storeIds } })
      );
    if (itemIds.length)
      await bestEffort(() =>
        InventoryItemHistory.destroy({ where: { inventory_item_id: itemIds } })
      );
    if (itemIds.length)
      await bestEffort(() => ReturnItem.destroy({ where: { inventory_item_id: itemIds } }));
    if (itemIds.length) await bestEffort(() => InventoryItem.destroy({ where: { id: itemIds } }));
    if (storeIds.length) await bestEffort(() => PharmacyStore.destroy({ where: { id: storeIds } }));
    if (inventory_id) await bestEffort(() => Inventory.destroy({ where: { id: inventory_id } }));
    if (drug_id) await bestEffort(() => Drug.destroy({ where: { id: drug_id } }));
    if (unit_id) await bestEffort(() => Unit.destroy({ where: { id: unit_id } }));
    if (staff_id) await bestEffort(() => Staff.destroy({ where: { id: staff_id } }));
  }, 30000);

  it('a granted return credits exactly one store batch row', async () => {
    const res = await grant(grantedBody(returnItem, sourcedItem));
    expect(res.status).toBe(201);

    await reloadRows();
    expect(rowB.quantity_remaining).toBe(110);
    expect(rowB.unit_price).toBe('150.00');
    expect(String(new Date(rowB.expiration).toISOString()).startsWith('2028-06-30')).toBe(true);
    expect(rowA.quantity_remaining).toBe(100);
    expect(rowC.quantity_remaining).toBe(100);
  }, 10000);

  it('the other batch rows are untouched', async () => {
    await reloadRows();
    expect(rowA.quantity_remaining).toBe(100);
    expect(rowA.unit_price).toBe('100.00');
    expect(String(new Date(rowA.expiration).toISOString()).startsWith('2027-01-31')).toBe(true);
    expect(rowC.quantity_remaining).toBe(100);
    expect(rowC.unit_price).toBe('200.00');
    expect(String(new Date(rowC.expiration).toISOString()).startsWith('2029-03-31')).toBe(true);
  }, 10000);

  it('the store total for the drug rises by exactly the returned quantity', async () => {
    const rows = await PharmacyStore.findAll({
      where: { drug_id, drug_type: 'Cash', drug_form: 'Drug' },
    });
    const total = rows.reduce((sum, row) => sum + row.quantity_remaining, 0);
    expect(rows).toHaveLength(3);
    expect(total).toBe(storeTotalBefore + q);
  }, 10000);

  it('a granted return stamps history from the row it actually updated', async () => {
    const historyRows = await PharmacyStoreHistory.findAll({
      where: { pharmacy_store_id: [rowA.id, rowB.id, rowC.id], history_type: 'Returned' },
    });
    expect(historyRows).toHaveLength(1);
    expect(historyRows[0].pharmacy_store_id).toBe(rowB.id);
    expect(historyRows[0].quantity_returned).toBe(q);
  }, 10000);

  it("the history row's quantity_remaining matches the updated row", async () => {
    await rowB.reload();
    const historyRows = await PharmacyStoreHistory.findAll({
      where: { pharmacy_store_id: [rowA.id, rowB.id, rowC.id], history_type: 'Returned' },
    });
    expect(historyRows).toHaveLength(1);
    expect(+historyRows[0].quantity_remaining).toBe(rowB.quantity_remaining);
    expect(+historyRows[0].quantity_remaining).toBe(110);
  }, 10000);

  it('the granted return still debits the dispensary layer correctly', async () => {
    await sourcedItem.reload();
    expect(sourcedItem.quantity_remaining).toBe(30 - q);
    const itemHistory = await InventoryItemHistory.findAll({
      where: { inventory_item_id: sourcedItem.id, history_type: 'Returned' },
    });
    expect(itemHistory).toHaveLength(1);
    expect(itemHistory[0].pharmacy_store_id).toBe(rowB.id);
    expect(itemHistory[0].quantity_returned).toBe(q);
    expect(itemHistory[0].quantity_remaining).toBe(30 - q);
    await returnItem.reload();
    expect(returnItem.status).toBe('Returned');
  }, 10000);

  it('a declined request moves no stock', async () => {
    const historyBefore = await returnedHistoryCount();
    const res = await request(server)
      .put('/api/inventory/request-return/update')
      .set('Authorization', `Bearer ${token}`)
      .send([
        {
          id: declinedReturnItem.id,
          inventory_item_id: mixedValidItem.id,
          quantity: q,
          status: 'Declined',
        },
      ]);
    expect(res.status).toBe(201);
    await reloadRows();
    expect(rowA.quantity_remaining).toBe(100);
    expect(rowB.quantity_remaining).toBe(110);
    expect(rowC.quantity_remaining).toBe(100);
    expect(await returnedHistoryCount()).toBe(historyBefore);
    await declinedReturnItem.reload();
    expect(declinedReturnItem.status).toBe('Declined');
  }, 10000);

  it('a pending request moves no stock', async () => {
    const historyBefore = await returnedHistoryCount();
    const res = await request(server)
      .put('/api/inventory/request-return/update')
      .set('Authorization', `Bearer ${token}`)
      .send([
        {
          id: pendingReturnItem.id,
          inventory_item_id: mixedValidItem.id,
          quantity: q,
          status: 'Pending',
        },
      ]);
    expect(res.status).toBe(201);
    await pendingReturnItem.reload();
    expect(pendingReturnItem.status).toBe('Pending');
    await reloadRows();
    expect(rowA.quantity_remaining).toBe(100);
    expect(rowB.quantity_remaining).toBe(110);
    expect(rowC.quantity_remaining).toBe(100);
    expect(await returnedHistoryCount()).toBe(historyBefore);
  }, 10000);

  it('a grant with no source layer is refused and moves no stock', async () => {
    const historyBefore = await returnedHistoryCount();
    const res = await grant(grantedBody(legacyReturnItem, legacyItem));
    expect(res.status).toBe(400);
    expect(String(res.body.message)).toContain(String(legacyItem.id));
    await legacyItem.reload();
    expect(legacyItem.quantity_remaining).toBe(30);
    await legacyReturnItem.reload();
    expect(legacyReturnItem.status).toBe('Pending');
    expect(await returnedHistoryCount()).toBe(historyBefore);
  }, 10000);

  it('a batch containing one unsourced item credits nothing', async () => {
    const historyBefore = await returnedHistoryCount();
    const res = await grant([
      ...grantedBody(legacyReturnItem, legacyItem),
      ...grantedBody(mixedValidReturnItem, mixedValidItem),
    ]);
    expect(res.status).toBe(400);
    await rowB.reload();
    expect(rowB.quantity_remaining).toBe(110);
    await mixedValidItem.reload();
    expect(mixedValidItem.quantity_remaining).toBe(30);
    await mixedValidReturnItem.reload();
    expect(mixedValidReturnItem.status).toBe('Pending');
    expect(await returnedHistoryCount()).toBe(historyBefore);
  }, 10000);

  it('re-granting an already returned request credits nothing further', async () => {
    const historyBefore = await returnedHistoryCount();
    const res = await grant(grantedBody(returnItem, sourcedItem));
    expect(res.status).toBe(201);
    await rowB.reload();
    expect(rowB.quantity_remaining).toBe(110);
    await sourcedItem.reload();
    expect(sourcedItem.quantity_remaining).toBe(30 - q);
    expect(await returnedHistoryCount()).toBe(historyBefore);
  }, 10000);

  it('a failed grant leaves quantity history and request state unchanged', async () => {
    const historyBefore = await returnedHistoryCount();
    const bogusId = 99999999;
    const res = await grant([
      {
        id: bogusId,
        inventory_item_id: mixedValidItem.id,
        quantity: q,
        status: 'Granted',
      },
    ]);
    expect(res.status).toBeGreaterThanOrEqual(400);
    await rowB.reload();
    expect(rowB.quantity_remaining).toBe(110);
    await mixedValidItem.reload();
    expect(mixedValidItem.quantity_remaining).toBe(30);
    expect(await returnedHistoryCount()).toBe(historyBefore);
  }, 10000);

  it('two concurrent grants both land', async () => {
    const historyBefore = await returnedHistoryCount();
    const [res2, res3] = await Promise.all([
      grant(grantedBody(returnItem2, sourcedItem, 5)),
      grant(grantedBody(returnItem3, sourcedItem, 5)),
    ]);
    expect(res2.status).toBe(201);
    expect(res3.status).toBe(201);
    await rowB.reload();
    expect(rowB.quantity_remaining).toBe(120);
    await sourcedItem.reload();
    expect(sourcedItem.quantity_remaining).toBe(30 - q - 5 - 5);
    expect(await returnedHistoryCount()).toBe(historyBefore + 2);
  }, 15000);
});
