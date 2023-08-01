import { AdmissionBodyType, UpdateAdmissionBody } from './types/admission.types';
import { admitPatient, getAdmissionByPatientId, updateAdmission } from './admission.repository';
import { getVisitById } from '../Visit/visit.repository';
import { DischargeStatus } from '../../database/models/admission';
import { BadException } from '../../common/util/api-error';
import { StatusCodes } from '../../core/helpers/helper';

export class AdmissionService {
  /**
   * admit a patient to a ward
   *
   * @method
   * @returns {json} json object with admission data
   * @memberOf AdmissionService
   * @param body
   */
  static async admitPatient(body: AdmissionBodyType) {
    const visit = await getVisitById(body.visit_id);
    const admission = await getAdmissionByPatientId(visit.patient_id);
    if (admission && admission?.discharge_status === DischargeStatus.ON_ADMISSION) {
      throw new BadException(
        'Invalid',
        StatusCodes.BAD_REQUEST,
        'Patient still on admission, discharge first'
      );
    }
    return await admitPatient({ ...body, patient_id: visit.patient_id });
  }

  /**
   * get a patient admission data
   *
   * @method
   * @returns {json} json object with admission data
   * @memberOf AdmissionService
   * @param visit_id
   */
  static async getPatientAdmission(visit_id: number) {
    const visit = await getVisitById(visit_id);
    return await getAdmissionByPatientId(visit.patient_id);
  }

  /**
   * update admission details
   * @param body
   */
  static async updateAdmission(body: UpdateAdmissionBody) {
    return updateAdmission(body, body.admissionId);
  }
}
