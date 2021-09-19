/* eslint-disable camelcase */
import {
  createDosageForm,
  createGenericDrug,
  createMeasurement,
  createRouteOfAdministration,
  getDosageFormMeasurements,
  getDosageFormRoutes,
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
import { RoutesOfAdministration } from './interface/routes-of-administration.interface';
import { DosageMeasurement } from './interface/dosage-measurements.interface';
import { DosageForm } from './interface/dosage-forms.interface';
import {Drug} from "./interface/generic-drugs.interface";

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
  static async createGenericDrugService(body): Promise<Drug> {
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
  static async updateGenericDrugService(body): Promise<Drug> {
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
  static async getGenericDrugs(body): Promise<Drug[]> {
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
  static async createDosageFormService(body): Promise<DosageForm> {
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
  static async updateDosageFormService(body): Promise<DosageForm> {
    return updateDosageForm(body);
  }

  /**
   * get dosage forms
   *
   * @static
   * @returns {json} json object with dosage forms data
   * @memberOf PharmacyService
   */
  static async getDosageForms(): Promise<DosageForm[]> {
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
  static async createMeasurementService(body): Promise<DosageMeasurement> {
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
  static async updateMeasurementService(body): Promise<DosageMeasurement> {
    return updateMeasurement(body);
  }

  /**
   * get measurements
   *
   * @static
   * @returns {json} json object with measurements data
   * @memberOf PharmacyService
   */
  static async getMeasurements(): Promise<DosageMeasurement[]> {
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
  static async createRouteService(body): Promise<RoutesOfAdministration> {
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
  static async updateRouteService(body): Promise<RoutesOfAdministration> {
    return updateRouteOfAdministration(body);
  }

  /**
   * get route administration
   *
   * @static
   * @returns {json} json object with route administration data
   * @memberOf PharmacyService
   */
  static async getRoutesOfAdministration(): Promise<RoutesOfAdministration[]> {
    return getRoutesOfAdministration();
  }

  /**
   * get route administration & measurements under a dosage form
   *
   * @static
   * @returns {json} json object with route administration data
   * @memberOf PharmacyService
   */
  static async getRoutesAndMeasurements(dosage_form_id: number) {
    const routes = getDosageFormRoutes(dosage_form_id);
    const measurements = getDosageFormMeasurements(dosage_form_id);

    const [routesOfAdministrations, dosageMeasurements] = await Promise.all([routes, measurements]);

    return { routesOfAdministrations, dosageMeasurements };
  }
}
export default PharmacyService;
