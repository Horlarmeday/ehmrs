import {
  getInventoryItems,
  inventories,
  receiveBulkItem,
  searchInventoryItems,
} from './inventory.repository';
import { InventoryItem } from './interface/inventory-item.interface';
import { joinCapitalizedWord, StatusCodes } from '../../core/helpers/helper';
import { BadException } from '../../common/util/api-error';
import { INVALID_INVENTORY } from './messages/response-messages';

class InventoryService {
  /** ***********************
   * OUTPATIENT
   ********************** */

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
      quantity_received: item.quantity,
    }));
    return receiveBulkItem(inventory, items);
  }

  /**
   * get outpatient inventory items
   *
   * @static
   * @returns {json} json object with inventory items data
   * @param body
   * @memberOf InventoryService
   */
  static async getOutpatientInventoryItems(body) {
    const { currentPage, pageLimit, search, inventoryType } = body;
    const inventory = joinCapitalizedWord(inventoryType, '-');

    if (!inventories[inventory])
      throw new BadException('ERROR', StatusCodes.BAD_REQUEST, INVALID_INVENTORY);

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
