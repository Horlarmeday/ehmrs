import {
  bulkCreateAdditionalItems,
  createBulkAdditionalTreatment,
  createBulkTreatmentData,
  deleteAdditionalItem,
  deletePrescribedDrug,
  getAdditionalItems,
  getAdditionalTreatments,
  getDrugsPrescribed,
  getOneAdditionalItem,
  getOnePrescribedDrugWithoutJoins,
  getPatientTreatments,
  getPrescribedAdditionalItems,
  getPrescribedDrugs,
  prescribeBulkDrugs,
  prescribeDrug,
  syringeNeedleCalculation,
  updateAdditionalItem,
  updatePrescribedDrug,
} from './pharmacy-order.repository';
import {
  PatientTreatmentBody,
  PrescribedAdditionalItemBody,
  PrescribedDrugBody,
} from './interface/prescribed-drug.body';
import {
  AdditionalTreatment,
  Admission,
  PatientTreatment,
  PrescribedAdditionalItem,
  PrescribedDrug,
} from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import VisitService from '../../Visit/visit.service';
import { DrugType } from '../../../database/models/pharmacyStore';
import { createDrugPrescription, getDrugPrice, getLastDrugPrescription } from '../../Pharmacy/pharmacy.repository';
import { isToday, StatusCodes } from '../../../core/helpers/helper';
import { DrugStatus } from '../../../database/models/drugPrescription';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { DefaultType } from '../../../database/models/default';
import { BadException } from '../../../common/util/api-error';
import { CANNOT_DELETE_DRUG, INJECTION_SYRINGES_NOT_FOUND } from './messages/response-messages';
import { getInventoryItemQuery } from '../../Inventory/inventory.repository';
import { getVisitById } from '../../Visit/visit.repository';
import { getOneAdmission } from '../../Admission/admission.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import { lt } from 'lodash';
import { INVALID_QUANTITY } from '../../Inventory/messages/response-messages';

class PharmacyOrderService {
  /**
   * prescribe a bulk drugs for patient
   *
   * @static
   * @returns {Promise<PrescribedDrug[]>} json object with prescribed drugs data
   * @param body
   * @param visit_id
   * @param staff_id
   * @memberOf PharmacyOrderService
   */
  static async prescribedBulkDrugs(
    body: PrescribedDrugBody[],
    staff_id: number,
    visit_id: number
  ): Promise<PrescribedDrug[]> {
    const visit = await VisitService.getVisitById(visit_id);
    const [insurance, patient, drugPrescription] = await Promise.all([
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
      PatientService.getPatientById(visit.patient_id),
      this.getDrugPrescription(visit.patient_id, {
        ...body[0],
        visit_id,
        staff_id,
      }),
    ]);

    //todo: Add check for daily NHIS drug quota
    // const settings = await SystemSettings.findOne();
    //TODO:
    // check if drug is primary, check the drugs prescrined today and sum them
    // check if sum of primary is higher than sum prescribed today

    const mappedPrescribedDrugs = await Promise.all(
      body.map(async data => {
        const { drug_type, drug_id, inventory_id, quantity_to_dispense, drug_group } = data;
        const inventoryItem = await getInventoryItemQuery({ inventory_id, drug_id });
        const drugPrice =
          (await getDrugPrice(patient, drug_id, inventoryItem)) * +quantity_to_dispense;

        return {
          ...data,
          patient_id: patient.id,
          examiner: staff_id,
          total_price: drug_type === DrugType.NHIS ? drugPrice * 0.1 : drugPrice,
          drug_prescription_id: drugPrescription.id,
          ...(drug_type === DrugType.NHIS && {
            nhis_status: NHISApprovalStatus.PENDING,
          }),
          patient_insurance_id: insurance?.id,
          visit_id,
          date_prescribed: Date.now(),
          drug_group: drug_group || null,
        };
      })
    );

    const injections = body.filter(
      ({ dosage_form_name }) =>
        /\binjection\b/i.test(dosage_form_name) || /\bInj\b/i.test(dosage_form_name)
    );

    return prescribeBulkDrugs(mappedPrescribedDrugs, injections, patient);
  }

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
    const [drugPrescription, inventoryItem, insurance, patient] = await Promise.all([
      this.getDrugPrescription(visit.patient_id, body),
      getInventoryItemQuery({ inventory_id, drug_id }),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
      PatientService.getPatientById(visit.patient_id),
    ]);
    const drugPrice = (await getDrugPrice(patient, drug_id, inventoryItem)) * +quantity_to_dispense;

    const prescribedDrug = await prescribeDrug({
      ...body,
      patient_id: patient.id,
      examiner: staff_id,
      total_price: drug_type === DrugType.NHIS ? drugPrice * 0.1 : drugPrice,
      drug_prescription_id: drugPrescription.id,
      ...(drug_type === DrugType.NHIS && {
        nhis_status: NHISApprovalStatus.PENDING,
      }),
      patient_insurance_id: insurance?.id,
    });
    if (/\binjection\b/i.test(dosage_form_name) || /\bInj\b/i.test(dosage_form_name)) {
      const injectionDefaults = await getOneDefault({ type: DefaultType.INJECTION_ITEMS });
      if (!injectionDefaults) {
        throw new BadException('Error', 400, INJECTION_SYRINGES_NOT_FOUND);
      }
      await syringeNeedleCalculation({
        patient,
        prescription: prescribedDrug,
        injectionItems: injectionDefaults.data,
        patient_insurance_id: insurance?.id,
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
    const [drugPrescription, insurance, patient] = await Promise.all([
      this.getDrugPrescription(visit.patient_id, {
        ...body[0],
        examiner: staffId,
        visit_id: visitId,
      }),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
      PatientService.getPatientById(visit.patient_id),
    ]);

    // check that the quantity is not low in the dispensary
    for await (const item of body) {
      const drug = await getInventoryItemQuery({
        drug_id: item.drug_id,
        inventory_id: item.inventory_id,
      });
      if (lt(drug.quantity_remaining, item.quantity_to_dispense)) {
        throw new BadException('Invalid', 400, INVALID_QUANTITY.replace('drug', item.name));
      }
    }

    const data = await Promise.all(
      body.map(async item => {
        const { drug_id, drug_type, quantity_to_dispense, price, inventory_id } = item;
        const inventoryItem = await getInventoryItemQuery({ inventory_id, drug_id });
        const drugPrice =
          +(await getDrugPrice(patient, drug_id, inventoryItem)) * +quantity_to_dispense;
        const totalPrice = +price * +quantity_to_dispense;

        return {
          ...item,
          total_price: drug_type === DrugType.NHIS ? drugPrice * 0.1 : drugPrice || totalPrice,
          quantity_prescribed: item.quantity_to_dispense,
          examiner: staffId,
          patient_id: patient.id,
          visit_id: visit.id,
          start_date: Date.now(),
          date_prescribed: Date.now(),
          drug_prescription_id: drugPrescription.id,
          patient_insurance_id: insurance?.id,
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
   * update bulk prescribed drug
   *
   * @static
   * @returns {Promise<PrescribedDrug>} json object with prescribed drug data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async updateBulkPrescribedDrug(body: Partial<PrescribedDrug>[]) {
    return await Promise.all(body.map(async data => await updatePrescribedDrug(data)));
  }

  /**
   * update bulk additional items
   *
   * @static
   * @returns {Promise<PrescribedAdditionalItem>} json object with additional items data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async updateBulkAdditionalItems(body: Partial<PrescribedAdditionalItem>[]) {
    return await Promise.all(body.map(async data => await updateAdditionalItem(data)));
  }

  /**
   * delete prescribed drug
   *
   * @static
   * @returns {Promise<number>} json object with prescribed drug data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async deletePrescribedDrug(body): Promise<number> {
    const allowedStatuses = [PaymentStatus.PAID, PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
    const drug = await getOnePrescribedDrugWithoutJoins({ id: body.drugId });
    if (drug && allowedStatuses.includes(drug.payment_status))
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_DRUG);

    return deletePrescribedDrug(body.drugId);
  }

  /**
   * delete prescribed additional item
   *
   * @static
   * @returns {Promise<number>} json object with prescribed drug data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async deleteAdditionalItem(body): Promise<number> {
    const allowedStatuses = [PaymentStatus.PAID, PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
    const item = await getOneAdditionalItem({ id: body.itemId });
    if (item && allowedStatuses.includes(item.payment_status))
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_DRUG);

    return deleteAdditionalItem(body.itemId);
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

  /**
   * get prescribed drugs
   *
   * @static
   * @returns {json} json object with prescribed drugs data
   * @memberOf PharmacyOrderService
   * @param visitId
   */
  static async getDrugsPrescribed(visitId: number) {
    return getDrugsPrescribed({ visit_id: visitId });
  }

  /**
   * get additional items
   *
   * @static
   * @returns {json} json object with additional items data
   * @memberOf PharmacyOrderService
   * @param visitId
   */
  static async getAdditionalItems(visitId: number) {
    return getAdditionalItems({ visit_id: visitId });
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
  static async getDrugPrescription(
    patient_id: number,
    data: PrescribedDrugBody | PrescribedAdditionalItemBody
  ) {
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

  /**
   * create patient additional treatment data
   *
   * @static
   * @returns {json} json object with patient additional treatment data
   * @param body
   * @param paramId
   * @param staff_id
   * @memberOf PharmacyOrderService
   */
  static async createAdditionalTreatment(
    body: PatientTreatmentBody[],
    paramId: number,
    staff_id: number
  ): Promise<AdditionalTreatment[]> {
    const isAdmission = body?.[0].source === 'Admission';
    const entityPromise = isAdmission ? getOneAdmission({ id: paramId }) : getVisitById(paramId);
    const entity = await entityPromise;

    const data = body.map(treatment => ({
      ...treatment,
      patient_id: isAdmission ? entity.patient_id : entity.patient_id,
      date_entered: Date.now(),
      visit_id: isAdmission ? (entity instanceof Admission ? entity?.visit_id : null) : entity.id,
      staff_id,
      admission_id: isAdmission ? entity.id : null,
    }));

    return createBulkAdditionalTreatment(data);
  }

  /**
   * get patient additional treatments data
   *
   * @static
   * @returns {json} json object with patient additional treatments data
   * @param body
   * @memberOf PharmacyOrderService
   */
  static async getAdditionalTreatments(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.values(body).length) {
      return getAdditionalTreatments({ currentPage, pageLimit, filter });
    }

    return getAdditionalTreatments({ filter });
  }

  private static drugPrescriptionData(
    body: PrescribedDrugBody | PrescribedAdditionalItemBody,
    patient_id: number
  ) {
    return {
      source: body.source,
      requester: 'staff_id' in body ? body.staff_id : body.examiner,
      visit_id: body.visit_id,
      patient_id,
      date_prescribed: Date.now(),
      ...(body?.ante_natal_id && { ante_natal_id: body?.ante_natal_id }),
    };
  }
}
export default PharmacyOrderService;
