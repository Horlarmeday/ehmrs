/* eslint-disable camelcase */
import {
  createLaboratoryItem,
  createStoreItem,
  createVendor,
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
  getVendors,
  reorderPharmacyItems,
  resetPharmacyStoreItemsQuantities,
  searchLaboratoryItems,
  searchPharmacyStoreItems,
  updatePharmacyStoreItem,
  updatePharmacyStoreItems,
  updateVendor,
} from './store.repository';
import { splitSort } from '../../core/helpers/helper';
import { LaboratoryStore, PharmacyStore } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ItemsToDispensedBody } from '../Inventory/types/inventory-item.types';
import {
  ITEM_EXISTS_CASH,
  ITEM_EXISTS_NHIS,
  ITEM_EXISTS_PLASCHEMA,
  ITEM_EXISTS_PRIVATE,
  ITEM_EXISTS_RETAINERSHIP,
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
    const {
      create_cash_item,
      create_nhis_item,
      drug_id,
      create_private_item,
      create_retainership_item,
      create_plaschema_item,
    } = body;
    await this.pharmacyStoreValidations({
      drugId: drug_id,
      create_cash_item,
      create_nhis_item,
      create_private_item,
      create_retainership_item,
      create_plaschema_item,
    });

    const itemTypes = [
      { flag: create_cash_item, priceKey: 'selling_price' },
      { flag: create_nhis_item, priceKey: 'nhis_selling_price' },
      { flag: create_private_item, priceKey: 'private_selling_price' },
      { flag: create_retainership_item, priceKey: 'retainership_selling_price' },
      { flag: create_plaschema_item, priceKey: 'plaschema_selling_price' },
    ];

    const priceKeys = [
      'selling_price',
      'nhis_selling_price',
      'private_selling_price',
      'retainership_selling_price',
      'plaschema_selling_price',
    ];

    const createdItems = [];

    for (const type of itemTypes) {
      if (type.flag) {
        // Only keep the relevant price key, set others to undefined
        const itemBody = { ...body };
        for (const key of priceKeys) {
          if (key !== type.priceKey) {
            itemBody[key] = undefined;
          }
        }
        createdItems.push(await createStoreItem(itemBody));
      }
    }
    return createdItems[0];
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
    const result = await dispensePharmacyItems(items, staff_id);
    const errors = result.filter(res => res.status === 'rejected' && res.reason);

    if (errors?.length) {
      throw new BadException(
        'DISPENSING_ERROR',
        400,
        errors.map(err => ('reason' in err ? err.reason : '')).join(', ')
      );
    }

    return (result
      .filter(item => item.status === 'fulfilled' && item.value)
      .map(res => 'value' in res && res.value) as unknown) as PharmacyStore[];
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
  static async updatePharmacyStoreItems(items: Partial<PharmacyStore>[], staffId: number) {
    return updatePharmacyStoreItems(items, staffId);
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

  /**
   * Create a pharmacy vendor
   * @param body
   * @param staff_id
   */
  static async createVendor(body, staff_id: number) {
    return createVendor(body, staff_id);
  }

  /**
   * Update a pharmacy vendor
   * @param body
   * @param vendorId
   */
  static async updateVendor(body, vendorId: number) {
    return updateVendor(vendorId, body);
  }

  /**
   * get pharmacy vendors
   *
   * @static
   * @returns json object with pharmacy item logs data
   * @param body
   * @memberOf StoreService
   */
  static async getVendors(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit } = body;

    if (Object.values(body).length) {
      return getVendors(currentPage, pageLimit);
    }

    return getVendors();
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

  private static async pharmacyStoreValidations({
    drugId,
    create_cash_item,
    create_nhis_item,
    create_private_item,
    create_retainership_item,
    create_plaschema_item,
  }: {
    drugId: number;
    create_cash_item: boolean;
    create_nhis_item: boolean;
    create_private_item: boolean;
    create_plaschema_item: boolean;
    create_retainership_item: boolean;
  }) {
    const [cashItem, nhisItem, privateItem, plaschemaItem, retainershipItem] = await Promise.all([
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.CASH }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.NHIS }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.PRIVATE }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.PLASCHEMA }),
      getOnePharmacyStoreItem({ drug_id: drugId, drug_type: DrugType.RETAINERSHIP }),
    ]);

    if (cashItem && create_cash_item) throw new BadException('Invalid', 400, ITEM_EXISTS_CASH);
    if (nhisItem && create_nhis_item) throw new BadException('Invalid', 400, ITEM_EXISTS_NHIS);
    if (privateItem && create_private_item)
      throw new BadException('Invalid', 400, ITEM_EXISTS_PRIVATE);
    if (plaschemaItem && create_plaschema_item)
      throw new BadException('Invalid', 400, ITEM_EXISTS_PLASCHEMA);
    if (retainershipItem && create_retainership_item)
      throw new BadException('Invalid', 400, ITEM_EXISTS_RETAINERSHIP);
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
