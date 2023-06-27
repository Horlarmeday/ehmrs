import { Op } from 'sequelize';

import {
  Unit,
  Measurement,
  DosageForm,
  Drug,
  Inventory,
  InventoryItem,
} from '../../database/models';
import { InventoryTypes } from './types/inventory.types';

export const inventories = {
  Inventory,
  InventoryItem,
};

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
 * @returns {object} inventory product data
 */
export async function receiveBulkItem(data) {
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

/**
 * create an inventory
 * @param data
 * @returns {object} inventory product data
 */
export const createInventory = (data: Partial<Inventory>) => {
  return Inventory.create(data);
};

/**
 * get list of all inventories
 * @returns {object} inventory product data
 */
export const getInventories = async () => {
  return Inventory.findAll();
};

/**
 * get an inventory
 * @returns {object} inventory product data
 */
export const getAnInventory = async (inventoryId: number) => {
  return Inventory.findOne({ where: { id: inventoryId } });
};
