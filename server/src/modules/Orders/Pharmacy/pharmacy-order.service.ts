import {
  getPrescribedAdditionalItems,
  getPrescribedDrugs,
  prescribeDrug,
} from './pharmacy-order.repository';
import { PrescribedDrugBody } from './interface/prescribed-drug.body';
import { PrescribedDrug } from '../../../database/models';
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
    const { drug_type, total_price, drug_id, visit_id, staff_id } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const drugPrice = await getDrugPrice(patient, drug_id);
    const drugPrescription = await this.getDrugPrescription(patient.id, body);
    return prescribeDrug({
      ...body,
      patient_id: patient.id,
      examiner: staff_id,
      total_price: this.getTotalPrice(total_price, drugPrice, drug_type),
      drug_prescription_id: drugPrescription.id,
    });
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

    if (filter) {
      return getPrescribedDrugs({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPrescribedDrugs({ currentPage, pageLimit });
    }

    return getPrescribedDrugs({});
  }

  static getTotalPrice(totalPrice: number, hmoPrice: number, drug_type: DrugType) {
    if (drug_type === DrugType.NHIS) return totalPrice * 0.1;
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

  static drugPrescriptionData(body: PrescribedDrugBody, patient_id: number) {
    return {
      source: body.source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_prescribed: Date.now(),
    };
  }
}
export default PharmacyOrderService;
