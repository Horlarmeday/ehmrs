/* eslint-disable camelcase */
import {
  createCashItem,
  createNHISItem,
  getPharmacyItems,
  searchPharmacyItems,
} from './store.repository';

class StoreService {
  /**
   * add item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createPharmacyItemService(body) {
    const { create_cash_item, create_nhis_item } = body;
    let item;
    if (create_cash_item) {
      item = await createCashItem(body);
    }

    if (create_nhis_item) {
      item = await createNHISItem(body);
    }
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
  static async getPharmacyItems(body) {
    const { currentPage, pageLimit, search, sort_by, order } = body;
    if (search) {
      return searchPharmacyItems(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getPharmacyItems(+currentPage, +pageLimit, sort_by, order);
    }

    return getPharmacyItems();
  }
}
export default StoreService;
