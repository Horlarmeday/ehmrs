import { createTriage, getTriageInAVisit } from './triage.repository';
import VisitService from '../Visit/visit.service';

class TriageService {
  /**
   * create patient vital signs
   *
   * @static
   * @returns {json} json object with vital signs data
   * @param body
   * @memberOf TriageService
   */
  static async createTriageService(body) {
    const visit = await VisitService.getVisitById(body.visit_id);
    return createTriage({ ...body, patient_id: visit.patient_id });
  }

  /**
   * get all triage done in a visit
   *
   * @static
   * @returns {json} json object with triage data
   * @param body
   * @memberOf TriageService
   */
  static async getVisitTriage(body) {
    return getTriageInAVisit(body);
  }
}
export default TriageService;
