import { OperationNoteBody, RequestSurgeryBody } from './types/surgery.types';
import { getVisitById, searchCategoryVisits } from '../Visit/visit.repository';
import {
  createOperationNote,
  getOneSurgery,
  getOperationNotes,
  getSurgeries,
  requestSurgery,
} from './surgery.repository';
import { OperationNote, SurgeryRequest, Visit } from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

export class SurgeryService {
  /**
   * request surgery
   * @param body
   */
  static async requestSurgery(body: RequestSurgeryBody) {
    const { visit_id } = body;
    const visit = await getVisitById(visit_id);
    const insurance = await getPatientInsuranceQuery({
      patient_id: visit.patient_id,
      is_default: true,
    });

    return await requestSurgery({
      ...body,
      patient_id: visit.patient_id,
      date_requested: Date.now(),
      patient_insurance_id: insurance?.id,
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
    return getOneSurgery({ visit_id });
  }

  /**
   * get surgery requests
   *
   * @static
   * @param body
   * @memberOf SurgeryService
   */
  static async getSurgeryRequests(body) {
    const { currentPage, pageLimit, search, start, end } = body;

    if (Object.values(body).length) {
      return getSurgeries({ currentPage, pageLimit, search, start, end });
    }

    return getSurgeries({ currentPage, pageLimit });
  }

  /**
   * create operation note
   * @param body
   */
  static async createOperationNote(body: OperationNoteBody) {
    const { visit_id } = body;
    const visit = await getVisitById(visit_id);
    return await createOperationNote({
      ...body,
      patient_id: visit.patient_id,
    });
  }

  /**
   * get operation notes
   *
   * @method
   * @returns {Promise<OperationNote[]>} json object with operation notes data
   * @memberOf SurgeryService
   * @param visit_id
   */
  static async getOperationNotes(visit_id: number): Promise<OperationNote[]> {
    return getOperationNotes(visit_id);
  }
}
