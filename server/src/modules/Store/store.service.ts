/* eslint-disable camelcase */
import {
  createCashItem,
  createLaboratoryItem,
  createNHISItem,
  getLaboratoryItems,
  getPharmacyItems,
  searchLaboratoryItems,
  searchPharmacyItems,
} from './store.repository';
import { splitSort } from '../../core/helpers/helper';
import { PharmacyItem, LabItem } from '../../database/models';

class StoreService {
  /**
   * add item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createPharmacyItemService(body): Promise<PharmacyItem> {
    const { create_cash_item, create_nhis_item } = body;
    let item: PharmacyItem | PromiseLike<PharmacyItem>;
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
  static async getPharmacyItems(
    body
  ): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
    const { currentPage, pageLimit, search, sort } = body;
    if (search) {
      return searchPharmacyItems(+currentPage, +pageLimit, search);
    }

    if (sort) {
      const { sort_by, order } = splitSort(sort);
      return getPharmacyItems(+currentPage, +pageLimit, sort_by, order);
    }

    if (Object.values(body).length) {
      return getPharmacyItems(+currentPage, +pageLimit);
    }

    return getPharmacyItems();
  }

  /**
   * add laboratory item to store
   *
   * @static
   * @returns {json} json object with item data
   * @param body
   * @memberOf StoreService
   */
  static async createLaboratoryItemService(body): Promise<LabItem> {
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
