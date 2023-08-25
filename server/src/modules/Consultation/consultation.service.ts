/* eslint-disable camelcase,no-param-reassign */
import {
  bulkCreateComplaint,
  createComplaint,
  bulkCreateDiagnosis,
  createObservation,
  getConsultationSummary,
} from './consultation.repository';
import { checkValueExists } from '../../core/helpers/helper';
import VisitService from '../Visit/visit.service';
import { Observation } from './interface/consultation.interface';

class ConsultationService {
  /**
   * create patient observation
   *
   * @static
   * @returns {json} json object with observation data
   * @param body
   * @memberOf ConsultationService
   */
  static async createObservationService(body: Observation) {
    const { complaints, staff_id, visit_id, diagnosis } = body;
    let history;
    const visit = await VisitService.getVisitById(visit_id);

    if (checkValueExists(body)) {
      history = await createObservation({ ...body, patient_id: visit.patient_id });
    }

    let mappedComplaints;
    if (complaints?.length) {
      mappedComplaints = complaints.map(complain => {
        complain.staff_id = staff_id;
        complain.visit_id = visit_id;
        complain.patient_id = visit.patient_id;
        return complain;
      });
    }

    const mappedDiagnosis = diagnosis.map(result => {
      result.staff_id = staff_id;
      result.patient_id = visit.patient_id;
      result.visit_id = visit_id;
      return result;
    });

    const [createdComplaints, diagnoses] = await Promise.all([
      mappedComplaints?.length && bulkCreateComplaint(mappedComplaints),
      bulkCreateDiagnosis(mappedDiagnosis),
    ]);

    return { history, createdComplaints, diagnoses };
  }

  /**
   * create patient diagnosis - DEPRECATED
   *
   * @static
   * @returns {json} json object with diagnosis data
   * @param body
   * @memberOf ConsultationService
   */
  static async createDiagnosisService(body) {
    const { diagnosis, visit_id, staff_id } = body;
    const visit = await VisitService.getVisitById(visit_id);

    const mappedDiagnosis = diagnosis.map(result => {
      result.staff_id = staff_id;
      result.patient_id = visit.patient_id;
      result.visit_id = visit_id;
      return result;
    });
    return bulkCreateDiagnosis(mappedDiagnosis);
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
