/* eslint-disable camelcase */
import {
  createDosageForm,
  createGenericDrug,
  createMeasurement,
  createRouteOfAdministration,
  dispenseDrug,
  getDosageFormMeasurements,
  getDosageFormRoutes,
  getDosageForms,
  getDrugPrescriptions,
  getGenericDrugs,
  getMeasurements,
  getOneDrugPrescription,
  getRoutesOfAdministration,
  returnDrugToInventory,
  searchGenericDrugs,
  updateDosageForm,
  updateGenericDrug,
  updateMeasurement,
  updateRouteOfAdministration,
} from './pharmacy.repository';
import { DosageMeasurement } from './interface/dosage-measurements.interface';
import { DosageForm } from './interface/dosage-forms.interface';
import { Drug } from './interface/generic-drugs.interface';
import {
  InventoryItem,
  InventoryItemHistory,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
} from '../../database/models';
import {
  getOneAdditionalItem,
  getOnePrescribedDrug,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { DispenseDrugType, ReturnDrugType } from './interface/prescribed-drug.type';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';
import { gt, gte } from 'lodash';
import { getInventoryItemQuery, getQuantitySum } from '../Inventory/inventory.repository';
import {
  INVENTORY_QUANTITY_LOW,
  QUANTITY_MORE_THAN_DOCTOR_QUANTITY,
  QUANTITY_MORE_THAN_QUANTITY_LEFT,
  RETURN_QUANTITY_MORE_THAN_DOCTOR_QUANTITY,
  RETURN_QUANTITY_MORE_THAN_QUANTITY_PRESCRIBED,
} from './messages/response-messages';
import { HistoryType } from '../../database/models/inventoryItemHistory';

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
  static async getGenericDrugs(body: {
    [s: string]: string;
  }): Promise<{ total: any; pages: number; perPage: number; docs: any; currentPage: number }> {
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

  /** ***********************
   * PRESCRIPTIONS
   ********************** */

  /**
   * get drug prescriptions
   * @param body
   */
  static async getDrugPrescriptions(body) {
    const { currentPage, pageLimit, search, start, end, period } = body;
    if (start && end) {
      return getDrugPrescriptions({ currentPage, pageLimit, period, search, end, start });
    }

    if (search) {
      return getDrugPrescriptions({ currentPage, pageLimit, period, search });
    }

    if (Object.values(body).length) {
      return getDrugPrescriptions({ currentPage, pageLimit, period });
    }

    return getDrugPrescriptions({ period });
  }

  /**
   * get one drug prescription
   * @param drugPrescriptionId
   */
  static async getOneDrugPrescription(drugPrescriptionId: string) {
    return getOneDrugPrescription(drugPrescriptionId);
  }

  /**
   * dispense drug from inventory
   *
   * @static
   * @returns {Promise<PrescribedDrug>} json object with inventory items data
   * @param body
   * @memberOf PharmacyService
   */
  static async dispenseDrug(
    body: DispenseDrugType
  ): Promise<PrescribedDrug | PrescribedAdditionalItem> {
    const { prescription_id, additional_item_id } = body;

    const fetchPrescribedDrug = prescription_id
      ? getOnePrescribedDrug({ id: prescription_id })
      : getOneAdditionalItem({ id: additional_item_id });

    const prescribedDrug = await fetchPrescribedDrug;
    const inventoryItem = await getInventoryItemQuery({
      inventory_id: prescribedDrug.inventory_id,
      drug_id: prescribedDrug.drug_id,
    });
    this.dispenseDrugValidations(body, prescribedDrug, inventoryItem);
    return dispenseDrug(inventoryItem, prescribedDrug, body);
  }

  /**
   * Return drug to inventory
   *
   * @static
   * @returns {Promise<PrescribedDrug>} json object with inventory item history data
   * @param body
   * @memberOf PharmacyService
   */
  static async returnDrugToInventory(body: ReturnDrugType): Promise<InventoryItemHistory> {
    const { prescription_id, additional_item_id } = body || {};
    const fetchPrescribedDrug = prescription_id
      ? getOnePrescribedDrug({ id: prescription_id })
      : getOneAdditionalItem({ id: additional_item_id });

    const prescribedDrug = await fetchPrescribedDrug;
    const inventoryItem = await getInventoryItemQuery({
      inventory_id: prescribedDrug.inventory_id,
      drug_id: prescribedDrug.drug_id,
    });

    await this.returnDrugValidations(body, prescribedDrug);
    return returnDrugToInventory(inventoryItem, prescribedDrug, body);
  }

  static dispenseDrugValidations(
    data: DispenseDrugType,
    prescribedDrug: PrescribedDrug | PrescribedAdditionalItem,
    inventoryItem: InventoryItem
  ) {
    if (gt(+data.quantity_to_dispense, +prescribedDrug.quantity_to_dispense))
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        QUANTITY_MORE_THAN_DOCTOR_QUANTITY
      );

    const quantityYetDispensed =
      prescribedDrug.quantity_to_dispense - prescribedDrug.quantity_dispensed;
    if (gt(+data.quantity_to_dispense, quantityYetDispensed))
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, QUANTITY_MORE_THAN_QUANTITY_LEFT);

    if (gt(+data.quantity_to_dispense, +inventoryItem.quantity_remaining))
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, INVENTORY_QUANTITY_LOW);
  }

  static async returnDrugValidations(
    data: ReturnDrugType,
    prescribedDrug: PrescribedDrug | PrescribedAdditionalItem
  ) {
    if (gt(+data.quantity_to_return, +prescribedDrug.quantity_to_dispense))
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        RETURN_QUANTITY_MORE_THAN_DOCTOR_QUANTITY
      );

    const quantitySum = await getQuantitySum('quantity_returned', {
      history_type: HistoryType.RETURNED,
      drug_prescription_id: prescribedDrug.id,
    });
    if (gt(+quantitySum + +data.quantity_to_return, prescribedDrug.quantity_to_dispense))
      throw new BadException(
        'INVALID',
        StatusCodes.BAD_REQUEST,
        RETURN_QUANTITY_MORE_THAN_QUANTITY_PRESCRIBED
      );
  }

  // 2 qtp - 1qtp
}
export default PharmacyService;
