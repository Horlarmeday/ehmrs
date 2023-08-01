import { orderBulkInvestigation, prescribeInvestigation } from './radiology-order.repository';
import VisitService from '../../Visit/visit.service';
import PatientService from '../../Patient/patient.service';
import { getInvestigationPrice } from '../../Radiology/radiology.repository';
import { PrescribedInvestigationBody } from './types/radiology-order.types';
import { PrescribedInvestigation } from '../../../database/models/prescribedInvestigation';

export class RadiologyOrderService {
  /**
   * prescribe an investigation for patient
   *
   * @static
   * @returns {json} json object with prescribed investigation data
   * @param body
   * @memberOf RadiologyOrderService
   */
  static async prescribeInvestigationService(body) {
    return prescribeInvestigation(body);
  }

  /**
   * order bulk investigation for patient
   *
   * @static
   * @returns {json} json object with prescribed investigation data
   * @param body
   * @memberOf RadiologyOrderService
   */
  static async orderBulkInvestigationService(
    body: PrescribedInvestigationBody
  ): Promise<PrescribedInvestigation[]> {
    const { investigations, staff_id, visit_id } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const bulkInvestigations = await Promise.all(
      investigations.map(async investigation => ({
        ...investigation,
        price:
          (await getInvestigationPrice(patient, investigation.investigation_id)) ||
          investigation.price,
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
      }))
    );
    return orderBulkInvestigation(bulkInvestigations);
  }
}
