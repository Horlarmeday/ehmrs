import { createTriage, getTriageInAVisit } from './triage.repository';
import VisitService from '../Visit/visit.service';
import { updateVisit } from '../Visit/visit.repository';
import { Triage } from '../../database/models';

class TriageService {
  /**
   * create patient vital signs
   *
   * @static
   * @returns {Promise<Triage>} json object with vital signs data
   * @param body
   * @memberOf TriageService
   */
  static async createTriageService(body): Promise<Triage> {
    const visit = await VisitService.getVisitById(body.visit_id);
    const triage = await createTriage({ ...body, patient_id: visit.patient_id });
    await updateVisit({ id: visit.id }, { has_done_vitals: true });
    return triage;
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
