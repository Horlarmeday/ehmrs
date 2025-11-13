import {
  deleteService,
  getPrescribedServices,
  getPrescriptionServices,
  orderBulkService,
  prescribeService,
  updatePrescribedService,
} from './service-order.repository';
import VisitService from '../../Visit/visit.service';
import PatientService from '../../Patient/patient.service';
import { PrescribedService } from '../../../database/models';
import { PrescribedBulkServiceBody } from './types/service-order.types';
import { getServicePrice } from '../../AdminSettings/admin.repository';
import { PrescriptionType } from '../../../database/models/prescribedTest';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { ServiceType } from '../../../database/models/prescribedService';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { CANNOT_DELETE_SERVICE, UNSUPPORTED_SERVICE_REVERSAL_PAYMENT } from './messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import sequelizeConnection from '../../../database/config/data-source';
import { PaymentReversalService } from '../../Accounting/services/paymentReversal.service';
import { BillItemTypeEnum, PaymentMethod } from '../../Accounting/enums';
import { IJwtPayload } from '../../../core/middleware/verify';

export class ServiceOrderService {
  /**
   * prescribe a service for patient
   *
   * @static
   * @returns {json} json object with prescribed service data
   * @param body
   * @memberOf ServiceOrderService
   */
  static async prescribeService(body) {
    return prescribeService(body);
  }

  /**
   * order bulk service for patient
   *
   * @static
   * @returns {json} json object with prescribed service data
   * @param body
   * @memberOf ServiceOrderService
   */
  static async orderBulkService(body: PrescribedBulkServiceBody): Promise<PrescribedService[]> {
    const { services, staff_id, visit_id } = body;
    const visit = await VisitService.getVisitById(visit_id);

    const [patient, insurance] = await Promise.all([
      PatientService.getPatientById(visit.patient_id),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
    ]);

    const bulkServices = await Promise.all(
      services.map(async service => ({
        ...service,
        price:
          (await getServicePrice(patient, service.service_id)) ||
          +service.price * (+service.quantity || 1),
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
        ...(service.service_type === ServiceType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
        patient_insurance_id: insurance?.id,
      }))
    );
    return orderBulkService(bulkServices);
  }

  /**
   * get prescribed services
   *
   * @static
   * @returns {json} json object with prescribed services data
   * @param body
   * @memberOf ServiceOrderService
   */
  static async getPrescribedServices(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getPrescribedServices({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPrescribedServices({ currentPage, pageLimit });
    }

    return getPrescribedServices({});
  }

  /**
   * update a prescribed service
   *
   * @static
   * @returns {json} json object with prescribed service data
   * @param body
   * @param staffId
   * @memberOf ServiceOrderService
   */
  static async updatePrescribedService(body: Partial<PrescribedService>, staffId: number) {
    return updatePrescribedService({ ...body, service_changed_by: staffId });
  }

  /**
   * update bulk prescribed service
   *
   * @static
   * @returns {Promise<PrescribedService>} json object with prescribed drug data
   * @param body
   * @memberOf ServiceOrderService
   */
  static async updateBulkPrescribedService(body: Partial<PrescribedService>[]) {
    return await Promise.all(body.map(async data => await updatePrescribedService(data)));
  }

  /**
   * get prescribed services
   *
   * @static
   * @returns {json} json object with prescribed drugs data
   * @memberOf ServiceOrderService
   * @param visitId
   */
  static async getServicesPrescribed(visitId: number) {
    return getPrescriptionServices({ visit_id: visitId });
  }

  /**
   * delete prescribed service
   *
   * @static
   * @returns {json} json object with prescribed service data
   * @param body
   * @param staff
   * @memberOf ServiceOrderService
   */
  static async deletePrescribedService(body, staff: IJwtPayload) {
    const isAdmin = staff.role === 'Super Admin';
    const transaction = await sequelizeConnection.transaction();

    try {
      const service = await PrescribedService.findByPk(body.serviceId, { transaction });
      if (!service) {
        await transaction.rollback();
        return 0;
      }

      const summary = await PaymentReversalService.getBillItemPaymentSummary(
        BillItemTypeEnum.SERVICE,
        body.serviceId,
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
            UNSUPPORTED_SERVICE_REVERSAL_PAYMENT
          );
        }

        await PaymentReversalService.reverseAllocationsForSummary(summary, staff.sub, transaction);
      } else {
        const blockedStatuses = [PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
        if (blockedStatuses.includes(service.payment_status)) {
          throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_SERVICE);
        }
      }

      const deletedCount = await deleteService(body.serviceId, transaction);

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
}
