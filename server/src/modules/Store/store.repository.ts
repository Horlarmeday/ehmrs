/* eslint-disable camelcase */
import { literal, Op, QueryTypes, Transaction, WhereOptions } from 'sequelize';
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
  Vendor,
} from '../../database/models';
import { PharmacyDrugType, LogType, HistoryType } from '../../database/enums';
import { sequelizeConnection } from '../../database/config/data-source';
import { ItemsToReorder } from './types/pharmacy-item.types';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import { getAnInventory } from '../Inventory/inventory.repository';
import { lt } from 'lodash';
import {
  INVALID_INVENTORY,
  INVALID_QUANTITY,
  UNPRICED_ITEM,
} from '../Inventory/messages/response-messages';
import { staffAttributes, StatusCodes } from '../../core/helpers/helper';

/** ***********************
 * PHARMACY STORE
 ********************** */

/**
 * create a pharmacy store item and its opening SUPPLIED history row, in one transaction.
 *
 * The history row is what makes a delivery an addressable event rather than a mutation of a bin.
 * `reorderPharmacyItems` has always written one per restock; the create paths never did, so a drug's
 * FIRST delivery left no trace and history began at the second. On `ehmrs_prod` that is 40 SUPPLIED
 * rows against 1,664 store rows.
 *
 * Accounting #304 needs it because `external_batch_id` belongs on the delivery, not on the bin: the
 * bin row is reused and overwritten across restocks (`reorderPharmacyItems` spreads `...item` over
 * it), so a batch id stored there names only the most recent delivery.
 *
 * Both writes share one transaction. A store row whose opening history is missing would understate
 * what arrived, and the row is the thing stock is dispensed from — the pair commits or neither does.
 */
async function createStoreItem(data, drug_type: PharmacyDrugType, selling_price) {
  const {
    drug_id,
    shelf,
    product_code,
    batch,
    voucher,
    quantity_received,
    unit_id,
    unit_price,
    expiration,
    dosage_form_id,
    staff_id,
    date_received,
    measurement_id,
    strength_input,
    route_id,
    drug_form,
    brand,
    vendor_id,
  } = data;

  // #29: reject a non-integer or negative receipt at the writer, in the applier's shape
  // (applier.ts `stock.received` quantity guard). Zero is allowed — an empty delivery is odd but
  // not corrupting — but a negative quantity_received would set quantity_remaining negative and
  // file a SUPPLIED history row claiming a negative delivery. Reject; do not clamp silently.
  if (
    typeof quantity_received !== 'number' ||
    !Number.isInteger(quantity_received) ||
    quantity_received < 0
  ) {
    throw new BadException(
      'Invalid',
      StatusCodes.BAD_REQUEST,
      `quantity_received for drug ${drug_id} must be a whole number of 0 or more; got ` +
        `${String(quantity_received)}. A negative receipt would subtract from the shelf.`
    );
  }

  return sequelizeConnection.transaction(async t => {
    const item = await PharmacyStore.create(
      {
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
        drug_type,
        vendor_id,
      },
      { transaction: t }
    );

    await PharmacyStoreHistory.create(
      {
        quantity_supplied: quantity_received,
        pharmacy_store_id: item.id,
        quantity_remaining: quantity_received,
        unit_id,
        item_receiver: staff_id,
        history_date: date_received || Date.now(),
        history_type: HistoryType.SUPPLIED,
        vendor_id,
        selling_price,
        unit_price,
      },
      { transaction: t }
    );

    return item;
  });
}

/**
 * create a cash pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createCashItem(data) {
  return createStoreItem(data, PharmacyDrugType.CASH, data.selling_price);
}

/**
 * create a NHIS pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createNHISItem(data) {
  return createStoreItem(data, PharmacyDrugType.NHIS, data.nhis_selling_price);
}

/**
 * create a Private pharmacy item
 * @param data
 * @returns {object} item data
 */
export async function createPrivateItem(data) {
  return createStoreItem(data, PharmacyDrugType.PRIVATE, data.private_selling_price);
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
      {
        model: Vendor,
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
 * reset pharmacy store items quantities
 *
 * @function
 * @returns {json} json object with item history data
 */
export const resetPharmacyStoreItemsQuantities = async () => {
  const pharmacyItems = await PharmacyStore.findAll({ attributes: ['id'] });
  const pharmacyItemIds = pharmacyItems.map(item => item.id);
  return await PharmacyStore.update(
    { quantity_remaining: 0, quantity_received: 0 },
    { where: { id: pharmacyItemIds } }
  );
};

/**
 * Get sales reports with revenue analysis
 * @param filters - Filter options for the report
 * @returns {Promise} Sales report data
 */
export async function getSalesReports(filters: {
  startDate?: string;
  endDate?: string;
  drugId?: number;
  inventoryId?: number;
  drugType?: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  const whereClause: WhereOptions = {
    history_type: HistoryType.DISPENSED,
  };

  if (filters.startDate && filters.endDate) {
    whereClause.history_date = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  }

  if (filters.drugId) {
    whereClause['$PharmacyStore.drug_id$'] = filters.drugId;
  }

  if (filters.inventoryId) {
    whereClause.inventory_id = filters.inventoryId;
  }

  if (filters.drugType) {
    whereClause['$PharmacyStore.drug_type$'] = filters.drugType;
  }

  let dateFormat = '%Y-%m-%d';
  if (filters.groupBy === 'week') {
    dateFormat = '%Y-%u';
  } else if (filters.groupBy === 'month') {
    dateFormat = '%Y-%m';
  }

  return sequelizeConnection.query(
    `
    SELECT 
      DATE_FORMAT(psh.history_date, '${dateFormat}') as period,
      COUNT(DISTINCT psh.id) as total_transactions,
      SUM(psh.quantity_dispensed) as total_quantity_sold,
      SUM(psh.quantity_dispensed * psh.selling_price) as total_revenue,
      SUM(psh.quantity_dispensed * psh.unit_price) as total_cost,
      SUM(psh.quantity_dispensed * (psh.selling_price - psh.unit_price)) as total_profit,
      AVG(ps.selling_price) as avg_selling_price,
      COUNT(DISTINCT ps.drug_id) as unique_drugs_sold,
      COUNT(DISTINCT psh.inventory_id) as unique_inventories,
      CASE 
        WHEN SUM(psh.quantity_dispensed * psh.unit_price) > 0 THEN
          (SUM(psh.quantity_dispensed * (psh.selling_price - psh.unit_price)) / 
           SUM(psh.quantity_dispensed * psh.unit_price)) * 100
        ELSE 0
      END as profit_margin_percentage
    FROM Pharmacy_Store_Histories psh
    JOIN Pharmacy_Store_Items ps ON psh.pharmacy_store_id = ps.id
    JOIN Drug d ON ps.drug_id = d.id
    WHERE psh.history_type = 'dispensed'
    ${
      filters.startDate && filters.endDate
        ? `AND psh.history_date BETWEEN '${filters.startDate}' AND '${filters.endDate}'`
        : ''
    }
    ${filters.drugId ? `AND ps.drug_id = ${filters.drugId}` : ''}
    ${filters.inventoryId ? `AND psh.inventory_id = ${filters.inventoryId}` : ''}
    ${filters.drugType ? `AND ps.drug_type = '${filters.drugType}'` : ''}
    GROUP BY DATE_FORMAT(psh.history_date, '${dateFormat}')
    ORDER BY period DESC
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

/**
 * update a pharmacy store item
 *
 * @function
 * @returns json object with item data
 * @param fieldsToUpdate
 * @param staff_id
 */
export const updatePharmacyStoreItems = async (
  fieldsToUpdate: Partial<PharmacyStore>[],
  staff_id: number
) => {
  return await Promise.all(
    fieldsToUpdate.map(async field => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...rest } = field;
      return await sequelizeConnection.transaction(async t => {
        const item = await PharmacyStore.findByPk(field.id, { transaction: t });

        await PharmacyStore.update({ ...field }, { where: { id: field.id }, transaction: t });

        await PharmacyStoreLog.create(
          { ...rest, pharmacy_store_id: item.id, staff_id, log_type: LogType.UPDATE },
          { transaction: t }
        );

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
              pharmacy_store_id: field.id,
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
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'dispenser',
        attributes: staffAttributes,
      },
      {
        model: Vendor,
        attributes: ['name'],
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
    order: [['createdAt', 'DESC']],
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
    // #29: validate every receipt BEFORE the loop applies any of them. Each item commits in its
    // own transaction below, so a guard inside the loop would reject item 4 of 4 with items 1-3
    // already restocked — a half-applied reorder. A negative quantity_received here used to
    // spread `...item` onto the bin and SUBTRACT from quantity_remaining, filing a SUPPLIED
    // history row claiming a negative delivery. Reject; do not clamp silently.
    for (const item of items) {
      if (
        typeof item.quantity_received !== 'number' ||
        !Number.isInteger(item.quantity_received) ||
        item.quantity_received < 0
      ) {
        throw new BadException(
          'Invalid',
          StatusCodes.BAD_REQUEST,
          `quantity_received for store item ${item.id} must be a whole number of 0 or more; got ` +
            `${String(item.quantity_received)}. A negative reorder would subtract from the shelf.`
        );
      }
    }
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
            item_receiver: staff_id,
            history_date: Date.now(),
            history_type: HistoryType.SUPPLIED,
            vendor_id: item.vendor_id,
            selling_price: item.selling_price,
            unit_price: item.unit_price,
          },
          { transaction: t }
        );
      });
    }
  } catch (e) {
    throw new BadException('Invalid', StatusCodes.BAD_REQUEST, e?.message);
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

  // #304 C5: an unpriced row is not dispensable. A row created from `stock.received` without a
  // selling price is born null (ADR-0041 §6) rather than priced at a fabricated number, and letting
  // it reach a dispensary would hand the patient stock nobody can bill for: `getDrugPrice`
  // (pharmacy.repository.ts) reads the layer's `selling_price` and the caller multiplies it by the
  // quantity, so a null becomes NaN on the bill rather than an error anyone sees.
  //
  // Blocked HERE, at the store→dispensary transfer, rather than at the patient-facing dispense:
  // this is the last point where the stock has not yet moved, and it fails in the store screen
  // where the price is actually set.
  if (storeItem.selling_price === null || storeItem.selling_price === undefined) {
    throw new BadException('Invalid', 400, UNPRICED_ITEM.replace('drug', item.drug_name));
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

/**
 * The batch id Accounting minted for the delivery a transfer is drawing from (ADR-0041).
 *
 * A bin holds several deliveries, and the units on its shelf are commingled — so "which delivery"
 * cannot be answered exactly from quantity alone. The NEWEST claimed SUPPLIED row is the honest
 * approximation at THIS seam, and it is a far narrower guess than the one it replaces: it is made
 * once, when stock physically leaves the store, and is then FROZEN onto the layer. Every later
 * return of those units names the delivery this transfer recorded, rather than re-guessing against
 * a bin whose contents have moved on.
 *
 * Returns null when the bin has no claimed delivery — pre-cutover stock, donations, or a store row
 * Accounting never saw. Null is visibly unknown; a fabricated id is silently wrong (#295 D3).
 */
const resolveDeliveryBatchId = async (
  pharmacyStoreId: number,
  transaction: Transaction
): Promise<string | null> => {
  const delivery = await PharmacyStoreHistory.findOne({
    where: {
      pharmacy_store_id: pharmacyStoreId,
      history_type: HistoryType.SUPPLIED,
      external_batch_id: { [Op.ne]: null },
    },
    order: [['createdAt', 'DESC']],
    attributes: ['external_batch_id'],
    transaction,
  });
  return delivery?.external_batch_id ?? null;
};

const mapInventoryItem = (
  storeItem: PharmacyStore,
  item: ItemsToDispensedBody,
  staff_id: number,
  externalBatchId: string | null
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
  pharmacy_store_id: storeItem.id,
  batch: storeItem.batch,
  external_batch_id: externalBatchId,
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
  pharmacy_store_id: inventoryItem.pharmacy_store_id,
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
  selling_price: storeItem.selling_price,
  unit_price: storeItem.unit_price,
});

/**
 * dispense pharmacy items
 * @param items
 * @param staff_id
 */
export const dispensePharmacyItems = async (items: ItemsToDispensedBody[], staff_id: number) => {
  return Promise.allSettled(
    items.map(async item => {
      const storeItem = await dispenseValidations(item);

      return sequelizeConnection.transaction(async t => {
        const externalBatchId = await resolveDeliveryBatchId(storeItem.id, t);
        const mappedItem = mapInventoryItem(storeItem, item, staff_id, externalBatchId);

        const [inventoryItem, created] = await InventoryItem.findOrCreate({
          where: {
            drug_id: mappedItem.drug_id,
            inventory_id: mappedItem.inventory_id,
            pharmacy_store_id: mappedItem.pharmacy_store_id,
          },
          defaults: { ...mappedItem },
          transaction: t,
        });

        if (!created) {
          await InventoryItem.update(
            {
              quantity_remaining: literal(`quantity_remaining + ${mappedItem.quantity_remaining}`),
              quantity_received: literal(`quantity_received + ${mappedItem.quantity_remaining}`),
            },
            {
              where: {
                drug_id: mappedItem.drug_id,
                inventory_id: mappedItem.inventory_id,
                pharmacy_store_id: mappedItem.pharmacy_store_id,
              },
              transaction: t,
            }
          );
        }

        await InventoryItemHistory.create(mapInventoryItemHistory(item, inventoryItem, staff_id), {
          transaction: t,
        });

        await PharmacyStore.update(
          { quantity_remaining: storeItem.quantity_remaining - item.quantity_to_dispense },
          { where: { id: storeItem.id }, transaction: t }
        );

        await PharmacyStoreHistory.create(mapDispenseStoreItemHistory(item, storeItem, staff_id), {
          transaction: t,
        });
        return storeItem;
      });
    })
  );
};

/**
 * Create a new vendor
 * @param body
 * @param staff_id
 */
export const createVendor = (body, staff_id: number) => {
  return Vendor.create({ ...body, staff_id });
};

/**
 * Get all vendors
 * @param currentPage
 * @param pageLimit
 */
export const getVendors = (currentPage = 1, pageLimit = 50) => {
  return Vendor.paginate({
    page: +currentPage,
    paginate: +pageLimit,
  });
};

/**
 * Update a vendor
 * @param id
 * @param body
 */
export const updateVendor = (id: number, body: Partial<Vendor>) => {
  return Vendor.update(body, { where: { id } });
};

/** ********************************
 * LABORATORY STORE - DEPRECATED
 ******************************** */

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
      name: {
        [Op.like]: `%${search}%`,
      },
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

/** ***********************
 * PHARMACY REPORTS
 ********************** */

/**
 * Get inventory reports with aggregated data
 * @param filters - Filter options for the report
 * @returns {Promise} Inventory report data
 */
export async function getInventoryReports(filters: {
  startDate?: string;
  endDate?: string;
  drugId?: number;
  vendorId?: number;
  drugType?: string;
}) {
  const whereClause: WhereOptions = {};
  const includeClause = [
    {
      model: Drug,
      attributes: ['id', 'name'],
    },
    {
      model: Unit,
      attributes: ['name'],
    },
    {
      model: DosageForm,
      attributes: ['name'],
    },
    {
      model: Vendor,
      attributes: ['name'],
    },
  ];

  if (filters.startDate && filters.endDate) {
    whereClause.date_received = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  }

  if (filters.drugId) {
    whereClause.drug_id = filters.drugId;
  }

  if (filters.vendorId) {
    whereClause.vendor_id = filters.vendorId;
  }

  if (filters.drugType) {
    whereClause.drug_type = filters.drugType;
  }

  return PharmacyStore.findAll({
    where: whereClause,
    include: includeClause,
    attributes: [
      'id',
      'drug_id',
      'vendor_id',
      'quantity_received',
      'quantity_remaining',
      'unit_price',
      'selling_price',
      'total_price',
      'expiration',
      'date_received',
      'drug_type',
      'batch',
      // #29: quantity_received - quantity_remaining goes NEGATIVE on a repaired row (0 - what is
      // still on the shelf). With no valid receipt there is no dispensed figure either — NULL is
      // visibly unknown; a fabricated negative (or zero) dispense is silently wrong.
      [
        literal(
          'CASE WHEN quantity_received > 0 THEN (quantity_received - quantity_remaining) ELSE NULL END'
        ),
        'quantity_dispensed',
      ],
      [
        literal(
          'CASE WHEN quantity_received > 0 THEN (quantity_received - quantity_remaining) * selling_price ELSE NULL END'
        ),
        'revenue_generated',
      ],
    ],
    order: [['date_received', 'DESC']],
  });
}

/**
 * Get dispense reports with historical data
 * @param filters - Filter options for the report
 * @returns {Promise} Dispense report data
 */
export async function getDispenseReports(filters: {
  startDate?: string;
  endDate?: string;
  drugId?: number;
  inventoryId?: number;
  dispensedBy?: number;
}) {
  const whereClause: WhereOptions = {};

  if (filters.startDate && filters.endDate) {
    whereClause.history_date = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  }

  if (filters.drugId) {
    whereClause['$PharmacyStore.drug_id$'] = filters.drugId;
  }

  if (filters.inventoryId) {
    whereClause.inventory_id = filters.inventoryId;
  }

  if (filters.dispensedBy) {
    whereClause.dispensed_by = filters.dispensedBy;
  }

  return PharmacyStoreHistory.findAll({
    where: {
      ...whereClause,
      history_type: HistoryType.DISPENSED,
    },
    include: [
      {
        model: PharmacyStore,
        attributes: ['drug_id', 'batch', 'expiration'],
        include: [
          {
            model: Drug,
            attributes: ['name', 'id'],
          },
          {
            model: Unit,
            attributes: ['name'],
          },
        ],
      },
      {
        model: Inventory,
        attributes: ['name'],
      },
      {
        model: Staff,
        attributes: staffAttributes,
        as: 'dispenser',
      },
      {
        model: Staff,
        attributes: staffAttributes,
        as: 'receiver',
      },
    ],
    attributes: [
      'id',
      'quantity_dispensed',
      'quantity_remaining',
      'selling_price',
      'unit_price',
      'history_date',
      'item_receiver',
      [literal('quantity_dispensed * `PharmacyStoreHistory`.`selling_price`'), 'total_amount'],
    ],
    order: [['history_date', 'DESC']],
  });
}

/**
 * Get expiry tracking reports
 * @param filters - Filter options for the report
 * @returns {Promise} Expiry report data
 */
export async function getExpiryReports(filters: {
  daysToExpiry?: number;
  includeExpired?: boolean;
  drugId?: number;
  vendorId?: number;
}) {
  const whereClause: WhereOptions = {
    quantity_remaining: {
      [Op.gt]: 0,
    },
  };

  const currentDate = new Date();
  const daysToExpiry = filters.daysToExpiry || 30;
  const expiryThreshold = new Date(currentDate.getTime() + daysToExpiry * 24 * 60 * 60 * 1000);

  if (filters.includeExpired) {
    whereClause.expiration = {
      [Op.lte]: expiryThreshold,
    };
  } else {
    whereClause.expiration = {
      [Op.between]: [currentDate, expiryThreshold],
    };
  }

  if (filters.drugId) {
    whereClause.drug_id = filters.drugId;
  }

  if (filters.vendorId) {
    whereClause.vendor_id = filters.vendorId;
  }

  return PharmacyStore.findAll({
    where: whereClause,
    include: [
      {
        model: Drug,
        attributes: ['name', 'id'],
      },
      {
        model: Unit,
        attributes: ['name'],
      },
      {
        model: Vendor,
        attributes: ['name'],
      },
    ],
    attributes: [
      'id',
      'drug_id',
      'vendor_id',
      'quantity_remaining',
      'unit_price',
      'selling_price',
      'expiration',
      'batch',
      'date_received',
      [literal('DATEDIFF(expiration, NOW())'), 'days_to_expiry'],
      [literal('quantity_remaining * unit_price'), 'potential_loss_value'],
    ],
    order: [['expiration', 'ASC']],
  });
}

/**
 * Get stock level analysis reports
 * @param filters - Filter options for the report
 * @returns {Promise} Stock level report data
 */
export async function getStockLevelReports(filters: {
  threshold?: 'low' | 'adequate' | 'overstocked';
  drugId?: number;
  vendorId?: number;
  sortBy?: 'quantity' | 'value' | 'turnover';
  order?: 'ASC' | 'DESC';
}) {
  const whereClause: WhereOptions = {};
  let havingClause = '';

  if (filters.drugId) {
    whereClause.drug_id = filters.drugId;
  }

  if (filters.vendorId) {
    whereClause.vendor_id = filters.vendorId;
  }

  // Define stock level thresholds based on minimum quantity
  if (filters.threshold === 'low') {
    havingClause = 'HAVING total_quantity <= minimum_quantity';
  } else if (filters.threshold === 'adequate') {
    havingClause =
      'HAVING total_quantity > minimum_quantity AND total_quantity <= (minimum_quantity * 3)';
  } else if (filters.threshold === 'overstocked') {
    havingClause = 'HAVING total_quantity > (minimum_quantity * 3)';
  }

  const orderBy = filters.sortBy || 'quantity';
  const orderDirection = filters.order || 'DESC';

  let orderClause;
  switch (orderBy) {
    case 'value':
      orderClause = [['total_value', orderDirection]];
      break;
    case 'turnover':
      orderClause = [['turnover_rate', orderDirection]];
      break;
    default:
      orderClause = [['total_quantity', orderDirection]];
  }

  return sequelizeConnection.query(
    `
    SELECT 
      ps.drug_id,
      d.name as drug_name,
      u.name as unit_name,
      v.name as vendor_name,
      SUM(ps.quantity_remaining) as total_quantity,
      AVG(ps.unit_price) as avg_unit_price,
      AVG(ps.selling_price) as avg_selling_price,
      SUM(ps.quantity_remaining * ps.unit_price) as total_value,
      MIN(ps.expiration) as earliest_expiry,
      10 as minimum_quantity,
      CASE 
        WHEN SUM(ps.quantity_remaining) <= 10 THEN 'low'
        WHEN SUM(ps.quantity_remaining) <= 30 THEN 'adequate'
        ELSE 'overstocked'
      END as stock_status,
      COALESCE(
        (SELECT SUM(psh.quantity_dispensed) 
         FROM Pharmacy_Store_Histories psh
      WHERE psh.pharmacy_store_id IN (
        SELECT id FROM Pharmacy_Store_Items WHERE drug_id = ps.drug_id
         ) 
         AND psh.history_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ), 0
      ) as monthly_dispensed,
      CASE 
        WHEN SUM(ps.quantity_remaining) > 0 THEN 
          COALESCE(
            (SELECT SUM(psh.quantity_dispensed) 
             FROM Pharmacy_Store_Histories psh
      WHERE psh.pharmacy_store_id IN (
        SELECT id FROM Pharmacy_Store_Items WHERE drug_id = ps.drug_id
             ) 
             AND psh.history_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ), 0
          ) / SUM(ps.quantity_remaining)
        ELSE 0
      END as turnover_rate
    FROM Pharmacy_Store_Items ps
    LEFT JOIN Drugs d ON ps.drug_id = d.id
    LEFT JOIN Units u ON ps.unit_id = u.id
    LEFT JOIN Vendors v ON ps.vendor_id = v.id
    LEFT JOIN Pharmacy_Store_Histories psh ON ps.id = psh.pharmacy_store_id
    WHERE ps.quantity_remaining > 0 ${
      Object.keys(whereClause).length > 0 ? 'AND' : ''
    } ${Object.entries(whereClause)
      .map(([key, value]) => `ps.${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
      .join(' AND ')}
    GROUP BY ps.drug_id, d.name, u.name, v.name
    ${havingClause}
    ORDER BY ${
      orderBy === 'quantity'
        ? 'total_quantity'
        : orderBy === 'value'
        ? 'total_value'
        : 'turnover_rate'
    } ${orderDirection}
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}

/**
 * Get vendor performance reports
 * @param filters - Filter options for the report
 * @returns {Promise} Vendor performance report data
 */
export async function getVendorPerformanceReports(filters: {
  startDate?: string;
  endDate?: string;
  vendorId?: number;
  sortBy?: 'revenue' | 'quantity' | 'reliability';
  order?: 'ASC' | 'DESC';
}) {
  const whereClause: WhereOptions = {};

  if (filters.startDate && filters.endDate) {
    whereClause.date_received = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  }

  if (filters.vendorId) {
    whereClause.vendor_id = filters.vendorId;
  }

  const orderBy = filters.sortBy || 'revenue';
  const orderDirection = filters.order || 'DESC';

  return sequelizeConnection.query(
    `
    SELECT 
      v.id as vendor_id,
      v.name as vendor_name,
      v.phone,
      v.email,
      COUNT(DISTINCT ps.id) as total_items_supplied,
      SUM(ps.quantity_received) as total_quantity_supplied,
      SUM(ps.total_price) as total_purchase_value,
      AVG(ps.unit_price) as avg_unit_price,
      COUNT(DISTINCT ps.drug_id) as unique_drugs_supplied,
      COALESCE(
        (SELECT SUM(psh.quantity_dispensed * psh.selling_price)
         FROM Pharmacy_Store_Histories psh
         JOIN Pharmacy_Store_Items ps2 ON psh.pharmacy_store_id = ps2.id
         WHERE ps2.vendor_id = v.id
         ${
           filters.startDate && filters.endDate
             ? `AND psh.history_date BETWEEN '${filters.startDate}' AND '${filters.endDate}'`
             : ''
         }
        ), 0
      ) as total_revenue_generated,
      COALESCE(
        (SELECT COUNT(*)
         FROM Pharmacy_Store_Items ps3
         WHERE ps3.vendor_id = v.id
         AND ps3.expiration < NOW()
         AND ps3.quantity_remaining > 0
        ), 0
      ) as expired_items_count,
      COALESCE(
        (SELECT AVG(DATEDIFF(ps4.date_received, ps4.createdAt))
         FROM Pharmacy_Store_Items ps4
         WHERE ps4.vendor_id = v.id
        ), 0
      ) as avg_delivery_time_days,
      CASE 
        WHEN COUNT(DISTINCT ps.id) > 0 THEN
          (COUNT(DISTINCT ps.id) - COALESCE(
            (SELECT COUNT(*)
             FROM Pharmacy_Store_Items ps5
             WHERE ps5.vendor_id = v.id
             AND ps5.expiration < NOW()
             AND ps5.quantity_remaining > 0
            ), 0
          )) / COUNT(DISTINCT ps.id) * 100
        ELSE 0
      END as reliability_score
    FROM Vendors v
    LEFT JOIN Pharmacy_Store_Items ps ON v.id = ps.vendor_id
    WHERE 1=1 ${Object.keys(whereClause).length > 0 ? 'AND' : ''} ${Object.entries(whereClause)
      .map(([key, value]) => {
        if (key === 'date_received' && typeof value === 'object' && value[Op.between]) {
          return `ps.date_received BETWEEN '${value[Op.between][0]}' AND '${value[Op.between][1]}'`;
        }
        return `ps.${key} = ${typeof value === 'string' ? `'${value}'` : value}`;
      })
      .join(' AND ')}
    GROUP BY v.id, v.name, v.phone, v.email
    HAVING total_items_supplied > 0
    ORDER BY ${
      orderBy === 'revenue'
        ? 'total_revenue_generated'
        : orderBy === 'quantity'
        ? 'total_quantity_supplied'
        : 'reliability_score'
    } ${orderDirection}
    `,
    {
      type: QueryTypes.SELECT,
    }
  );
}
