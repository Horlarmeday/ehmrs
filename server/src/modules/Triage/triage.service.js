import { createTriage, getTriageInAVisit } from './triage.repository';

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
    return createTriage(body);
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
