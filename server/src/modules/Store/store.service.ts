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
import { PharmacyItem } from './interface/pharmacy-item.interface';
import { LabItem } from './interface/lab-item.interface';
import { splitSort } from '../../core/helpers/helper';

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
  static async getPharmacyItems(body): Promise<PharmacyItem[]> {
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
  static async getLaboratoryItems(body): Promise<LabItem[]> {
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
