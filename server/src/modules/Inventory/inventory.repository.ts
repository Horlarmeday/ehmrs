import sequelize, { literal, Op, Optional, WhereOptions } from 'sequelize';

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
import sequelizeConnection from '../../database/config/config';
import { HistoryType } from '../../database/models/inventoryItemHistory';
import { getOnePharmacyStoreItem, getPharmacyStoreItemById } from '../Store/store.repository';
import { Status } from '../../database/models/returnItem';

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
 */
export async function getInventoryItems({ inventory, currentPage = 1, pageLimit = 10 }) {
  return InventoryItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      inventory_id: inventory,
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
  pageLimit = 10,
  search,
  filter = null,
}) {
  return InventoryItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    where: {
      inventory_id: inventory,
      ...(filter && { ...JSON.parse(filter) }),
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
        attributes: ['firstname', 'lastname'],
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

  if (declinedRequests?.length) {
    const declinedRequestIds = declinedRequests.map(item => item.id);
    await ReturnItem.update({ status: Status.DECLINED }, { where: { id: declinedRequestIds } });
  }

  for await (const item of grantedRequests) {
    // find the inventory item
    const inventoryItem = await getInventoryItemQuery({ id: item.inventory_item_id });
    const [storeItem, returnItem] = await Promise.all([
      getOnePharmacyStoreItem({
        drug_id: inventoryItem.drug_id,
        drug_type: inventoryItem.drug_type,
        drug_form: inventoryItem.drug_form,
      }),
      ReturnItem.findOne({ where: { id: item.id } }),
    ]);

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
          where: {
            drug_id: inventoryItem.drug_id,
            drug_type: inventoryItem.drug_type,
            drug_form: inventoryItem.drug_form,
          },
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
      // update teh return items status to RETURNED
      await ReturnItem.update({ status: Status.RETURNED }, { where: { id: item.id } });
    });
  }
};
