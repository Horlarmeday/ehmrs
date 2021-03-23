/* eslint-disable camelcase */
import {
  createGenericDrug,
  getGenericDrugs,
  searchGenericDrugs,
  updateGenericDrug,
} from './pharmacy.repository';

class PharmacyService {
  /**
   * create a generic drug
   *
   * @static
   * @returns {json} json object with generic drug data
   * @param body
   * @memberOf PharmacyService
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
   * @memberOf PharmacyService
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
   * @memberOf PharmacyService
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
}
export default PharmacyService;
