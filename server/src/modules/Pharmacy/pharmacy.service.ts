/* eslint-disable camelcase */
import {
  createDosageForm,
  createGenericDrug,
  createMeasurement,
  createRouteOfAdministration,
  getDosageForms,
  getGenericDrugs,
  getMeasurements,
  getRoutesOfAdministration,
  searchGenericDrugs,
  updateDosageForm,
  updateGenericDrug,
  updateMeasurement,
  updateRouteOfAdministration,
} from './pharmacy.repository';

class PharmacyService {
  /** ***********************
   * GENERIC DRUGS
   ********************** */

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

  /** ***********************
   * DOSAGE FORMS
   ********************** */

  /**
   * create a dosage form
   *
   * @static
   * @returns {json} json object with dosage form data
   * @param body
   * @memberOf PharmacyService
   */
  static async createDosageFormService(body) {
    return createDosageForm(body);
  }

  /**
   * update dosage form
   *
   * @static
   * @returns {json} json object with dosage form data
   * @param body
   * @memberOf PharmacyService
   */
  static async updateDosageFormService(body) {
    return updateDosageForm(body);
  }

  /**
   * get dosage forms
   *
   * @static
   * @returns {json} json object with dosage forms data
   * @memberOf PharmacyService
   */
  static async getDosageForms() {
    return getDosageForms();
  }

  /** ***********************
   * MEASUREMENTS
   ********************** */

  /**
   * create a measurement
   *
   * @static
   * @returns {json} json object with measurement data
   * @param body
   * @memberOf PharmacyService
   */
  static async createMeasurementService(body) {
    return createMeasurement(body);
  }

  /**
   * update measurement
   *
   * @static
   * @returns {json} json object with measurement data
   * @param body
   * @memberOf PharmacyService
   */
  static async updateMeasurementService(body) {
    return updateMeasurement(body);
  }

  /**
   * get measurements
   *
   * @static
   * @returns {json} json object with measurements data
   * @memberOf PharmacyService
   */
  static async getMeasurements() {
    return getMeasurements();
  }

  /** *************************
   * ROUTES OF ADMINISTRATION
   ************************ */

  /**
   * create a route administration
   *
   * @static
   * @returns {json} json object with route administration data
   * @param body
   * @memberOf PharmacyService
   */
  static async createRouteService(body) {
    return createRouteOfAdministration(body);
  }

  /**
   * update route administration
   *
   * @static
   * @returns {json} json object with route administration data
   * @param body
   * @memberOf PharmacyService
   */
  static async updateRouteService(body) {
    return updateRouteOfAdministration(body);
  }

  /**
   * get route administration
   *
   * @static
   * @returns {json} json object with route administration data
   * @memberOf PharmacyService
   */
  static async getRoutesOfAdministration() {
    return getRoutesOfAdministration();
  }
}
export default PharmacyService;
