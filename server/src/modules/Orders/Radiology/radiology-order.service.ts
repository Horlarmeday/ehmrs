import {
  deletePrescribedInvestigation,
  getOnePrescribedInvestigation,
  getPrescribedInvestigations,
  orderBulkInvestigation,
  prescribeInvestigation,
  updatePrescribedInvestigation,
} from './radiology-order.repository';
import VisitService from '../../Visit/visit.service';
import PatientService from '../../Patient/patient.service';
import {
  createInvestigationPrescription,
  getInvestigationPrice,
  getLastInvestigationPrescription,
} from '../../Radiology/radiology.repository';
import { PrescribedInvestigationBody } from './types/radiology-order.types';
import { InvestigationPrescription, PrescribedInvestigation } from '../../../database/models';
import { isToday, StatusCodes } from '../../../core/helpers/helper';
import { InvestigationStatus } from '../../../database/models/investigationPrescription';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PrescriptionType } from '../../../database/models/prescribedTest';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { BadException } from '../../../common/util/api-error';
import { CANNOT_DELETE_DRUG } from '../Pharmacy/messages/response-messages';
import { CANNOT_DELETE_INVESTIGATION } from './messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';

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

    const [patient, prescription, insurance] = await Promise.all([
      PatientService.getPatientById(visit.patient_id),
      this.getInvestigationPrescription(visit.patient_id, body),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
    ]);

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
        ...(investigation.investigation_type === PrescriptionType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
        patient_insurance_id: insurance?.id,
      }))
    );
    return orderBulkInvestigation(bulkInvestigations);
  }

  /**
   * update a prescribed investigation
   *
   * @static
   * @returns {json} json object with prescribed investigation data
   * @param body
   * @memberOf RadiologyOrderService
   */
  static async updatePrecribedInvestigation(body) {
    return updatePrescribedInvestigation(body);
  }

  /**
   * prescribe an investigation for patient
   *
   * @static
   * @returns {json} json object with prescribed investigation data
   * @param body
   * @memberOf RadiologyOrderService
   */
  static async deleteInvestigation(body) {
    const allowedStatuses = [PaymentStatus.PAID, PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
    const investigation = await getOnePrescribedInvestigation({ id: body.investigationId });
    if (investigation && allowedStatuses.includes(investigation.payment_status))
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_INVESTIGATION);

    return deletePrescribedInvestigation(body.investigationId);
  }

  /**
   * get the investigation prescription
   *
   * @static
   * @returns {Promise<InvestigationPrescription>} json object with prescribed investigation data
   * @memberOf RadiologyOrderService
   * @param patient_id
   * @param data
   */
  static async getInvestigationPrescription(
    patient_id: number,
    data: PrescribedInvestigationBody
  ): Promise<InvestigationPrescription> {
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

  /**
   * get prescribed investigations
   *
   * @static
   * @returns {json} json object with prescribed investigations data
   * @param body
   * @memberOf RadiologyOrderService
   */
  static async getPrescribedInvestigations(body) {
    const { currentPage, pageLimit, filter } = body;

    if (Object.values(body).length) {
      return getPrescribedInvestigations({ currentPage, pageLimit, filter });
    }

    return getPrescribedInvestigations({ filter });
  }

  private static investigationData(body: PrescribedInvestigationBody, patient_id: number) {
    return {
      source: body.investigations[0]?.source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_requested: Date.now(),
      ...(body.investigations[0]?.ante_natal_id && {
        ante_natal_id: body.investigations[0]?.ante_natal_id,
      }),
    };
  }
}
