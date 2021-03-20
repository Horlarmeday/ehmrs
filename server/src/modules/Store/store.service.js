/* eslint-disable camelcase */
import {
  createCashItem,
  createGenericDrug, createNHISItem,
  getGenericDrugs, getPharmacyItems,
  searchGenericDrugs, searchPharmacyItems,
  updateGenericDrug,
} from './store.repository';

class StoreService {
  /**
   * create a generic drug
   *
   * @static
   * @returns {json} json object with generic drug data
   * @param body
   * @memberOf StoreService
   */
  static async createGenericDrugService(body) {
    return createGenericDrug(body);
  }

  /**
   * update generic drug
   *
   * @static
   * @returns {json} json object with generic data
   * @param body
   * @memberOf StoreService
   */
  static async updateGenericDrugService(body) {
    return updateGenericDrug(body);
  }

  /**
   * get generic drugs
   *
   * @static
   * @returns {json} json object with generic drugs data
   * @param body
   * @memberOf StoreService
   */
  static async getGenericDrugs(body) {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchGenericDrugs(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getGenericDrugs(+currentPage, +pageLimit);
    }

    return getGenericDrugs();
  }

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
