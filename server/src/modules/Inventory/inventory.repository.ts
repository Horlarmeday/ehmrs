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
} from '../../database/models';

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

export const getInventoryItemById = async (inventoryId: number) => {
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

export const getInventoryItemByDrugId = async (drugId: number) => {
  return await InventoryItem.findOne({ where: { drug_id: drugId } });
};

export const getInventoryItemQuery = async (query: WhereOptions<InventoryItem>) => {
  return await InventoryItem.findOne({
    where: { ...query },
    include: [{ model: Drug, attributes: ['name'] }],
  });
};

export const addItemToInventory = async (item: Optional<any, string>) => {
  const [inventoryItem, created] = await InventoryItem.findOrCreate({
    where: { drug_id: item.drug_id, inventory_id: item.inventory_id },
    defaults: { ...item },
  });

  if (!created) {
    await InventoryItem.update(
      {
        ...item,
        quantity_remaining: literal(`quantity_remaining + ${item.quantity_remaining}`),
        quantity_received: literal(`quantity_received + ${item.quantity_remaining}`),
      },
      { where: { drug_id: item.drug_id, inventory_id: item.inventory_id } }
    );
  }

  return inventoryItem;
};

export const addInventoryItemHistory = async (item): Promise<InventoryItemHistory> => {
  return InventoryItemHistory.create({
    ...item,
  });
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
