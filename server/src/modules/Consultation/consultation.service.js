/* eslint-disable camelcase,no-param-reassign */
import {
  createComplaint,
  createDiagnosis,
  createHistory,
  getConsultationSummary,
} from './consultation.repository';
import { checkValueExists } from '../../helpers/helper';
import VisitService from '../Visit/visit.service';

class ConsultationService {
  /**
   * create patient observation
   *
   * @static
   * @returns {json} json object with observation data
   * @param body
   * @memberOf ConsultationService
   */
  static async createObservationService(body) {
    const { complaints, staff_id, visit_id } = body;
    let history;
    const visit = await VisitService.getVisitById(visit_id);

    if (checkValueExists(body)) {
      history = await createHistory({ ...body, patient_id: visit.patient_id });
    }

    const complaint = await Promise.all(
      complaints.map(async complain => {
        complain.staff_id = staff_id;
        complain.visit_id = visit_id;
        complain.patient_id = visit.patient_id;
        await createComplaint(complain);
        return complain;
      })
    );

    return { history, complaint };
  }

  /**
   * create patient diagnosis
   *
   * @static
   * @returns {json} json object with diagnosis data
   * @param body
   * @memberOf ConsultationService
   */
  static async createDiagnosisService(body) {
    const visit = await VisitService.getVisitById(body.visit_id);
    return createDiagnosis({ ...body, patient_id: visit.patient_id });
  }

  /**
   * get patient consultation summary
   *
   * @static
   * @returns {json} json object with consultation summary data
   * @param body
   * @memberOf ConsultationService
   */
  static async getConsultationSummary(body) {
    return getConsultationSummary(body);
  }
}

export default ConsultationService;
