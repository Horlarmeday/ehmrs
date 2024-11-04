/* eslint-disable camelcase */
import {
  createCashItem,
  createLaboratoryItem,
  createNHISItem,
  createPrivateItem,
  dispensePharmacyItems,
  findPharmacyStoreItems,
  getAllPharmacyStoreItems,
  getLaboratoryItems,
  getOnePharmacyStoreItem,
  getPharmacyItemByDrugId,
  getPharmacyStoreItemById,
  getPharmacyStoreItemHistory,
  getPharmacyStoreItemLogs,
  getPharmacyStoreItems,
  reorderPharmacyItems,
  resetPharmacyStoreItemsQuantities,
  searchLaboratoryItems,
  searchPharmacyStoreItems,
  updatePharmacyStoreItem,
  updatePharmacyStoreItems,
} from './store.repository';
import { splitSort } from '../../core/helpers/helper';
import { LaboratoryStore, PharmacyStore } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import {
  ITEM_EXISTS_CASH,
  ITEM_EXISTS_NHIS,
  ITEM_EXISTS_PRIVATE,
} from '../Inventory/messages/response-messages';
import { ItemsToReorder } from './types/pharmacy-item.types';
import { DrugType } from '../../database/models/pharmacyStore';
import { Status } from '../../database/models/staff';

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

  /**
   * Reorder pharmacy store
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item history data
   * @memberOf StoreService
   * @param items
   * @param staff_id
   */
  static async reorderPharmacyStoreItems(items: ItemsToReorder[], staff_id: number): Promise<void> {
    return reorderPharmacyItems(items, staff_id);
  }

  static async dispenseItemsFromStore(items: ItemsToDispensedBody[], staff_id: number) {
    return dispensePharmacyItems(items, staff_id);
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
   * update pharmacy store items
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
   * deactivate pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item data
   * @memberOf StoreService
   * @param items
   */
  static async deactivatePharmacyStoreItems(items: number[]) {
    return updatePharmacyStoreItem({ id: items }, { status: Status.INACTIVE });
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

  /**
   * reset pharmacy store items
   *
   * @static
   * @returns {Promise<PharmacyStore[]>} json object with pharmacy item data
   * @memberOf StoreService
   */
  static async resetPharmacyStoreItemsQuantities() {
    return resetPharmacyStoreItemsQuantities();
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
