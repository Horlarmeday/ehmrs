import {
  createTriage,
  getOneTriage,
  getPatientTriages,
  getTriageInAVisit,
} from './triage.repository';
import VisitService from '../Visit/visit.service';
import { getPatientPendingPrescriptions, getVisit, updateVisit } from '../Visit/visit.repository';
import { Triage } from '../../database/models';
import { isEmpty } from 'lodash';
import { BadException } from '../../common/util/api-error';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import PatientService from '../Patient/patient.service';
import { PATIENT_HAS_PENDING_PAYMENT } from './messages/response.messages';

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
    const [pendingPrescriptions, visit] = await Promise.all([
      getPatientPendingPrescriptions(body.visit_id),
      getVisit(body.visit_id),
    ]);

    const prescriptionsValues = Object.values(pendingPrescriptions).filter(Boolean);

    if (!isEmpty(prescriptionsValues) && (!visit?.patient?.has_insurance || !visit?.insurance)) {
      throw new BadException('Error', 400, PATIENT_HAS_PENDING_PAYMENT);
    }

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

  /**
   * get one triage
   *
   * @static
   * @returns {json} json object with triage data
   * @param body
   * @memberOf TriageService
   */
  static async getOneTriage(body) {
    return getOneTriage({ patient_id: body.patientId }, ['height']);
  }

  /**
   * get triages
   *
   * @static
   * @returns {json} json object with triages data
   * @param body
   * @memberOf TriageService
   */
  static async getPatientTriages(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.values(body)?.length) {
      return getPatientTriages({ currentPage, pageLimit, filter });
    }
    return getPatientTriages({ filter });
  }
}
export default TriageService;
