import { AccountDto } from './dto/account.dto';
import { getVisitById } from '../Visit/visit.repository';
import { createPaymentHistory } from './account.repository';

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
}
