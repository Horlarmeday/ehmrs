import {
  createInventory,
  getAnInventory,
  getInventories,
  getInventoryItemByDrugId,
  getInventoryItemById,
  getInventoryItemHistory,
  getInventoryItems,
  getInventoryReturnRequests,
  receiveBulkItem,
  requestReturnDrugsToStore,
  searchInventoryItems,
  updateInventoryItem,
  updateReturnRequests,
  getAllInventoryItems,
  getSelectedInventoryItems,
  getInventoryStatistics,
} from './inventory.repository';
import { Inventory, InventoryItem, ReturnItem, InventoryItemHistory } from '../../database/models';
import { literal, Op } from 'sequelize';
import {
  InventoryTypes,
  RequestReturnToStore,
  UpdateReturnRequest,
  ExportInventoryItemsRequest,
} from './types/inventory.types';
import { GetInventoryItemsBody } from './types/inventory-item.types';
import { BadException } from '../../common/util/api-error';
import dayjs from 'dayjs';
import { HistoryType } from '../../database/enums';

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
    const { currentPage, pageLimit, search, inventory, filter, filterType } = body;

    // Handle special filter types
    let processedFilter = filter;
    if (filterType && !filter) {
      processedFilter = await this.buildFilterFromType(filterType, inventory);
      console.log(processedFilter, 'processedFilter');
    }

    if (processedFilter && search) {
      return searchInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        filter: processedFilter,
      });
    }

    if (search) {
      return searchInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        filter: processedFilter,
      });
    }

    if (processedFilter) {
      return getInventoryItems({
        inventory,
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        filter: processedFilter,
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
   * Build filter object from filter type
   * @param filterType
   * @param inventoryId
   * @private
   */
  private static async buildFilterFromType(filterType: string, inventoryId: number) {
    const today = dayjs().toDate();
    const thirtyDaysFromNow = dayjs()
      .add(30, 'day')
      .toDate();

    const inventory = await getAnInventory(inventoryId);

    switch (filterType) {
      case 'expiring_soon':
        return {
          expiration: {
            [Op.between]: [today, thirtyDaysFromNow],
          },
        };
      case 'low_stock':
        return {
          quantity_remaining: {
            [Op.lt]: inventory?.refill_level || 0,
          },
        };
      case 'critical_stock':
        return {
          quantity_remaining: {
            [Op.lt]: 5,
          },
        };
      case 'expired':
        return {
          expiration: {
            [Op.lt]: today,
          },
        };
      case 'most_dispensed': {
        const mostDispensedResult = await InventoryItemHistory.findAll({
          where: {
            inventory_id: inventoryId,
            history_type: HistoryType.DISPENSED,
          },
          attributes: [
            'inventory_item_id',
            [literal('SUM(quantity_dispensed)'), 'total_dispensed'],
          ],
          group: ['inventory_item_id'],
          order: [[literal('total_dispensed'), 'DESC']],
          limit: 1,
          raw: true,
        });

        if (mostDispensedResult.length > 0) {
          return {
            id: mostDispensedResult[0].inventory_item_id,
          };
        }
        return null;
      }
      default:
        return null;
    }
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
   * Export inventory items data
   * @param selectedItemsId
   * @param selectAll
   * @param inventoryId
   */
  static async exportInventoryItems(
    selectedItemsId: number[],
    selectAll: boolean,
    inventoryId: number
  ) {
    let items: InventoryItem[];

    if (selectAll) {
      items = await getAllInventoryItems(inventoryId);
    } else {
      items = await getSelectedInventoryItems(selectedItemsId);
    }

    const headers = [
      [
        'Drug Name',
        'Quantity Remaining',
        'Unit',
        'Selling Price (₦)',
        'Dosage Form',
        'Strength',
        'Expiration Date',
        'Date Received',
        'Status',
      ],
    ];

    return { headers, mappedData: this.mapExportedInventoryData(items) };
  }

  /**
   * Map inventory items data for export
   * @param items
   * @private
   */
  private static mapExportedInventoryData(items: InventoryItem[]) {
    return items.map(item => ({
      'Drug Name': item.drug?.name || 'N/A',
      'Quantity Remaining': `${item.quantity_remaining} ${item.unit?.name || ''}`,
      Unit: item.unit?.name || 'N/A',
      'Selling Price (₦)': item.selling_price || 'N/A',
      'Dosage Form': item.dosage_form?.name || 'N/A',
      Strength: item.measurement_id ? `${item.strength_input} ${item.strength?.name || ''}` : 'N/A',
      'Expiration Date': item.expiration ? dayjs(item.expiration).format('MMM DD, YYYY') : 'N/A',
      'Date Received': item.date_received
        ? dayjs(item.date_received).format('MMM DD, YYYY')
        : 'N/A',
      Status: item.quantity_remaining > 0 ? 'Available' : 'Out of Stock',
    }));
  }

  /**
   * get inventory statistics
   * @param inventoryId
   * @returns {Promise<object>} inventory statistics data
   */
  static async getInventoryStatistics(inventoryId: number) {
    return getInventoryStatistics(inventoryId);
  }
}

export default InventoryService;
