import { prescribeDrug } from './pharmacy-order.repository';
import { PrescribedDrugBody } from './interface/prescribed-drug.body';
import { PrescribedDrug } from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import VisitService from '../../Visit/visit.service';
import { DrugType } from '../../../database/models/pharmacyStore';
import { getDrugPrice } from '../../Pharmacy/pharmacy.repository';

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
    const { drug_type, total_price, drug_id, visit_id } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const drugPrice = await getDrugPrice(patient, drug_id);
    return prescribeDrug({
      ...body,
      total_price: this.getTotalPrice(total_price, drugPrice, drug_type),
    });
  }

  static getTotalPrice(totalPrice: number, hmoPrice: number, drug_type: DrugType) {
    if (drug_type === DrugType.NHIS) return totalPrice * 0.1;
    if (drug_type === DrugType.CASH) return hmoPrice || totalPrice;
    return totalPrice;
  }
}
export default PharmacyOrderService;
