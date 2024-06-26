import {
  createInventory,
  getAnInventory,
  getInventories,
  getInventoryItemByDrugId,
  getInventoryItemById,
  getInventoryItemHistory,
  getInventoryItems,
  receiveBulkItem,
  searchInventoryItems,
  updateInventoryItem,
} from './inventory.repository';
import { Inventory, InventoryItem } from '../../database/models';
import { InventoryTypes } from './types/inventory.types';
import { GetInventoryItemsBody } from './types/inventory-item.types';
import { BadException } from '../../common/util/api-error';

class InventoryService {
  /**
   * create an inventory
   *
   * @static
   * @returns {json} json object with inventory data
   * @param body
   * @memberOf InventoryService
   */
  static async createInventory(body: InventoryTypes): Promise<Inventory> {
    return createInventory(body);
  }

  /**
   * get all inventories
   *
   * @static
   * @returns {json} json object with inventories data
   * @memberOf InventoryService
   */
  static async getInventories(): Promise<Inventory[]> {
    return getInventories();
  }

  /**
   * get an inventory
   *
   * @static
   * @returns {json} json object with inventory data
   * @memberOf InventoryService
   */
  static async getInventory(inventoryId: number): Promise<Inventory> {
    return getAnInventory(inventoryId);
  }

  /**
   * receive item(s) into the inventory
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @memberOf InventoryService
   */
  static async receiveItems(body: InventoryItem[]): Promise<InventoryItem[]> {
    const items = body.map(item => ({
      ...item,
      quantity_received: item.quantity_received,
    }));
    return receiveBulkItem(items);
  }

  /**
   * update the inventory item
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @memberOf InventoryService
   */
  static async updateInventoryItem(body) {
    return updateInventoryItem(body);
  }

  /**
   * get outpatient inventory items
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @memberOf InventoryService
   */
  static async getInventoryItems(body: GetInventoryItemsBody) {
    const { currentPage, pageLimit, search, inventory, filter } = body;
    if (filter && search) {
      return searchInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        filter,
      });
    }

    if (search) {
      return searchInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
      });
    }

    if (Object.values(body).length) {
      return getInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
      });
    }

    return getInventoryItems({ inventory });
  }

  /**
   * get an item from the inventory via its ID
   * @param inventoryId
   */
  static async getInventoryItem(inventoryId: number) {
    const item = await getInventoryItemById(inventoryId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  /**
   * get an item from the store the drug ID
   * @param drugId
   */
  async getInventoryItemByDrugId(drugId: number) {
    const item = await getInventoryItemByDrugId(drugId);
    if (!item) throw new BadException('NOT_FOUND', 404, 'Item not found');
    return item;
  }

  /**
   * get inventory item histories
   * @param body
   */
  static async getInventoryItemHistory(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, filter, inventoryItemId } = body;

    if (filter) {
      return getInventoryItemHistory({ currentPage, pageLimit, filter, inventoryItemId });
    }

    if (Object.values(body).length) {
      return getInventoryItemHistory({ currentPage, pageLimit, inventoryItemId });
    }

    return getInventoryItemHistory({ inventoryItemId });
  }
}

export default InventoryService;
