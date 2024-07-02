import {
  deleteService,
  getOnePrescribedService,
  getPrescribedServices,
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
import { CANNOT_DELETE_INVESTIGATION } from '../Radiology/messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';

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
   * @memberOf ServiceOrderService
   */
  static async updatePrescribedService(body) {
    return updatePrescribedService(body);
  }

  /**
   * delete prescribed service
   *
   * @static
   * @returns {json} json object with prescribed service data
   * @param body
   * @memberOf ServiceOrderService
   */
  static async deletePrescribedService(body) {
    const allowedStatuses = [PaymentStatus.PAID, PaymentStatus.PERMITTED, PaymentStatus.CLEARED];

    const service = await getOnePrescribedService({ id: body.serviceId });
    if (service && allowedStatuses.includes(service.payment_status))
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_INVESTIGATION);

    return deleteService(body.serviceId);
  }
}
