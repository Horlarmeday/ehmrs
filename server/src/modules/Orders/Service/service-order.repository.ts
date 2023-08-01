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
export const prescribeService = data => {
  const { service_id, requester, price, patient_id, visit_id } = data;

  return PrescribedService.create({
    service_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
  });
};
