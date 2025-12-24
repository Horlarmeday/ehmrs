import {
  createInventory,
  getAnInventory,
  getInventories,
  getInventoryItemByDrugId,
  getInventoryItemById,
  getInventoryItemHistory,
  getInventoryItems,
  getInventoryReturnRequests,
  getInventorySummary,
  getPendingPrescriptionsForItem,
  receiveBulkItem,
  transferItemBetweenInventories,
  bulkTransferItemsBetweenInventories,
  requestReturnDrugsToStore,
  searchInventoryItems,
  updateInventoryItem,
  updateReturnRequests,
  getFilteredInventoryItems,
} from './inventory.repository';
import { Inventory, InventoryItem, ReturnItem } from '../../database/models';
import {
  BulkInventoryTransferRequest,
  InventoryTransferRequest,
  InventoryTypes,
  RequestReturnToStore,
  UpdateReturnRequest,
} from './types/inventory.types';
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
   * receive item(s) into the inventory
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @param staff_id
   * @memberOf InventoryService
   */
  static async requestReturnDrugsToStore(
    body: RequestReturnToStore[],
    staff_id: number
  ): Promise<ReturnItem[]> {
    return requestReturnDrugsToStore(body, staff_id);
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
   * update return requests
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @param staff_id
   * @memberOf InventoryService
   */
  static async updateReturnRequests(body: UpdateReturnRequest[], staff_id: number): Promise<void> {
    return updateReturnRequests(body, staff_id);
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
    
    // Check if filter is one of the predefined filter types
    const filterTypes = ['low_stock', 'critical_stock', 'expiring_soon', 'expired'];
    const isFilterType = filter && filterTypes.includes(filter);
    
    if (isFilterType) {
      // Use the new filtered items function
      return getFilteredInventoryItems({
        inventory,
        currentPage: +currentPage || 1,
        pageLimit: +pageLimit || 10,
        filterType: filter,
      });
    }
    
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

  /**
   * get inventory item return requests
   * @param body
   */
  static async getInventoryReturnRequests(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search, start, end } = body;
    if (Object.values(body).length) {
      return getInventoryReturnRequests({ currentPage, pageLimit, search, start, end });
    }

    return getInventoryReturnRequests({});
  }

  /**
   * get inventory summary statistics
   * @param inventoryId
   */
  static async getInventorySummary(inventoryId: number) {
    return getInventorySummary(inventoryId);
  }

  /**
   * transfer item between inventories
   * @param body
   * @param staff_id
   */
  static async transferItemBetweenInventories(body: InventoryTransferRequest, staff_id: number) {
    return transferItemBetweenInventories(body, staff_id);
  }

  /**
   * bulk transfer items between inventories
   * @param body
   * @param staff_id
   */
  static async bulkTransferItemsBetweenInventories(
    body: BulkInventoryTransferRequest,
    staff_id: number
  ) {
    return bulkTransferItemsBetweenInventories(body, staff_id);
  }

  /**
   * get pending prescriptions for an inventory item
   * @param body
   */
  static async getPendingPrescriptionsForItem(body: {
    inventoryItemId: number;
    currentPage?: number;
    pageLimit?: number;
  }) {
    const { inventoryItemId, currentPage, pageLimit } = body;
    return getPendingPrescriptionsForItem({
      inventoryItemId,
      currentPage,
      pageLimit,
    });
  }
}

export default InventoryService;
