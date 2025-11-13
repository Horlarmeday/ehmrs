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
  PrescribedDrug,
  PrescribedAdditionalItem,
  ReturnItem,
  PharmacyStore,
  PharmacyStoreHistory,
  Visit,
} from '../../database/models';
import {
  BulkInventoryTransferRequest,
  InventoryTransferRequest,
  RequestReturnToStore,
  UpdateReturnRequest,
} from './types/inventory.types';
import { calcLimitAndOffset, dateIntervalQuery, staffAttributes } from '../../core/helpers/helper';
import sequelizeConnection from '../../database/config/data-source';
import { HistoryType } from '../../database/models/inventoryItemHistory';
import { getOnePharmacyStoreItem } from '../Store/store.repository';
import { Status } from '../../database/models/returnItem';
import { Status as InventoryItemStatus } from '../../database/models/inventoryItem';
import { BadException } from '../../common/util/api-error';
import { AcceptedDrugType } from '../../database/models/inventory';
import { DrugType } from '../../database/models/pharmacyStore';
import { DispenseStatus } from '../../database/models/prescribedAdditionalItem';
import { DrugForm } from '../../database/models/drug';

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

/**
 * get inventory summary statistics
 *
 * @function
 * @returns {Promise<object>} json object with inventory summary statistics
 * @param inventoryId
 */
export const getInventorySummary = async (inventoryId: number): Promise<{
  total_items: number;
  total_quantity_remaining: number;
  low_stock_count: number;
  critical_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
  total_valuation: number;
  drug_type_breakdown: Record<string, number>;
}> => {
  const items = await InventoryItem.findAll({
    where: {
      inventory_id: inventoryId,
      status: InventoryItemStatus.ACTIVE,
    },
    include: [
      {
        model: Inventory,
        as: 'inventory',
        attributes: ['refill_level'],
      },
    ],
  });

  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  let totalQuantityRemaining = 0;
  let lowStockCount = 0;
  let criticalStockCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let totalValuation = 0;
  const drugTypeBreakdown: Record<string, number> = {};

  items.forEach(item => {
    const quantityRemaining = item.quantity_remaining || 0;
    const sellingPrice = parseFloat(item.selling_price?.toString() || '0');
    
    totalQuantityRemaining += quantityRemaining;
    totalValuation += quantityRemaining * sellingPrice;

    // Low stock check: use refill_level if set, otherwise default to 50
    const lowStockThreshold = item.inventory?.refill_level || 50;
    if (quantityRemaining < lowStockThreshold) {
      lowStockCount++;
    }

    // Critical stock: less than 20
    if (quantityRemaining < 20) {
      criticalStockCount++;
    }

    // Expiry checks
    if (item.expiration) {
      const expirationDate = new Date(item.expiration);
      if (expirationDate < today) {
        expiredCount++;
      } else if (expirationDate <= sixMonthsFromNow) {
        expiringSoonCount++;
      }
    }

    // Drug type breakdown
    const drugType = item.drug_type || 'Unknown';
    drugTypeBreakdown[drugType] = (drugTypeBreakdown[drugType] || 0) + 1;
  });

  return {
    total_items: items.length,
    total_quantity_remaining: totalQuantityRemaining,
    low_stock_count: lowStockCount,
    critical_stock_count: criticalStockCount,
    expiring_soon_count: expiringSoonCount,
    expired_count: expiredCount,
    total_valuation: totalValuation,
    drug_type_breakdown: drugTypeBreakdown,
  };
};

/**
 * transfer item from one inventory to another
 * @param data
 * @param staff_id
 * @returns {Promise<{sourceItem: InventoryItem, destinationItem: InventoryItem}>} transfer result
 */
export const transferItemBetweenInventories = async (
  data: InventoryTransferRequest,
  staff_id: number
): Promise<{ sourceItem: InventoryItem; destinationItem: InventoryItem }> => {
  const {
    source_inventory_item_id,
    destination_inventory_id,
    quantity,
    reason,
    notes,
  } = data;

  return await sequelizeConnection.transaction(async t => {
    // Get source item with full details
    const sourceItem = await InventoryItem.findByPk(source_inventory_item_id, {
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'name', 'accepted_drug_type'],
        },
        {
          model: Drug,
          attributes: ['id', 'name'],
        },
        {
          model: Unit,
          attributes: ['id', 'name'],
        },
      ],
      transaction: t,
    });

    if (!sourceItem) {
      throw new BadException('NOT_FOUND', 404, 'Source inventory item not found');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new BadException('INVALID', 400, 'Transfer quantity must be greater than 0');
    }

    if (sourceItem.quantity_remaining < quantity) {
      throw new BadException(
        'INVALID',
        400,
        `Insufficient quantity. Available: ${sourceItem.quantity_remaining}, Requested: ${quantity}`
      );
    }

    // Get destination inventory
    const destinationInventory = await Inventory.findByPk(destination_inventory_id, {
      transaction: t,
    });

    if (!destinationInventory) {
      throw new BadException('NOT_FOUND', 404, 'Destination inventory not found');
    }

    // Validate destination accepts the drug type
    const sourceDrugType = sourceItem.drug_type;
    const destinationAcceptedType = destinationInventory.accepted_drug_type;

    // Map DrugType enum values to AcceptedDrugType enum values
    const drugTypeToAcceptedTypeMap: Record<DrugType, AcceptedDrugType> = {
      [DrugType.CASH]: AcceptedDrugType.CASH,
      [DrugType.NHIS]: AcceptedDrugType.NHIS,
      [DrugType.PRIVATE]: AcceptedDrugType.PRIVATE,
      [DrugType.RETAINERSHIP]: AcceptedDrugType.RETAINERSHIP,
      [DrugType.PLASCHEMA]: AcceptedDrugType.PLASCHEMA,
    };

    const sourceAcceptedType = drugTypeToAcceptedTypeMap[sourceDrugType];

    // Check compatibility
    let isCompatible = false;
    
    if (destinationAcceptedType === AcceptedDrugType.ALL) {
      isCompatible = true;
    } else if (destinationAcceptedType === AcceptedDrugType.BOTH) {
      // BOTH means accepts both Cash and NHIS
      isCompatible =
        sourceAcceptedType === AcceptedDrugType.CASH || sourceAcceptedType === AcceptedDrugType.NHIS;
    } else {
      // Exact match required
      isCompatible = destinationAcceptedType === sourceAcceptedType;
    }

    if (!isCompatible) {
      throw new BadException(
        'INVALID',
        400,
        `Destination inventory does not accept ${sourceDrugType}. It accepts ${destinationAcceptedType}`
      );
    }

    // Prevent transferring to same inventory
    if (sourceItem.inventory_id === destination_inventory_id) {
      throw new BadException('INVALID', 400, 'Cannot transfer to the same inventory');
    }

    // Find or create destination item
    let destinationItem = await InventoryItem.findOne({
      where: {
        inventory_id: destination_inventory_id,
        drug_id: sourceItem.drug_id,
        drug_form: sourceItem.drug_form,
        drug_type: sourceItem.drug_type,
        dosage_form_id: sourceItem.dosage_form_id,
        measurement_id: sourceItem.measurement_id,
        strength_input: sourceItem.strength_input,
        status: InventoryItemStatus.ACTIVE,
      },
      transaction: t,
    });

    if (destinationItem) {
      // Update existing destination item
      destinationItem.quantity_received += quantity;
      destinationItem.quantity_remaining += quantity;
      await destinationItem.save({ transaction: t });
    } else {
      // Create new destination item
      destinationItem = await InventoryItem.create(
        {
          inventory_id: destination_inventory_id,
          drug_id: sourceItem.drug_id,
          quantity_received: quantity,
          quantity_remaining: quantity,
          unit_id: sourceItem.unit_id,
          selling_price: sourceItem.selling_price,
          acquired_price: sourceItem.acquired_price,
          expiration: sourceItem.expiration,
          dosage_form_id: sourceItem.dosage_form_id,
          measurement_id: sourceItem.measurement_id,
          strength_input: sourceItem.strength_input,
          drug_form: sourceItem.drug_form,
          drug_type: sourceItem.drug_type,
          date_received: new Date(),
          staff_id,
          status: InventoryItemStatus.ACTIVE,
        },
        { transaction: t }
      );
    }

    // Update source item
    const newQuantityRemaining = sourceItem.quantity_remaining - quantity;
    const newQuantityConsumed = (sourceItem.quantity_consumed || 0) + quantity;
    
    await InventoryItem.update(
      {
        quantity_remaining: newQuantityRemaining,
        quantity_consumed: newQuantityConsumed,
      },
      {
        where: { id: sourceItem.id },
        transaction: t,
      }
    );
    
    sourceItem.quantity_remaining = newQuantityRemaining;
    sourceItem.quantity_consumed = newQuantityConsumed;

    // Create history entry for source inventory (SUPPLIED)
    await InventoryItemHistory.create(
      {
        quantity_supplied: quantity,
        quantity_remaining: newQuantityRemaining,
        inventory_item_id: sourceItem.id,
        inventory_id: sourceItem.inventory_id,
        unit_id: sourceItem.unit_id,
        staff_id,
        history_date: new Date(),
        history_type: HistoryType.SUPPLIED,
        reason_for_return: reason || notes || 'Transfer to another inventory',
      },
      { transaction: t }
    );

    // Create history entry for destination inventory (SUPPLIED)
    await InventoryItemHistory.create(
      {
        quantity_supplied: quantity,
        quantity_remaining: destinationItem.quantity_remaining,
        inventory_item_id: destinationItem.id,
        inventory_id: destination_inventory_id,
        unit_id: destinationItem.unit_id,
        staff_id,
        history_date: new Date(),
        history_type: HistoryType.SUPPLIED,
        reason_for_return: reason || notes || `Transfer from ${sourceItem.inventory?.name || 'inventory'}`,
      },
      { transaction: t }
    );

    // Reload items with associations
    await sourceItem.reload({
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'name'],
        },
        {
          model: Drug,
          attributes: ['id', 'name'],
        },
        {
          model: Unit,
          attributes: ['id', 'name'],
        },
      ],
      transaction: t,
    });

    await destinationItem.reload({
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'name'],
        },
        {
          model: Drug,
          attributes: ['id', 'name'],
        },
        {
          model: Unit,
          attributes: ['id', 'name'],
        },
      ],
      transaction: t,
    });

    return { sourceItem, destinationItem };
  });
};

/**
 * transfer multiple items from one inventory to another in bulk
 * @param data
 * @param staff_id
 * @returns {Promise<{successful: Array, failed: Array}>} bulk transfer result
 */
export const bulkTransferItemsBetweenInventories = async (
  data: BulkInventoryTransferRequest,
  staff_id: number
): Promise<{
  successful: Array<{ sourceItem: InventoryItem; destinationItem: InventoryItem }>;
  failed: Array<{ item_id: number; error: string }>;
}> => {
  const { destination_inventory_id, items, reason, notes } = data;

  // Get destination inventory once
  const destinationInventory = await Inventory.findByPk(destination_inventory_id);
  if (!destinationInventory) {
    throw new BadException('NOT_FOUND', 404, 'Destination inventory not found');
  }

  const successful: Array<{ sourceItem: InventoryItem; destinationItem: InventoryItem }> = [];
  const failed: Array<{ item_id: number; error: string }> = [];

  // Process each item transfer
  for (const transferItem of items) {
    try {
      const result = await transferItemBetweenInventories(
        {
          source_inventory_item_id: transferItem.source_inventory_item_id,
          destination_inventory_id,
          quantity: transferItem.quantity,
          reason,
          notes,
        },
        staff_id
      );
      successful.push(result);
    } catch (error) {
      failed.push({
        item_id: transferItem.source_inventory_item_id,
        error: error instanceof BadException ? error.message : 'Transfer failed',
      });
    }
  }

  return { successful, failed };
};

/**
 * get pending prescriptions for an inventory item
 *
 * @function
 * @returns {Promise<{prescribedDrugs: PrescribedDrug[], prescribedAdditionalItems: PrescribedAdditionalItem[]}>} json object with pending prescriptions
 * @param inventoryItemId
 * @param currentPage
 * @param pageLimit
 */
export const getPendingPrescriptionsForItem = async ({
  inventoryItemId,
  currentPage = 1,
  pageLimit = 10,
}): Promise<{
  prescribedDrugs: {
    rows: PrescribedDrug[];
    count: number;
    pages: number;
  };
  prescribedAdditionalItems: {
    rows: PrescribedAdditionalItem[];
    count: number;
    pages: number;
  };
}> => {
  // Get the inventory item to find its inventory_id and drug_id
  const inventoryItem = await InventoryItem.findByPk(inventoryItemId, {
    attributes: ['id', 'inventory_id', 'drug_id'],
    include: [
      {
        model: Drug,
        attributes: ['id', 'type'],
      },
    ],
  });

  if (!inventoryItem) {
    throw new BadException('NOT_FOUND', 404, 'Inventory item not found');
  }

  let prescribedDrugs: { docs: PrescribedDrug[]; total: number; pages: number, currentPage: number, perPage: number };
  let prescribedAdditionalItems: { docs: PrescribedAdditionalItem[]; total: number; pages: number, currentPage: number, perPage: number };

  if (inventoryItem.drug.type === DrugForm.DRUG) {
      // Get pending prescribed drugs
    prescribedDrugs = await PrescribedDrug.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['createdAt', 'DESC']],
      where: {
        drug_id: inventoryItem.drug_id,
        dispense_status: DispenseStatus.PENDING,
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstname', 'lastname', 'hospital_id'],
        },
        {
          model: Visit,
          attributes: ['id', 'date_visit_start', 'type', 'category'],
        },
        {
          model: Drug,
          attributes: ['id', 'name'],
        },
        {
          model: Staff,
          as: 'requester',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });
  } else {
        // Get pending prescribed additional items
    prescribedAdditionalItems = await PrescribedAdditionalItem.paginate({
      paginate: pageLimit,
      page: currentPage,
      order: [['createdAt', 'DESC']],
      where: {
        drug_id: inventoryItem.drug_id,
        dispense_status: DispenseStatus.PENDING,
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'firstname', 'lastname', 'hospital_id'],
        },
        {
          model: Visit,
          attributes: ['id', 'date_visit_start', 'type', 'category'],
        },
        {
          model: Drug,
          attributes: ['id', 'name', 'type'],
        },
        {
          model: Staff,
          as: 'requester',
          attributes: ['id', 'firstname', 'lastname'],
        },
      ],
    });
  }



  return {
    prescribedDrugs: {
      rows: prescribedDrugs?.docs || [],
      count: prescribedDrugs?.total || 0,
      pages: prescribedDrugs?.pages || 0,
    },
    prescribedAdditionalItems: {
      rows: prescribedAdditionalItems?.docs || [],
      count: prescribedAdditionalItems?.total || 0,
      pages: prescribedAdditionalItems?.pages || 0,
    },
  };
};
