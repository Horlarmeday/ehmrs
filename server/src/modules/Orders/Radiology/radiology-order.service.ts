import {
  deletePrescribedInvestigation,
  getPrescribedInvestigations,
  getPrescriptionInvestigations,
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
import {
  InvestigationPrescription,
  PrescribedInvestigation,
  PrescribedTest,
} from '../../../database/models';
import { isToday, StatusCodes } from '../../../core/helpers/helper';
import { InvestigationStatus } from '../../../database/models/investigationPrescription';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PrescriptionType } from '../../../database/models/prescribedTest';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { BadException } from '../../../common/util/api-error';
import {
  CANNOT_DELETE_INVESTIGATION,
  UNSUPPORTED_INVESTIGATION_REVERSAL_PAYMENT,
} from './messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import { getPrescriptionTests } from '../Laboratory/lab-order.repository';
import sequelizeConnection from '../../../database/config/data-source';
import { PaymentReversalService } from '../../Accounting/services/paymentReversal.service';
import { BillItemTypeEnum, PaymentMethod } from '../../Accounting/enums';
import { IJwtPayload } from '../../../core/middleware/verify';

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
        price: (await getInvestigationPrice(patient, investigation)) || investigation.price,
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

    const includesHSG = investigations.some(investigation => /\bHSG\b/i.test(investigation.name));
    return orderBulkInvestigation({
      data: bulkInvestigations,
      includesHSG,
      patient,
      insurance,
      visit_id,
    });
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
  static async deleteInvestigation(body, staff: IJwtPayload) {
    const isAdmin = staff.role === 'Super Admin';
    const transaction = await sequelizeConnection.transaction();

    try {
      const investigation = await PrescribedInvestigation.findByPk(body.investigationId, {
        transaction,
      });

      if (!investigation) {
        await transaction.rollback();
        return 0;
      }

      const summary = await PaymentReversalService.getBillItemPaymentSummary(
        BillItemTypeEnum.INVESTIGATION,
        body.investigationId,
        transaction
      );
      const billId = summary?.bill?.id;
      const hasPayments = Boolean(summary && summary.paymentAllocations.length > 0);

      if (hasPayments && summary) {
        if (!isAdmin)
          throw new BadException(
            'Error',
            StatusCodes.BAD_REQUEST,
            'This item has been paid for, contact admin for help'
          );
        const unsupportedAllocation = summary.paymentAllocations.find(allocation => {
          const method = allocation.payment.payment_method;
          return method === PaymentMethod.INSURANCE || method === PaymentMethod.OTHER;
        });

        if (unsupportedAllocation) {
          throw new BadException(
            'Unsupported Payment Method',
            StatusCodes.BAD_REQUEST,
            UNSUPPORTED_INVESTIGATION_REVERSAL_PAYMENT
          );
        }

        await PaymentReversalService.reverseAllocationsForSummary(summary, staff.sub, transaction);
      } else {
        const blockedStatuses = [PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
        if (blockedStatuses.includes(investigation.payment_status)) {
          throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_INVESTIGATION);
        }
      }

      const deletedCount = await deletePrescribedInvestigation(body.investigationId, transaction);

      if (billId) {
        await PaymentReversalService.reconcileBillStatus(billId, transaction);
      }

      await transaction.commit();
      return deletedCount;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

  /**
   * update bulk prescribed investigations
   *
   * @static
   * @returns {Promise<PrescribedInvestigation>} json object with prescribed investigations data
   * @param body
   * @memberOf LabOrderService
   */
  static async updateBulkPrescribedInvestigations(body: Partial<PrescribedInvestigation>[]) {
    return await Promise.all(body.map(async data => await updatePrescribedInvestigation(data)));
  }

  /**
   * get prescribed investigations
   *
   * @static
   * @returns {json} json object with prescribed drugs data
   * @memberOf RadiologyOrderService
   * @param visitId
   */
  static async getInvestigationsPrescribed(visitId: number) {
    return getPrescriptionInvestigations({ visit_id: visitId });
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
