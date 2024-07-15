import { createTriage, getOneTriage, getTriageInAVisit } from './triage.repository';
import VisitService from '../Visit/visit.service';
import { getPatientPendingPrescriptions, getVisit, updateVisit } from '../Visit/visit.repository';
import { Triage } from '../../database/models';
import { isEmpty } from 'lodash';
import { BadException } from '../../common/util/api-error';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import PatientService from '../Patient/patient.service';

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

    console.log(pendingPrescriptions);

    const prescriptionsValues = Object.values(pendingPrescriptions).filter(Boolean);

    if (!isEmpty(prescriptionsValues) && (!visit?.patient?.has_insurance || !visit?.insurance)) {
      throw new BadException(
        'Error',
        400,
        'Patient has pending payments, you cannot create vitals'
      );
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
}
export default TriageService;
