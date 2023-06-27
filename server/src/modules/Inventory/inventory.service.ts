import {
  createInventory,
  getAnInventory,
  getInventories,
  getInventoryItems,
  inventories,
  receiveBulkItem,
  searchInventoryItems,
} from './inventory.repository';
import { Inventory, InventoryItem } from '../../database/models';
import { InventoryTypes } from './types/inventory.types';
import { GetInventoryItemsBody } from './types/inventory-item.types';

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
   * @param inventory
   * @param body
   * @memberOf InventoryService
   */
  static async receiveItems(inventory, body: InventoryItem[]): Promise<InventoryItem[]> {
    const items = body.map(item => ({
      ...item,
      quantity_received: item.quantity_received,
    }));
    return receiveBulkItem(items);
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
    const { currentPage, pageLimit, search, inventory } = body;

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
}

export default InventoryService;
