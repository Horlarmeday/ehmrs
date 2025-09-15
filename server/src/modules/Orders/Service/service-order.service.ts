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
import { PrescribedService, Service } from '../../../database/models';
import { PrescribedBulkServiceBody } from './types/service-order.types';
import { getServicePrice } from '../../AdminSettings/admin.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { CANNOT_DELETE_INVESTIGATION } from '../Radiology/messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import { insertDefaultDialysisItems } from '../../Visit/visit.repository';
import { logger } from '../../../core/helpers/logger';
import { PrescribedServiceType as ServiceType, PaymentStatus } from '../../../database/enums';

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
    const result = await prescribeService(body);

    // Check if service contains "dialysis" and insert default items
    if (body.patient_id && body.visit_id) {
      try {
        // Get service details to check name
        const service = await Service.findByPk(body.service_id);
        // Multiple ways to check for dialysis
        const isDialysis =
          service &&
          (/dialysis/i.test(service.name) ||
            service.name.toLowerCase().includes('dialysis') ||
            service.name.toUpperCase().includes('DIALYSIS'));

        if (isDialysis) {
          // Get patient and visit details
          const [patient, visit, insurance] = await Promise.all([
            PatientService.getPatientById(body.patient_id),
            VisitService.getVisitById(body.visit_id),
            getPatientInsuranceQuery({
              patient_id: body.patient_id,
              is_default: true,
            }),
          ]);

          if (patient && visit) {
            logger.info('Inserting default dialysis items for single service');
            // Insert default dialysis items in background
            insertDefaultDialysisItems({
              patient,
              visit,
              insurance, // Insurance doesn't matter
            }).catch(error => {
              logger.error('Error inserting default dialysis items for service:', error);
            });
          }
        } else {
          logger.warn('No dialysis service found or service is null');
        }
      } catch (error) {
        logger.error('Error checking dialysis service:', error);
      }
    }

    return result;
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

    const result = await orderBulkService(bulkServices);

    // Check if any service contains "dialysis" and insert default items
    try {
      // Get all service details to check for dialysis
      const serviceDetails = await Promise.all(
        services.map(service => Service.findByPk(service.service_id))
      );

      // Check if any service contains "dialysis" with multiple methods
      const hasDialysisService = serviceDetails.some(service => {
        const isDialysis =
          service &&
          (/dialysis/i.test(service.name) ||
            service.name.toLowerCase().includes('dialysis') ||
            service.name.toUpperCase().includes('DIALYSIS'));

        if (isDialysis) {
          logger.info('Dialysis service detected in bulk order:', service.name);
        }
        return isDialysis;
      });

      if (hasDialysisService && patient && visit) {
        logger.info('Inserting default dialysis items for bulk service');
        // Insert default dialysis items in background
        insertDefaultDialysisItems({
          patient,
          visit,
          insurance,
        }).catch(error => {
          logger.error('Error inserting default dialysis items for bulk service:', error);
        });
      } else {
        logger.warn('Not inserting dialysis items - conditions not met');
      }
    } catch (error) {
      logger.error('Error checking dialysis services for bulk order:', error);
    }

    return result;
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
