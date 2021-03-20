/* eslint-disable camelcase */
import { Sequelize } from 'sequelize';
import { generateRandomNumbers } from '../../helpers/helper';
import { getModelById } from '../AdminSettings/admin.repository';
import Constants from '../../config/constants';

const { Drug, PharmacyItem, Unit } = require('../../database/models');

const { Op } = Sequelize;

/** ***********************
 * PHARMACY STORE
 ********************** */

/**
 * create a generic drug
 * @param data
 * @returns {object} generic drug data
 */
export async function createGenericDrug(data) {
  const { name, type, staff_id } = data;

  return Drug.create({
    name,
    staff_id,
    type,
    code: `D${generateRandomNumbers(6)}`,
  });
}

/**
 * update a generic drug
 * @param data
 * @returns {object} generic drug data
 */
export async function updateGenericDrug(data) {
  const { drug_id } = data;
  const drug = await getModelById(Drug, drug_id);
  return drug.update(data);
}

/**
 * search generic drugs
 *
 * @function
 * @returns {json} json object with generic drugs data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchGenericDrugs(currentPage = 1, pageLimit = 10, search) {
  return Drug.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          code: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    },
  });
}

/**
 * get generic drugs
 *
 * @function
 * @returns {json} json object with departments data
 * @param currentPage
 * @param pageLimit
 */
export async function getGenericDrugs(currentPage = 1, pageLimit = 10) {
  return Drug.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

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
    dosage_form,
    staff_id,
    date_received,
    strength,
    strength_input,
    route,
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
    dosage_form,
    staff_id,
    date_received,
    strength,
    strength_input,
    route,
    drug_form,
    drug_type: Constants.CASH,
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
    dosage_form,
    staff_id,
    date_received,
    strength,
    strength_input,
    route,
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
    dosage_form,
    staff_id,
    date_received,
    strength,
    strength_input,
    route,
    drug_form,
    drug_type: Constants.NHIS,
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
    ],
  });
}
