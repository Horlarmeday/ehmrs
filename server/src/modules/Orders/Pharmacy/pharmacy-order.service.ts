import { prescribeDrug } from './pharmacy-order.repository';
import { PrescribedDrugBody } from './interface/prescribed-drug.body';
import { NHIS } from '../../../core/constants';
import { PrescribedDrug } from './interface/prescribed-drug.interface';

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
    const { drug_type, total_price } = body;
    const capitated_price = total_price * 0.1;
    return prescribeDrug({
      ...body,
      capitated_price: drug_type === NHIS ? capitated_price : null,
      total_price: drug_type === NHIS ? capitated_price : total_price,
    });
  }
}
export default PharmacyOrderService;
