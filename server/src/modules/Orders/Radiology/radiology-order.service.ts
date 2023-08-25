import { orderBulkInvestigation, prescribeInvestigation } from './radiology-order.repository';
import VisitService from '../../Visit/visit.service';
import PatientService from '../../Patient/patient.service';
import {
  createInvestigationPrescription,
  getInvestigationPrice,
  getLastInvestigationPrescription,
} from '../../Radiology/radiology.repository';
import { PrescribedInvestigationBody } from './types/radiology-order.types';
import { PrescribedInvestigation } from '../../../database/models';
import { isToday } from '../../../core/helpers/helper';
import { InvestigationStatus } from '../../../database/models/investigationPrescription';

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
    const prescription = await this.getInvestigationPrescription(visit.patient_id, body);
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
        investigation_prescription_id: prescription.id,
      }))
    );
    return orderBulkInvestigation(bulkInvestigations);
  }

  /**
   * get the investigation prescription
   *
   * @static
   * @returns {json} json object with prescribed investigation data
   * @memberOf RadiologyOrderService
   * @param patient_id
   * @param data
   */
  static async getInvestigationPrescription(patient_id: number, data: PrescribedInvestigationBody) {
    const lastPrescription = await getLastInvestigationPrescription(patient_id);

    if (lastPrescription && !isToday(lastPrescription?.date_requested))
      return createInvestigationPrescription(this.investigationData(data, patient_id));

    // if today and result has not been inputted - pick the id and use it in the prescribed investigation
    if (lastPrescription?.status === InvestigationStatus.PENDING) return lastPrescription;

    // if today and result is added - create new one
    if (lastPrescription?.status === InvestigationStatus.RESULT_ADDED)
      return createInvestigationPrescription(this.investigationData(data, patient_id));

    return createInvestigationPrescription(this.investigationData(data, patient_id));
  }

  static investigationData(body: PrescribedInvestigationBody, patient_id: number) {
    return {
      source: body.source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_requested: Date.now(),
    };
  }
}
