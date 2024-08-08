/* eslint-disable camelcase,no-param-reassign */
import {
  bulkCreateComplaint,
  createComplaint,
  bulkCreateDiagnosis,
  createObservation,
  getConsultationSummary,
  getVisitsHistory,
  getDiagnosesAndFindings,
  getDiagnoses,
  getHistories,
} from './consultation.repository';
import { checkValueExists } from '../../core/helpers/helper';
import VisitService from '../Visit/visit.service';
import { Observation } from './interface/consultation.interface';
import { AntenatalObservation, Complaint, Diagnosis, History } from '../../database/models';
import { getVisitById, updateVisit } from '../Visit/visit.repository';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

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
    const { staff_id, visit_id, diagnosis } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const insurance = await getPatientInsuranceQuery({
      patient_id: visit.patient_id,
      is_default: true,
    });

    const history = await createObservation({
      ...body,
      patient_id: visit.patient_id,
      patient_insurance_id: insurance?.id,
    });

    // let mappedComplaints: Complaint[];
    // if (complaints?.length) {
    //   mappedComplaints = complaints.map(complain => {
    //     complain.staff_id = staff_id;
    //     complain.visit_id = visit_id;
    //     complain.patient_id = visit.patient_id;
    //     complain.patient_insurance_id = insurance?.id;
    //     return complain;
    //   });
    // }

    const mappedDiagnosis = diagnosis.map(result => {
      result.staff_id = staff_id;
      result.patient_id = visit.patient_id;
      result.visit_id = visit_id;
      return result;
    });

    const [diagnoses] = await Promise.all([
      bulkCreateDiagnosis(mappedDiagnosis),
      updateVisit({ id: visit_id }, { is_taken: true }),
    ]);

    return { history, diagnoses };
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

  /**
   * Get visits history
   * @param body
   * @memberof ConsultationService
   */
  static async getVisitsHistory(body) {
    const { currentPage, pageLimit, visitId } = body;

    const visit = await getVisitById(visitId);

    if (Object.keys(body).length) {
      return getVisitsHistory(currentPage, pageLimit, visit.patient_id);
    }

    return getVisitsHistory(1, 5, visit.patient_id);
  }

  /**
   * get patient consultation diagnoses and findings
   *
   * @static
   * @returns {json} json object with consultation summary data
   * @param body
   * @memberOf ConsultationService
   */
  static async getDiagnosesAndFindings(
    body
  ): Promise<{
    diagnoses: Diagnosis[];
    findings: { histories: History[]; complaints: Complaint[] } | AntenatalObservation[];
  }> {
    return getDiagnosesAndFindings(body);
  }

  /**
   * get diagnoses
   *
   * @static
   * @returns {json} json object with diagnoses data
   * @param body
   * @memberOf ConsultationService
   */
  static async getDiagnoses(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.keys(body).length) {
      return getDiagnoses({ currentPage, pageLimit, filter });
    }
    return getDiagnoses({ filter });
  }

  /**
   * get consultation histories
   *
   * @static
   * @returns {json} json object with diagnoses data
   * @param body
   * @memberOf ConsultationService
   */
  static async getConsultationHistories(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.keys(body).length) {
      return getHistories({ currentPage, pageLimit, filter });
    }
    return getHistories({ filter });
  }
}

export default ConsultationService;
