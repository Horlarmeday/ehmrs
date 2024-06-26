/* eslint-disable camelcase */
import {
  addStoreItemHistory,
  createCashItem,
  createLaboratoryItem,
  createNHISItem,
  createPharmacyStoreLogs,
  createPrivateItem,
  findPharmacyStoreItems,
  getAllPharmacyStoreItems,
  getLaboratoryItems,
  getOnePharmacyStoreItem,
  getPharmacyItemByDrugId,
  getPharmacyStoreItemById,
  getPharmacyStoreItemHistory,
  getPharmacyStoreItemLogs,
  getPharmacyStoreItems,
  searchLaboratoryItems,
  searchPharmacyStoreItems,
  updatePharmacyStoreItem,
  updatePharmacyStoreItems,
} from './store.repository';
import { splitSort } from '../../core/helpers/helper';
import { InventoryItem, LaboratoryStore, PharmacyStore } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import {
  addInventoryItemHistory,
  addItemToInventory,
  getAnInventory,
} from '../Inventory/inventory.repository';
import {
  INVALID_INVENTORY,
  INVALID_QUANTITY,
  ITEM_EXISTS_CASH,
  ITEM_EXISTS_NHIS,
  ITEM_EXISTS_PRIVATE,
} from '../Inventory/messages/response-messages';
import { HistoryType } from '../../database/models/inventoryItemHistory';
import {
  ItemsToReorder,
  MapDispenseStoreItemHistoryType,
  MapSupplyStoreItemHistoryType,
} from './types/pharmacy-item.types';
import { lt } from 'lodash';
import { DrugType } from '../../database/models/pharmacyStore';

class StoreService {
  /**
   * add item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createPharmacyItemService(body): Promise<PharmacyStore> {
    const { create_cash_item, create_nhis_item, drug_id, create_private_item } = body;
    let item: PharmacyStore;
    await this.pharmacyStoreValidations(
      drug_id,
      create_cash_item,
      create_nhis_item,
      create_private_item
    );

    if (create_cash_item) item = await createCashItem(body);
    if (create_nhis_item) item = await createNHISItem(body);
    if (create_private_item) item = await createPrivateItem(body);
    return item;
  }

  /**
   * get pharmacy items
   *
   * @static
   * @returns {json} json object with pharmacy items data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyItems(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search, sort, filter } = body;
    if (search) {
      return searchPharmacyStoreItems(currentPage, pageLimit, search);
    }

    if (sort) {
      const { sort_by, order } = splitSort(sort);
      return getPharmacyStoreItems({ currentPage, pageLimit, sort_by, order });
    }

    if (filter && Object.values(JSON.parse(filter)).filter(Boolean)?.length) {
      return getPharmacyStoreItems({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPharmacyStoreItems({ currentPage, pageLimit });
    }

    return getPharmacyStoreItems({});
  }

  /**
   * get an item from the store via its Id
   * @param storeId
   */
  static async getPharmacyStoreItem(storeId: number) {
    const item = await getPharmacyStoreItemById(storeId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  /**
   * get an item from the store the drug ID
   * @param drugId
   */
  async getPharmacyStoreItemByDrugId(drugId: number) {
    const item = await getPharmacyItemByDrugId(drugId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  static async dispenseItemsFromStore(items: ItemsToDispensedBody[], staff_id: number) {
    return await Promise.all(
      items.map(async item => {
        const storeItem = await this.dispenseValidations(item);
        // send item to inventory - either create or update existing
        const inventoryItem = await addItemToInventory(
          this.mapInventoryItem(storeItem, item, staff_id)
        );
        // create a history of supply to inventory
        await addInventoryItemHistory(this.mapInventoryItemHistory(item, inventoryItem, staff_id));
        // create a dispense history in store history
        await addStoreItemHistory(
          this.mapDispenseStoreItemHistory({
            item,
            storeItem,
            staff_id,
          })
        );
        // update the store to the current quantity
        await updatePharmacyStoreItem(
          { id: storeItem.id },
          { quantity_remaining: storeItem.quantity_remaining - item.quantity_to_dispense }
        );
        return storeItem;
      })
    );
  }

  /**
   * get pharmacy item history
   *
   * @static
   * @returns {json} json object with pharmacy item history data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyStoreItemHistory(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, filter, storeId } = body;

    if (filter) {
      return getPharmacyStoreItemHistory({ currentPage, pageLimit, filter, storeId });
    }

    if (Object.values(body).length) {
      return getPharmacyStoreItemHistory({ currentPage, pageLimit, storeId });
    }

    return getPharmacyStoreItemHistory({ storeId });
  }

  /**
   * Reorder pharmacy store
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param items
   * @param staff_id
   */
  static async reorderPharmacyStoreItems(
    items: ItemsToReorder[],
    staff_id: number
  ): Promise<PharmacyStore[]> {
    return await Promise.all(
      items.map(async item => {
        const storeItem = await getPharmacyStoreItemById(item.id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = storeItem.toJSON();
        // update the store logs
        await createPharmacyStoreLogs({
          ...rest,
          pharmacy_store_id: item.id,
          staff_id,
        });
        // update the store with new data
        await updatePharmacyStoreItem(
          { id: item.id },
          { ...item, quantity_remaining: +storeItem.quantity_remaining + +item.quantity_received }
        );
        // add store supply history
        await addStoreItemHistory(
          this.mapSupplyStoreItemHistory({
            item,
            storeItem,
            staff_id,
          })
        );
        return storeItem;
      })
    );
  }

  /**
   * Reorder pharmacy store
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param items
   */
  static async updatePharmacyStoreItems(items: Partial<PharmacyStore>[]) {
    return updatePharmacyStoreItems(items);
  }

  /**
   * get pharmacy item logs
   *
   * @static
   * @returns {json} json object with pharmacy item logs data
   * @param body
   * @memberOf StoreService
   */
  static async getPharmacyStoreItemLogs(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, storeId } = body;

    if (Object.values(body).length) {
      return getPharmacyStoreItemLogs({ currentPage, pageLimit, storeId });
    }

    return getPharmacyStoreItemLogs({ storeId });
  }

  /**
   * get pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy items data
   * @memberOf StoreService
   * @param itemIds
   */
  static async getPharmacyStoreItems(itemIds: number[]) {
    const items = await findPharmacyStoreItems(itemIds);
    return items;
  }

  /**
   * Export pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param selectedItemsId
   * @param selectAll
   */
  static async exportData(selectedItemsId: number[], selectAll: boolean) {
    let items;
    if (selectAll) {
      items = await getAllPharmacyStoreItems();
    } else {
      items = await findPharmacyStoreItems(selectedItemsId);
    }
    const headers = [
      [
        'Drug',
        'Product Code',
        'Voucher',
        'Batch',
        'Quantity Last Received',
        'Quantity Remaining',
        'Unit Price',
        'Selling Price',
        'Expiry Date',
        'Strength',
        'Drug Type',
      ],
    ];
    return { headers, mappedData: this.mapExportedData(items) };
  }

  private static mapExportedData(items: PharmacyStore[]) {
    return items.map(item => ({
      drug: item?.drug?.name || '-',
      productCode: item.product_code || '-',
      voucher: item.voucher || '-',
      batch: item.batch || '-',
      quantityReceived: `${item.quantity_received} ${item?.unit?.name}` || '-',
      quantityRemaining: `${item.quantity_remaining} ${item.unit.name}` || '-',
      unitPrice: item.unit_price || '-',
      sellingPrice: item.selling_price || '-',
      expiryDate: item.expiration?.toLocaleDateString() || '-',
      strength: item.strength_input ? `${item?.strength_input} ${item?.strength?.name}` : '-',
      drugType: item.drug_type || '-',
    }));
  }

  private static async dispenseValidations(item: ItemsToDispensedBody) {
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
  }

  private static mapInventoryItem(
    storeItem: PharmacyStore,
    item: ItemsToDispensedBody,
    staff_id: number
  ) {
    return {
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
    };
  }

  private static mapInventoryItemHistory(
    item: ItemsToDispensedBody,
    inventoryItem: InventoryItem,
    staff_id: number
  ) {
    return {
      quantity_supplied: item.quantity_to_dispense,
      quantity_remaining: inventoryItem.quantity_remaining,
      inventory_item_id: inventoryItem.id,
      inventory_id: inventoryItem.inventory_id,
      unit_id: item.unit_id,
      item_receiver: item.receiver,
      staff_id,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
    };
  }

  private static mapDispenseStoreItemHistory({
    item,
    storeItem,
    staff_id,
  }: MapDispenseStoreItemHistoryType) {
    return {
      quantity_dispensed: item?.quantity_to_dispense,
      pharmacy_store_id: storeItem.id,
      quantity_remaining: +storeItem.quantity_remaining - +item.quantity_to_dispense,
      inventory_id: item.dispensary,
      unit_id: item.unit_id,
      item_receiver: item.receiver,
      dispensed_by: staff_id,
      history_date: Date.now(),
      history_type: HistoryType.DISPENSED,
    };
  }

  private static mapSupplyStoreItemHistory({
    item,
    storeItem,
    staff_id,
  }: MapSupplyStoreItemHistoryType) {
    return {
      quantity_supplied: item?.quantity_received,
      pharmacy_store_id: storeItem.id,
      quantity_remaining: +storeItem.quantity_remaining + +item.quantity_received,
      unit_id: storeItem.unit_id,
      dispensed_by: staff_id,
      history_date: Date.now(),
      history_type: HistoryType.SUPPLIED,
    };
  }

  private static async pharmacyStoreValidations(
    drugId: number,
    create_cash_item: boolean,
    create_nhis_item: boolean,
    create_private_item: boolean
  ) {
    const [cashItem, nhisItem, privateItem] = await Promise.all([
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.CASH }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.NHIS }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.PRIVATE }),
    ]);

    if (cashItem && create_cash_item) throw new BadException('Invalid', 400, ITEM_EXISTS_CASH);
    if (nhisItem && create_nhis_item) throw new BadException('Invalid', 400, ITEM_EXISTS_NHIS);
    if (privateItem && create_private_item)
      throw new BadException('Invalid', 400, ITEM_EXISTS_PRIVATE);
  }

  /**************************
   * LABORATORY STORE
   *************************/

  /**
   * add laboratory item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createLaboratoryItemService(body): Promise<LaboratoryStore> {
    return createLaboratoryItem(body);
  }

  /**
   * get laboratory items
   *
   * @static
   * @returns {json} json object with laboratory items data
   * @param body
   * @memberOf StoreService
   */
  static async getLaboratoryItems(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchLaboratoryItems(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getLaboratoryItems(+currentPage, +pageLimit);
    }

    return getLaboratoryItems();
  }
}
export default StoreService;
