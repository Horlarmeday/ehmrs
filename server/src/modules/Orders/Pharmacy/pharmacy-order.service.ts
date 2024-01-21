import {
  bulkCreateAdditionalItems,
  createBulkTreatmentData,
  getPatientTreatments,
  getPrescribedAdditionalItems,
  getPrescribedDrugs,
  prescribeDrug,
  syringeNeedleCalculation,
  updatePrescribedDrug,
} from './pharmacy-order.repository';
import {
  PatientTreatmentBody,
  PrescribedAdditionalItemBody,
  PrescribedDrugBody,
} from './interface/prescribed-drug.body';
import {
  Admission,
  PatientTreatment,
  PrescribedAdditionalItem,
  PrescribedDrug,
} from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import VisitService from '../../Visit/visit.service';
import { DrugType } from '../../../database/models/pharmacyStore';
import {
  createDrugPrescription,
  getDrugPrice,
  getLastDrugPrescription,
} from '../../Pharmacy/pharmacy.repository';
import { isToday } from '../../../core/helpers/helper';
import { DrugStatus } from '../../../database/models/drugPrescription';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { DefaultType } from '../../../database/models/default';
import { BadException } from '../../../common/util/api-error';
import { INJECTION_SYRINGES_NOT_FOUND } from './messages/response-messages';
import { getInventoryItemQuery } from '../../Inventory/inventory.repository';
import { getVisitById } from '../../Visit/visit.repository';
import { getOneAdmission } from '../../Admission/admission.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';

class PharmacyOrderService {
  /**
   * prescribe a drug for patient
   *
   * @static
   * @returns {json} json object with prescribed drug data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async prescribeDrug(body: PrescribedDrugBody): Promise<PrescribedDrug> {
    const {
      drug_type,
      drug_id,
      visit_id,
      staff_id,
      dosage_form_name,
      inventory_id,
      quantity_to_dispense,
    } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const drugPrice = (await getDrugPrice(patient, drug_id)) * +quantity_to_dispense;
    const drugPrescription = await this.getDrugPrescription(patient.id, body);
    const inventory = await getInventoryItemQuery({ inventory_id, drug_id });
    const totalPrice = +inventory.selling_price * +quantity_to_dispense;

    //todo: Add check for daily NHIS drug quota

    const prescribedDrug = await prescribeDrug({
      ...body,
      patient_id: patient.id,
      examiner: staff_id,
      total_price: this.getTotalPrice(totalPrice, drugPrice, drug_type),
      drug_prescription_id: drugPrescription.id,
      ...(drug_type === DrugType.NHIS && {
        nhis_status: NHISApprovalStatus.PENDING,
      }),
    });
    if (/\binjection\b/i.test(dosage_form_name)) {
      const injectionDefaults = await getOneDefault({ type: DefaultType.INJECTION_ITEMS });
      if (!injectionDefaults) {
        throw new BadException('Error', 400, INJECTION_SYRINGES_NOT_FOUND);
      }
      await syringeNeedleCalculation({
        patient,
        prescription: prescribedDrug,
        injectionItems: injectionDefaults.data,
      });
    }
    return prescribedDrug;
  }

  /**
   * prescribe a drug for patient
   *
   * @static
   * @returns {json} json object with prescribed drug data
   * @param body
   * @param staffId
   * @param visitId
   * @memberOf PharmacyOrderService
   */
  static async prescribeAdditionalItems(
    body: PrescribedAdditionalItemBody[],
    staffId: number,
    visitId: number
  ): Promise<PrescribedAdditionalItem[]> {
    const visit = await VisitService.getVisitById(visitId);
    const patient = await PatientService.getPatientById(visit.patient_id);

    const data = await Promise.all(
      body.map(async item => {
        const { drug_id, drug_type, quantity_to_dispense, price } = item;
        const drugPrice = (await getDrugPrice(patient, drug_id)) * quantity_to_dispense;
        const totalPrice = +price * +quantity_to_dispense;

        this.getTotalPrice(totalPrice, drugPrice, drug_type);
        return {
          ...item,
          total_price: this.getTotalPrice(totalPrice, drugPrice, drug_type),
          quantity_prescribed: item.quantity_to_dispense,
          examiner: staffId,
          patient_id: patient.id,
          visit_id: visit.id,
          start_date: Date.now(),
          date_prescribed: Date.now(),
        };
      })
    );

    return bulkCreateAdditionalItems(data);
  }

  /**
   * update prescribed drug
   *
   * @static
   * @returns {Promise<PrescribedDrug>} json object with prescribed drug data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async updatePrescribedDrug(body: Partial<PrescribedDrug>): Promise<PrescribedDrug> {
    return updatePrescribedDrug(body);
  }

  /**
   * get prescribed drugs
   *
   * @static
   * @returns {json} json object with prescribed drugs data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async getPrescribedDrugs(body) {
    const { currentPage, pageLimit, filter, fetchWithItems } = body;

    if (filter && fetchWithItems) {
      const [prescribedDrugs, additionalItems] = await Promise.all([
        getPrescribedDrugs({ currentPage, pageLimit, filter }),
        getPrescribedAdditionalItems({ currentPage, pageLimit, filter }),
      ]);
      return { prescribedDrugs, additionalItems };
    }

    if (Object.values(body).length) {
      return getPrescribedDrugs({ currentPage, pageLimit, filter });
    }

    return getPrescribedDrugs({ filter });
  }

  /**
   * get prescribed additional items
   *
   * @static
   * @returns {json} json object with prescribed additional items data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async getPrescribedAdditionalItems(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getPrescribedAdditionalItems({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPrescribedAdditionalItems({ currentPage, pageLimit });
    }

    return getPrescribedAdditionalItems({ filter });
  }

  static getTotalPrice(totalPrice: number, hmoPrice: number, drug_type: DrugType) {
    if (drug_type === DrugType.NHIS) return totalPrice;
    if (drug_type === DrugType.CASH) return hmoPrice || totalPrice;
    return totalPrice;
  }

  /**
   * get the drug prescription
   *
   * @static
   * @returns {json} json object with drug prescription data
   * @memberOf PharmacyOrderService
   * @param patient_id
   * @param data
   */
  static async getDrugPrescription(patient_id: number, data: PrescribedDrugBody) {
    const lastPrescription = await getLastDrugPrescription(patient_id);

    if (lastPrescription && !isToday(lastPrescription?.date_prescribed))
      return createDrugPrescription(this.drugPrescriptionData(data, patient_id));

    // if drug has not been dispensed - pick the id and use it in prescribed drug
    if (lastPrescription?.status === DrugStatus.PENDING) return lastPrescription;

    // if drug was prescribed today and has been dispensed - create new one
    if (lastPrescription?.status === DrugStatus.COMPLETE_DISPENSE)
      return createDrugPrescription(this.drugPrescriptionData(data, patient_id));

    return createDrugPrescription(this.drugPrescriptionData(data, patient_id));
  }

  /**
   * create patient treatment data
   *
   * @static
   * @returns {json} json object with patient treatment data
   * @param body
   * @param paramId
   * @param staff_id
   * @memberOf PharmacyOrderService
   */
  static async createPatientTreatment(
    body: PatientTreatmentBody[],
    paramId: number,
    staff_id: number
  ): Promise<PatientTreatment[]> {
    const isAdmission = body[0].source === 'Admission';
    const entity = isAdmission
      ? await getOneAdmission({ id: paramId })
      : await getVisitById(paramId);

    const data = body.map(treatment => ({
      ...treatment,
      patient_id: isAdmission ? entity.patient_id : entity.patient_id,
      date_entered: Date.now(),
      visit_id: isAdmission ? (entity instanceof Admission ? entity?.visit_id : null) : entity.id,
      staff_id,
      admission_id: isAdmission ? entity.id : null,
    }));

    return createBulkTreatmentData(data);
  }

  /**
   * get patient treatments data
   *
   * @static
   * @returns {json} json object with patient treatments data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async getPatientTreatmentData(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getPatientTreatments({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPatientTreatments({ currentPage, pageLimit });
    }

    return getPatientTreatments({ filter });
  }

  private static drugPrescriptionData(body: PrescribedDrugBody, patient_id: number) {
    return {
      source: body.source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_prescribed: Date.now(),
      ...(body?.ante_natal_id && { ante_natal_id: body?.ante_natal_id }),
    };
  }
}
export default PharmacyOrderService;
