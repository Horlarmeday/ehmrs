import { PrescribedInvestigation } from '../../../database/models';

/**
 * prescribe an investigation for patient
 * @param data
 * @returns {object} prescribed investigation data
 */
export const prescribeInvestigation = data => {
  const { investigation_id, requester, price, patient_id, visit_id } = data;

  return PrescribedInvestigation.create({
    investigation_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
  });
};

/**
 * prescribe multiple investigations for patient
 * @param data
 * @returns {object} prescribed investigation data
 */
export const orderBulkInvestigation = async data => {
  return PrescribedInvestigation.bulkCreate(data);
};
