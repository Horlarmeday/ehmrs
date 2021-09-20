import { Op } from 'sequelize';

const {
  Unit,
  Measurement,
  DosageForm,
  Drug,
  OutpatientInventory,
  InpatientInventory,
  NhisInpatientInventory,
  NhisOutpatientInventory,
} = require('../../database/models');

export const inventories = {
  OutpatientInventory,
  InpatientInventory,
  NhisOutpatientInventory,
  NhisInpatientInventory,
};

/**
 * receive product(s) into the inventory
 * @param inventory
 * @param data
 * @returns {object} inventory product data
 */
export async function receiveItem(inventory, data) {
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
  } = data;
  return inventory.create({
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
  });
}

/**
 * receive bulk item(s) into the inventory
 * @param inventory
 * @param data
 * @returns {object} inventory product data
 */
export async function receiveBulkItem(inventory, data) {
  return inventories[inventory].bulkCreate(data);
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
  return inventories[inventory].paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
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
 */
export async function searchInventoryItems({ inventory, currentPage = 1, pageLimit = 10, search }) {
  return inventory.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
        as: 'drug',
        attributes: ['name'],
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
    ],
  });
}
