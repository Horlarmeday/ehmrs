import { Imaging, Investigation, PrescribedInvestigation, Staff } from '../../../database/models';
import { WhereOptions } from 'sequelize';

/**
 * prescribe an investigation for patient
 * @param data
 * @returns {object} prescribed investigation data
 */
export const prescribeInvestigation = data => {
  const {
    investigation_id,
    requester,
    price,
    patient_id,
    visit_id,
    imaging_id,
    ante_natal_id,
  } = data;

  return PrescribedInvestigation.create({
    investigation_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    imaging_id,
    ante_natal_id,
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

/**
 * get all prescribed investigations
 * @param query
 * @returns {Promise<PrescribedInvestigation[]>} prescribed investigations data
 */
export const getPrescriptionInvestigations = async (
  query: WhereOptions<PrescribedInvestigation>
): Promise<PrescribedInvestigation[]> => {
  return await PrescribedInvestigation.findAll({
    where: { ...query },
    include: [
      { model: Investigation, attributes: ['name'] },
      { model: Imaging, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname', 'fullname'] },
    ],
  });
};
