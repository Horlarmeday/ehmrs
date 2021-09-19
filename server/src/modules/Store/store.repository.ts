/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { CASH, NHIS } from '../../core/constants';

const { Drug, PharmacyItem, Unit, LabItem, DosageForm, Measurement, RouteOfAdministration } = require('../../database/models');

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
    quantity,
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
  } = data;

  return PharmacyItem.create({
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity,
    remain_quantity: quantity,
    unit_id,
    unit_price,
    total_price: quantity * unit_price,
    selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    drug_type: CASH,
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
    quantity,
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
  } = data;

  return PharmacyItem.create({
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity,
    remain_quantity: quantity,
    unit_id,
    unit_price,
    total_price: quantity * unit_price,
    selling_price: nhis_selling_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    drug_type: NHIS,
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
export async function searchPharmacyItems(currentPage = 1, pageLimit = 10, search) {
  return PharmacyItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
        as: 'drug',
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      },
      {
        model: Unit,
        as: 'unit',
        attributes: ['name'],
      },
      {
        model: DosageForm,
        as: 'dosage_form',
        attributes: ['name'],
      },
      {
        model: Measurement,
        as: 'strength',
        attributes: ['name'],
      },
      {
        model: RouteOfAdministration,
        as: 'route',
        attributes: ['name'],
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
 */
export async function getPharmacyItems(
  currentPage = 1,
  pageLimit = 10,
  sort_by = 'createdAt',
  order = 'DESC'
) {
  return PharmacyItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [[sort_by, order]],
    include: [
      {
        model: Drug,
        as: 'drug',
        attributes: ['name'],
      },
      {
        model: Unit,
        as: 'unit',
        attributes: ['name'],
      },
      {
        model: DosageForm,
        as: 'dosage_form',
        attributes: ['name'],
      },
      {
        model: Measurement,
        as: 'strength',
        attributes: ['name'],
      },
      {
        model: RouteOfAdministration,
        as: 'route',
        attributes: ['name'],
      },
    ],
  });
}

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

  return LabItem.create({
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
  return LabItem.paginate({
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
  return LabItem.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Unit,
        as: 'unit',
        attributes: ['name'],
      },
    ],
  });
}
