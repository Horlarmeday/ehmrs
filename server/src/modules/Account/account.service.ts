import { AccountDto } from './dto/account.dto';
import { getVisitById } from '../Visit/visit.repository';
import { createPaymentHistory, getPatientPaymentHistory } from './account.repository';

export class AccountService {
  /** create payment history
   *
   * @static
   * @returns {json} json object with payment history data
   * @param body
   * @memberOf AccountService
   */
  static async createPaymentHistory(body: AccountDto) {
    const visit = await getVisitById(body.visit_id);
    return await createPaymentHistory({ ...body, patient_id: visit.patient_id });
  }

  /** get a patient payment history
   *
   * @static
   * @returns {json} json object with payment history data
   * @param body
   * @memberOf AccountService
   */
  static async getPaymentHistory(body) {
    const { patient_id, currentPage, pageLimit } = body;
    if (Object.values(body).length) {
      return getPatientPaymentHistory({ patient_id, currentPage, pageLimit });
    }
    return getPatientPaymentHistory({ patient_id });
  }
}
