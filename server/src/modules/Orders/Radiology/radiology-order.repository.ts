import { Imaging, Investigation, PrescribedInvestigation, Staff } from '../../../database/models';
import { WhereOptions } from 'sequelize';
import { staffAttributes } from '../../Antenatal/antenatal.repository';

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
  const investigations = await PrescribedInvestigation.bulkCreate(data);
  const testIds = investigations.map(({ id }) => id);
  return getPrescriptionInvestigations({ id: testIds });
};

/**
 * get prescribed investigations
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedInvestigations = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedInvestigation.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && { ...JSON.parse(filter) }),
    },
    include: [
      { model: Investigation, attributes: ['name'] },
      { model: Imaging, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
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
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};
