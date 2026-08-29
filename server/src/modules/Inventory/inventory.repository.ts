import sequelize, { literal, Op, WhereOptions, QueryTypes } from 'sequelize';
import {
  Unit,
  Measurement,
  DosageForm,
  Drug,
  Inventory,
  InventoryItem,
  InventoryItemHistory,
  Staff,
  Patient,
  ReturnItem,
  PharmacyStore,
  PharmacyStoreHistory,
} from '../../database/models';
import { RequestReturnToStore, UpdateReturnRequest } from './types/inventory.types';
import { dateIntervalQuery, staffAttributes } from '../../core/helpers/helper';
import { sequelizeConnection } from '../../database/config/data-source';
import {
  HistoryType,
  ReturnItemStatus as Status,
  Status as InventoryItemStatus,
} from '../../database/enums';
import { BadException } from '../../common/util/api-error';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

/**
 * receive product(s) into the inventory
 * @param data
 * @returns {object} inventory product data
 */
export async function receiveItem(data) {
  const {
    drug_id,
    quantity,
    unit_id,
    selling_price,
    price,
    expiration,
    dosage_form_id,
    measurement_id,
    strength_input,
    staff_id,
    drug_form,
    drug_type,
    date_received,
    inventory_id,
  } = data;
  return InventoryItem.create({
    drug_id,
    quantity_received: quantity,
    unit_id,
    selling_price,
    price,
    expiration,
    dosage_form_id,
    measurement_id,
    strength_input,
    staff_id,
    drug_form,
    drug_type,
    date_received,
    inventory_id,
  });
}

/**
 * receive bulk item(s) into the inventory
 * @param data
 * @returns {Promise<InventoryItem[]>} inventory product data
 */
export async function receiveBulkItem(data): Promise<InventoryItem[]> {
  return InventoryItem.bulkCreate(data);
}

/**
 * get pharmacy items drugs
 *
 * @function
 * @returns {json} json object with items data
 * @param inventory
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function getInventoryItems({
  inventory,
  currentPage = 1,
  pageLimit = 10,
  filter = null,
}) {
  return InventoryItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      inventory_id: inventory,
      ...(!isEmpty(filter) && filter),
    },
    include: [
      {
        model: Drug,
        order: [['name', 'ASC']],
        attributes: ['name', 'id'],
      },
      {
        model: Unit,
        attributes: ['name'],
      },
      {
        model: DosageForm,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name', 'id'],
      },
    ],
  });
}

/**
 * search/filter pharmacy items drugs
 *
 * @function
 * @returns {json} json object with items data
 * @param inventory
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param filter
 */
export async function searchInventoryItems({
  inventory,
  currentPage = 1,
  pageLimit = 50,
  search,
  filter = null,
}) {
  return InventoryItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['quantity_remaining', 'DESC']],
    where: {
      inventory_id: inventory,
      ...(!isEmpty(filter) && filter),
    },
    include: [
      {
        model: Drug,
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      },
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: DosageForm,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name', 'id'],
      },
    ],
  });
}

/**
 * create an inventory
 * @param data
 * @returns {Inventory} inventory product data
 */
export const createInventory = (data: Partial<Inventory>): Promise<Inventory> => {
  return Inventory.create(data);
};

/**
 * get list of all inventories
 * @returns {Promise<Inventory[]>} inventory product data
 */
export const getInventories = async (): Promise<Inventory[]> => {
  return Inventory.findAll();
};

/**
 * get an inventory
 * @returns {Inventory} inventory product data
 */
export const getAnInventory = async (inventoryId: number): Promise<Inventory> => {
  return Inventory.findOne({ where: { id: inventoryId } });
};

/**
 * get one inventory item
 * @returns {Inventory} inventory product data
 * @param inventoryId
 */
export const getInventoryItemById = async (inventoryId: number): Promise<InventoryItem> => {
  return await InventoryItem.findByPk(inventoryId, {
    include: [
      {
        model: Drug,
        attributes: ['name'],
      },
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name'],
      },
      {
        model: DosageForm,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get an inventory item drug id
 * @returns {Inventory} inventory item data
 * @param drugId
 */
export const getInventoryItemByDrugId = async (drugId: number): Promise<InventoryItem> => {
  return await InventoryItem.findOne({ where: { drug_id: drugId } });
};

/**
 * get inventory item query
 * @param data
 * @returns {Inventory} inventory item data
 */
export const getInventoryItemQuery = async (query: WhereOptions<InventoryItem>) => {
  return await InventoryItem.findOne({
    where: { ...query },
    include: [{ model: Drug, attributes: ['name'] }],
  });
};

/**
 * Every dispensary layer of a drug in an inventory, soonest expiry first (FEFO — ADR-0009: even a
 * weighted-average tenant dispenses the soonest-expiring batch first). The dispensary is
 * multi-layer: one row per originating store batch, so a drug+inventory key matches N rows.
 */
export const getInventoryItemLayers = async (
  inventory_id: number,
  drug_id: number
): Promise<InventoryItem[]> => {
  return InventoryItem.findAll({
    where: { inventory_id, drug_id },
    order: [
      ['expiration', 'ASC'],
      ['createdAt', 'ASC'],
    ],
    include: [{ model: Drug, attributes: ['name'] }],
  });
};

export const sumLayerQuantityRemaining = (layers: InventoryItem[]): number =>
  layers.reduce((total, layer) => total + Number(layer.quantity_remaining), 0);

/**
 * update an inventory item
 * @param data
 * @returns {Inventory} inventory product data
 */
export const updateInventoryItem = (data: Partial<InventoryItem>) => {
  const { id, ...rest } = data;
  return InventoryItem.update({ ...rest }, { where: { id } });
};

export const getQuantitySum = async (
  fieldToSum: string,
  query: sequelize.WhereOptions<InventoryItemHistory>
) => {
  return InventoryItemHistory.sum(fieldToSum, { where: { ...query } });
};

/**
 * get pharmacy store item history
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with item history data
 * @param currentPage
 * @param pageLimit
 * @param sort_by
 * @param filter
 */
export const getInventoryItemHistory = async ({
  currentPage = 1,
  pageLimit = 10,
  filter = '{}',
  inventoryItemId,
}): Promise<{
  currentPage: number;
  docs: InventoryItemHistory[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return InventoryItemHistory.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: { inventory_item_id: inventoryItemId, ...JSON.parse(filter) },
    order: [['history_date', 'DESC']],
    include: [
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: Staff,
        attributes: ['firstname', 'lastname'],
      },
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id'],
      },
    ],
  });
};

/**
 * request a return to the store
 * @param data
 * @param staff_id
 * @returns {ReturnItem} inventory items data
 */
export const requestReturnDrugsToStore = async (
  data: RequestReturnToStore[],
  staff_id: number
): Promise<ReturnItem[]> => {
  const mappedData = data.map(drug => ({
    ...drug,
    date_received: Date.now(),
    staff_id,
  }));
  return ReturnItem.bulkCreate(mappedData);
};

/**
 * get inventory return requests
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with return items data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 */
export const getInventoryReturnRequests = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}): Promise<{
  currentPage: number;
  docs: InventoryItemHistory[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return ReturnItem.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_received', 'DESC']],
    ...(start && end && dateIntervalQuery('date_received', start, end)),
    include: [
      {
        model: InventoryItem,
        attributes: ['drug_id', 'unit_id', 'dosage_form_id', 'measurement_id', 'strength_input'],
        include: [
          {
            model: Drug,
            attributes: ['name'],
            ...(search && {
              where: {
                name: {
                  [Op.like]: `%${search}%`,
                },
              },
            }),
          },
          { model: Unit, attributes: ['name'] },
          { model: DosageForm, attributes: ['name'] },
          { model: Measurement, attributes: ['name'] },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
};

/**
 * update a return request to the store
 * @param items
 * @param staff_id
 * @returns {Promise<void>} inventory items data
 */
export const updateReturnRequests = async (
  items: UpdateReturnRequest[],
  staff_id: number
): Promise<void> => {
  const declinedRequests = items.filter(item => item.status === 'Declined');
  const grantedRequests = items.filter(item => item.status === 'Granted');

  const grants = (
    await Promise.all(
      grantedRequests.map(async item => ({
        item,
        inventoryItem: await getInventoryItemQuery({ id: item.inventory_item_id }),
        returnItem: await ReturnItem.findOne({ where: { id: item.id } }),
      }))
    )
  ).filter(({ returnItem }) => returnItem?.status !== Status.RETURNED);

  const unsourced = grants.filter(({ inventoryItem }) => !inventoryItem?.pharmacy_store_id);
  if (unsourced.length) {
    throw new BadException(
      'INVALID_REQUEST',
      400,
      `Cannot return to store: no source batch recorded for inventory item(s) ${unsourced
        .map(({ item }) => item.inventory_item_id)
        .join(', ')}. These were dispensed before batch tracking and must be reconciled manually.`
    );
  }

  if (declinedRequests?.length) {
    const declinedRequestIds = declinedRequests.map(item => item.id);
    await ReturnItem.update({ status: Status.DECLINED }, { where: { id: declinedRequestIds } });
  }

  for await (const { item, inventoryItem, returnItem } of grants) {
    const storeItem = await PharmacyStore.findByPk(inventoryItem.pharmacy_store_id);
    if (!storeItem) {
      throw new BadException(
        'NOT_FOUND',
        404,
        `Source batch ${inventoryItem.pharmacy_store_id} no longer exists in the store`
      );
    }

    await sequelizeConnection.transaction(async t => {
      // update the inventory item quantity_remaining
      await InventoryItem.update(
        {
          quantity_remaining: literal(`quantity_remaining - ${+item.quantity}`),
        },
        {
          where: { id: inventoryItem.id },
          transaction: t,
        }
      );
      // add it to inventory item history
      await InventoryItemHistory.create(
        {
          quantity_returned: item.quantity,
          quantity_remaining: inventoryItem.quantity_remaining - +item.quantity,
          inventory_item_id: inventoryItem.id,
          inventory_id: inventoryItem.inventory_id,
          unit_id: inventoryItem.unit_id,
          pharmacy_store_id: inventoryItem.pharmacy_store_id,
          staff_id,
          history_date: Date.now(),
          history_type: HistoryType.RETURNED,
          reason_for_return: returnItem.reason_for_return,
        },
        { transaction: t }
      );
      // update/add to the pharmacy store quantity_remaining and the quantity_returned
      await PharmacyStore.update(
        {
          quantity_remaining: literal(`quantity_remaining + ${+item.quantity}`),
        },
        {
          where: { id: storeItem.id },
          transaction: t,
        }
      );
      // add to pharmacy store history
      await PharmacyStoreHistory.create(
        {
          quantity_returned: item?.quantity,
          pharmacy_store_id: storeItem.id,
          quantity_remaining: +storeItem.quantity_remaining + +item.quantity,
          inventory_id: inventoryItem.inventory_id,
          unit_id: inventoryItem.unit_id,
          dispensed_by: staff_id,
          history_date: Date.now(),
          history_type: HistoryType.RETURNED,
        },
        { transaction: t }
      );
      // update the return items status to RETURNED
      await ReturnItem.update(
        { status: Status.RETURNED },
        { where: { id: item.id }, transaction: t }
      );
    });
  }
};

/**
 * get all inventory items for export
 * @param inventoryId
 * @returns {Promise<InventoryItem[]>} inventory items data
 */
export const getAllInventoryItems = async (inventoryId: number): Promise<InventoryItem[]> => {
  return InventoryItem.findAll({
    where: { inventory_id: inventoryId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
        attributes: ['name', 'id'],
      },
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: DosageForm,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name', 'id'],
      },
    ],
  });
};

/**
 * get selected inventory items for export
 * @param selectedItemIds
 * @returns {Promise<InventoryItem[]>} inventory items data
 */
export const getSelectedInventoryItems = async (
  selectedItemIds: number[]
): Promise<InventoryItem[]> => {
  return InventoryItem.findAll({
    where: { id: selectedItemIds },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
        attributes: ['name', 'id'],
      },
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: DosageForm,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name', 'id'],
      },
    ],
  });
};

/**
 * get inventory statistics
 * @param inventoryId
 * @returns {Promise<object>} inventory statistics data
 */
export const getInventoryStatistics = async (inventoryId: number) => {
  const inventory = await getAnInventory(inventoryId);
  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const today = dayjs().toDate();
  const thirtyDaysFromNow = dayjs()
    .add(30, 'day')
    .toDate();

  // Total Items
  const totalItems = await InventoryItem.count({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
    },
  });

  // Expiring Soon (within 30 days)
  const expiringSoon = await InventoryItem.count({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
      expiration: {
        [Op.between]: [today, thirtyDaysFromNow],
      },
    },
  });

  // Low Stock (quantity_remaining < inventory.refill_level)
  const lowStock = await InventoryItem.count({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
      quantity_remaining: {
        [Op.lt]: inventory.refill_level || 0,
      },
    },
  });

  // Critical Stock (quantity_remaining < 5)
  const criticalStock = await InventoryItem.count({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
      quantity_remaining: {
        [Op.lt]: 5,
      },
    },
  });

  // Total Valuations (sum of quantity_remaining * selling_price)
  const totalValuationsResult = ((await InventoryItem.findAll({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
    },
    attributes: [
      [literal('COALESCE(SUM(quantity_remaining * selling_price), 0)'), 'total_valuations'],
    ],
    raw: true,
  })) as unknown) as { total_valuations: number }[];

  const totalValuations = totalValuationsResult[0]?.total_valuations || 0;

  // Expired Items
  const expiredItems = await InventoryItem.count({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
      expiration: {
        [Op.lt]: today,
      },
    },
  });

  // Most Dispensed Item (from InventoryItemHistory)
  const mostDispensedResult = ((await InventoryItemHistory.findAll({
    where: {
      inventory_id: inventoryId,
      history_type: HistoryType.DISPENSED,
    },
    attributes: ['inventory_item_id', [literal('SUM(quantity_dispensed)'), 'total_dispensed']],
    group: ['inventory_item_id'],
    order: [[literal('total_dispensed'), 'DESC']],
    limit: 1,
    raw: true,
  })) as unknown) as { inventory_item_id: number; total_dispensed: number }[];

  let mostDispensedItem = null;
  if (mostDispensedResult.length > 0) {
    const mostDispensedItemId = mostDispensedResult[0].inventory_item_id;
    mostDispensedItem = await InventoryItem.findByPk(mostDispensedItemId, {
      include: [
        {
          model: Drug,
          attributes: ['name', 'id'],
        },
      ],
    });
  }

  // Total Quantities (sum of quantity_remaining)
  const totalQuantitiesResult = ((await InventoryItem.findAll({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
    },
    attributes: [[literal('COALESCE(SUM(quantity_remaining), 0)'), 'total_quantities']],
    raw: true,
  })) as unknown) as { total_quantities: number }[];

  const totalQuantities = totalQuantitiesResult[0]?.total_quantities || 0;

  return {
    totalItems,
    expiringSoon,
    lowStock,
    criticalStock,
    totalValuations: parseFloat(totalValuations.toString()),
    expiredItems,
    mostDispensedItem: mostDispensedItem
      ? {
          id: mostDispensedItem.id,
          drug_name: mostDispensedItem.drug?.name || 'N/A',
          quantity_dispensed: mostDispensedResult[0]?.total_dispensed || 0,
        }
      : null,
    totalQuantities: parseInt(totalQuantities.toString(), 10),
  };
};
