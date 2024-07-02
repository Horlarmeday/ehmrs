/* eslint-disable camelcase */
import { literal, Op, WhereOptions } from 'sequelize';
import {
  Drug,
  PharmacyStore,
  Unit,
  LaboratoryStore,
  DosageForm,
  Measurement,
  RoutesOfAdministration,
  PharmacyStoreHistory,
  Inventory,
  Staff,
  PharmacyStoreLog,
  InventoryItem,
  InventoryItemHistory,
} from '../../database/models';
import { DrugType } from '../../database/models/pharmacyStore';
import sequelizeConnection from '../../database/config/config';
import { HistoryType } from '../../database/models/inventoryItemHistory';
import { ItemsToReorder } from './types/pharmacy-item.types';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import { getAnInventory } from '../Inventory/inventory.repository';
import { lt } from 'lodash';
import { INVALID_INVENTORY, INVALID_QUANTITY } from '../Inventory/messages/response-messages';

/** ***********************
 * PHARMACY STORE
 ********************** */

/**
 * create a cash pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createCashItem(data) {
  const {
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    unit_id,
    unit_price,
    selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
  } = data;

  return PharmacyStore.create({
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    quantity_remaining: quantity_received,
    unit_id,
    unit_price,
    total_price: quantity_received * unit_price,
    selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
    drug_type: DrugType.CASH,
  });
}

/**
 * create a NHIS pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createNHISItem(data) {
  const {
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    unit_id,
    unit_price,
    nhis_selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
  } = data;

  return PharmacyStore.create({
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    quantity_remaining: quantity_received,
    unit_id,
    unit_price,
    total_price: quantity_received * unit_price,
    selling_price: nhis_selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
    drug_type: DrugType.NHIS,
  });
}

/**
 * create a Private pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createPrivateItem(data) {
  const {
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    unit_id,
    unit_price,
    private_selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    brand,
    drug_form,
  } = data;

  return PharmacyStore.create({
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    quantity_remaining: quantity_received,
    unit_id,
    unit_price,
    total_price: quantity_received * unit_price,
    selling_price: private_selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
    drug_type: DrugType.PRIVATE,
  });
}

/**
 * get pharmacy items drugs
 *
 * @function
 * @returns {json} json object with items data
 * @param selectedItemsId
 */
export async function findPharmacyStoreItems(selectedItemsId: number[]) {
  return PharmacyStore.findAll({
    where: { id: selectedItemsId },
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
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
      {
        model: RoutesOfAdministration,
        attributes: ['name', 'id'],
      },
    ],
  });
}

/**
 * get all pharmacy items drugs
 *
 * @function
 * @returns {json} json object with items data
 */
export async function getAllPharmacyStoreItems() {
  return PharmacyStore.findAll({
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
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
      {
        model: RoutesOfAdministration,
        attributes: ['name', 'id'],
      },
    ],
  });
}

/**
 * search pharmacy items
 *
 * @function
 * @returns {json} json object with pharmacy items data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchPharmacyStoreItems(currentPage = 1, pageLimit = 10, search) {
  return PharmacyStore.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
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
      {
        model: RoutesOfAdministration,
        attributes: ['name', 'id'],
      },
    ],
  });
}

/**
 * get pharmacy items drugs
 *
 * @function
 * @returns {json} json object with items data
 * @param currentPage
 * @param pageLimit
 * @param sort_by
 * @param order
 * @param filter
 */
export async function getPharmacyStoreItems({
  currentPage = 1,
  pageLimit = 10,
  sort_by = 'createdAt',
  order = 'DESC',
  filter = '{}',
}) {
  return PharmacyStore.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: { ...JSON.parse(filter) },
    order:
      sort_by === 'name' ? [[{ model: Drug, as: 'drug' }, sort_by, order]] : [[sort_by, order]],
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
        model: DosageForm,
        attributes: ['name', 'id'],
      },
      {
        model: Measurement,
        attributes: ['name', 'id'],
      },
      {
        model: RoutesOfAdministration,
        attributes: ['name', 'id'],
      },
    ],
  });
}

export const getPharmacyStoreItemById = async (storeId: number) => {
  return await PharmacyStore.findByPk(storeId, {
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
        attributes: ['name', 'id'],
      },
      {
        model: DosageForm,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get a pharmacy store item by drugId
 *
 * @function
 * @returns {json} json object with item data
 * @param drugId
 */
export const getPharmacyItemByDrugId = async (drugId: number) => {
  return await PharmacyStore.findOne({ where: { drug_id: drugId } });
};

/**
 * get one pharmacy store item
 *
 * @function
 * @returns {Promise<PharmacyStore>} json object with pharmacy store item data
 * @param query
 */
export const getOnePharmacyStoreItem = async (
  query: WhereOptions<PharmacyStore>
): Promise<PharmacyStore> => {
  return PharmacyStore.findOne({ where: { ...query } });
};

/**
 * add a pharmacy store item history
 *
 * @function
 * @returns {json} json object with item history data
 * @param item
 */
export const addStoreItemHistory = async (item): Promise<PharmacyStoreHistory> => {
  return PharmacyStoreHistory.create({ ...item });
};

/**
 * update a pharmacy store item
 *
 * @function
 * @returns {Promise<[affectedCount: number]>} json object with item data
 * @param query
 * @param fieldsToUpdate
 */
export const updatePharmacyStoreItem = async (query: any, fieldsToUpdate: any) => {
  return await PharmacyStore.update({ ...fieldsToUpdate }, { where: { ...query } });
};

/**
 * update a pharmacy store item
 *
 * @function
 * @returns {Promise<[affectedCount: number]>} json object with item data
 * @param fieldsToUpdate
 */
export const updatePharmacyStoreItems = async (fieldsToUpdate: Partial<PharmacyStore>[]) => {
  return await Promise.all(
    fieldsToUpdate.map(async field => {
      return await sequelizeConnection.transaction(async t => {
        await PharmacyStore.update({ ...field }, { where: { id: field.id }, transaction: t });

        const inventoryItemToUpdate = {
          selling_price: field.selling_price,
          acquired_price: field.total_price,
          product_code: field.product_code,
          measurement_id: field.measurement_id,
          dosage_form_id: field.dosage_form_id,
          expiration: field.expiration,
          unit_id: field.unit_id,
          strength_input: field.strength_input,
          drug_form: field.drug_form,
          drug_type: field.drug_type,
          brand: field.brand,
        };

        await InventoryItem.update(
          { ...inventoryItemToUpdate },
          {
            where: {
              drug_id: field.drug_id,
              drug_type: field.drug_type,
              drug_form: field.drug_form,
            },
            transaction: t,
          }
        );
        return inventoryItemToUpdate;
      });
    })
  );
};

/**
 * get pharmacy store item history
 *
 * @function
 * @returns {json} json object with item history data
 * @param currentPage
 * @param pageLimit
 * @param sort_by
 * @param filter
 */
export const getPharmacyStoreItemHistory = async ({
  currentPage = 1,
  pageLimit = 10,
  filter = '{}',
  storeId,
}) => {
  return PharmacyStoreHistory.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: { pharmacy_store_id: storeId, ...JSON.parse(filter) },
    order: [['history_date', 'DESC']],
    include: [
      {
        model: Inventory,
        attributes: ['name'],
      },
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: Staff,
        as: 'receiver',
        attributes: ['firstname', 'lastname'],
      },
      {
        model: Staff,
        as: 'dispenser',
        attributes: ['firstname', 'lastname'],
      },
    ],
  });
};

/**
 * create a pharmacy store item log
 * @returns {object} item data
 */
export const createPharmacyStoreLogs = async (item): Promise<PharmacyStoreLog> => {
  return await PharmacyStoreLog.create({ ...item });
};

/**
 * get pharmacy store item logs
 *
 * @function
 * @returns {json} json object with item logs data
 * @param currentPage
 * @param pageLimit
 * @param sort_by
 */
export const getPharmacyStoreItemLogs = async ({ currentPage = 1, pageLimit = 10, storeId }) => {
  return PharmacyStoreLog.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: { pharmacy_store_id: storeId },
    order: [['date_received', 'DESC']],
    include: [
      {
        model: Unit,
        attributes: ['name', 'id'],
      },
      {
        model: Staff,
        attributes: ['firstname', 'lastname'],
      },
    ],
  });
};

/**
 * reorder pharmacy items
 *
 * @function
 * @returns {json} json object with item logs data
 * @param items
 * @param staff_id
 */
export const reorderPharmacyItems = async (items: ItemsToReorder[], staff_id: number) => {
  try {
    for await (const item of items) {
      const storeItem = await getPharmacyStoreItemById(item.id);
      const { id, ...rest } = storeItem.toJSON();

      await sequelizeConnection.transaction(async t => {
        await PharmacyStoreLog.create(
          { ...rest, pharmacy_store_id: item.id, staff_id },
          { transaction: t }
        );

        await PharmacyStore.update(
          {
            ...item,
            quantity_remaining: +storeItem.quantity_remaining + +item.quantity_received,
          },
          { where: { id: item.id }, transaction: t }
        );

        await PharmacyStoreHistory.create(
          {
            quantity_supplied: item?.quantity_received,
            pharmacy_store_id: storeItem.id,
            quantity_remaining: +storeItem.quantity_remaining + +item.quantity_received,
            unit_id: storeItem.unit_id,
            dispensed_by: staff_id,
            history_date: Date.now(),
            history_type: HistoryType.SUPPLIED,
          },
          { transaction: t }
        );
      });
    }
  } catch (e) {
    throw new BadException('Invalid', 400, e?.message);
  }
};

const dispenseValidations = async (item: ItemsToDispensedBody) => {
  const [storeItem, inventory] = await Promise.all([
    getPharmacyStoreItemById(item.id),
    getAnInventory(item.dispensary),
  ]);
  if (lt(storeItem.quantity_remaining, item.quantity_to_dispense)) {
    throw new BadException('Invalid', 400, INVALID_QUANTITY.replace('drug', item.drug_name));
  }

  if (!inventory.accepted_drug_type.includes(storeItem.drug_type)) {
    const matchObj = {
      drug: item.drug_name,
      inventory: inventory.name,
    };
    throw new BadException(
      'Invalid',
      400,
      INVALID_INVENTORY.replace(/drug|inventory/gi, function(matched) {
        return matchObj[matched];
      })
    );
  }
  return storeItem;
};

const mapInventoryItem = (
  storeItem: PharmacyStore,
  item: ItemsToDispensedBody,
  staff_id: number
) => ({
  inventory_id: item.dispensary,
  drug_id: storeItem.drug_id,
  quantity_received: item.quantity_to_dispense,
  unit_id: item.unit_id,
  selling_price: storeItem.selling_price,
  acquired_price: storeItem.unit_price,
  expiration: storeItem.expiration,
  dosage_form_id: storeItem.dosage_form_id,
  measurement_id: storeItem.measurement_id,
  strength_input: storeItem.strength_input,
  quantity_remaining: item.quantity_to_dispense,
  drug_form: storeItem.drug_form,
  drug_type: storeItem.drug_type,
  brand: storeItem.brand,
  date_received: Date.now(),
  staff_id,
});

const mapInventoryItemHistory = (
  item: ItemsToDispensedBody,
  inventoryItem: InventoryItem,
  staff_id: number
) => ({
  quantity_supplied: item.quantity_to_dispense,
  quantity_remaining: inventoryItem.quantity_remaining,
  inventory_item_id: inventoryItem.id,
  inventory_id: inventoryItem.inventory_id,
  unit_id: item.unit_id,
  item_receiver: item.receiver,
  staff_id,
  history_date: Date.now(),
  history_type: HistoryType.SUPPLIED,
});

const mapDispenseStoreItemHistory = (
  item: ItemsToDispensedBody,
  storeItem: PharmacyStore,
  staff_id: number
) => ({
  quantity_dispensed: item?.quantity_to_dispense,
  pharmacy_store_id: storeItem.id,
  quantity_remaining: +storeItem.quantity_remaining - +item.quantity_to_dispense,
  inventory_id: item.dispensary,
  unit_id: item.unit_id,
  item_receiver: item.receiver,
  dispensed_by: staff_id,
  history_date: Date.now(),
  history_type: HistoryType.DISPENSED,
});

/**
 * dispense pharmacy items
 * @param items
 * @param staff_id
 */
export const dispensePharmacyItems = async (items: ItemsToDispensedBody[], staff_id: number) => {
  for await (const item of items) {
    const storeItem = await dispenseValidations(item);
    const mappedItem = mapInventoryItem(storeItem, item, staff_id);

    await sequelizeConnection.transaction(async t => {
      const [inventoryItem, created] = await InventoryItem.findOrCreate({
        where: { drug_id: mappedItem.drug_id, inventory_id: mappedItem.inventory_id },
        defaults: { ...mappedItem },
        transaction: t,
      });

      if (!created) {
        await InventoryItem.update(
          {
            ...mappedItem,
            quantity_remaining: literal(`quantity_remaining + ${mappedItem.quantity_remaining}`),
            quantity_received: literal(`quantity_received + ${mappedItem.quantity_remaining}`),
          },
          {
            where: { drug_id: mappedItem.drug_id, inventory_id: mappedItem.inventory_id },
            transaction: t,
          }
        );
      }

      await InventoryItemHistory.create(mapInventoryItemHistory(item, inventoryItem, staff_id), {
        transaction: t,
      });
      await PharmacyStoreHistory.create(mapDispenseStoreItemHistory(item, storeItem, staff_id), {
        transaction: t,
      });
      await PharmacyStore.update(
        { quantity_remaining: storeItem.quantity_remaining - item.quantity_to_dispense },
        { where: { id: storeItem.id }, transaction: t }
      );
      return inventoryItem;
    });
  }
};

/** ***********************
 * LABORATORY STORE
 ********************** */

/**
 * create a laboratory item
 * @param data
 * @returns {object} item data
 */
export async function createLaboratoryItem(data) {
  const {
    name,
    shelf,
    product_code,
    batch,
    voucher,
    quantity,
    unit_id,
    unit_price,
    expiration,
    staff_id,
    date_received,
  } = data;

  return LaboratoryStore.create({
    name,
    shelf,
    product_code,
    batch,
    voucher,
    quantity,
    remain_quantity: quantity,
    unit_id,
    unit_price,
    total_price: quantity * unit_price,
    expiration,
    staff_id,
    date_received,
  });
}

/**
 * search laboratory items
 *
 * @function
 * @returns {json} json object with laboratory items data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchLaboratoryItems(currentPage = 1, pageLimit = 10, search) {
  return LaboratoryStore.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      name: `%${search}%`,
    },
    include: [
      {
        model: Unit,
        as: 'unit',
        attributes: ['name'],
      },
    ],
  });
}

/**
 * get laboratory items
 *
 * @function
 * @returns {json} json object with laboratory items data
 * @param currentPage
 * @param pageLimit
 */
export async function getLaboratoryItems(currentPage = 1, pageLimit = 10) {
  return LaboratoryStore.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Unit,
        attributes: ['name'],
      },
    ],
  });
}
