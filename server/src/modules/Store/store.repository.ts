/* eslint-disable camelcase */
import { Op, WhereOptions } from 'sequelize';
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
} from '../../database/models';
import { DrugType } from '../../database/models/pharmacyStore';

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
