import { PrescribedService } from '../../../database/models/prescribedService';

/**
 * prescribe multiple services for patient
 * @param data
 * @returns {object} prescribed service data
 */
export const orderBulkService = async data => {
  return PrescribedService.bulkCreate(data);
};

/**
 * prescribe a service for patient
 * @param data
 * @returns {object} prescribed service data
 */
export const prescribeService = async data => {
  const { service_id, requester, price, patient_id, visit_id, service_type } = data;

  return PrescribedService.create({
    service_id,
    service_type,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
  });
};
