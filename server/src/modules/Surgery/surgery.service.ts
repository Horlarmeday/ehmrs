import { RequestSurgeryBody } from './types/surgery.types';
import { getVisitById } from '../Visit/visit.repository';
import { getOneSurgery, requestSurgery } from './surgery.repository';
import { SurgeryRequest } from '../../database/models';

export class SurgeryService {
  static async requestSurgery(body: RequestSurgeryBody) {
    const { visit_id } = body;
    const visit = await getVisitById(visit_id);
    return await requestSurgery({
      ...body,
      patient_id: visit.patient_id,
      date_requested: Date.now(),
    });
  }

  /**
   * get patient surgery
   *
   * @method
   * @returns {Promise<SurgeryRequest>} json object with surgery data
   * @memberOf SurgeryService
   * @param visit_id
   */
  static async getPatientSurgery(visit_id: number): Promise<SurgeryRequest> {
    return await getOneSurgery({ visit_id });
  }
}
