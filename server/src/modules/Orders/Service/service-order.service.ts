import { orderBulkService, prescribeService } from './service-order.repository';
import VisitService from '../../Visit/visit.service';
import PatientService from '../../Patient/patient.service';
import { PrescribedService } from '../../../database/models/prescribedService';
import { PrescribedServiceBody } from './types/service-order.types';
import { getServicePrice } from '../../AdminSettings/admin.repository';

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
  static async orderBulkService(body: PrescribedServiceBody): Promise<PrescribedService[]> {
    const { services, staff_id, visit_id } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const bulkServices = await Promise.all(
      services.map(async service => ({
        ...service,
        price: (await getServicePrice(patient, service.service_id)) || service.price,
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
      }))
    );
    return orderBulkService(bulkServices);
  }
}
