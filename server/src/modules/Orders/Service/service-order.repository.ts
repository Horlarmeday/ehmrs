import { PrescribedService } from '../../../database/models';
import { PrescribeServiceBody } from './types/service-order.types';
import { WhereOptions } from 'sequelize';
import { Service, Staff } from '../../../database/models';
import { staffAttributes } from '../../Antenatal/antenatal.repository';

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
 * @returns {Promise<PrescribedService>} prescribed service data
 */
export const prescribeService = async (data: PrescribeServiceBody): Promise<PrescribedService> => {
  const { service_id, requester, price, patient_id, visit_id, service_type, ante_natal_id } =
    data || {};

  return PrescribedService.create({
    service_id,
    service_type,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    ante_natal_id,
  });
};

/**
 * get all prescribed services
 * @param query
 * @returns {Promise<PrescribedService[]>} prescribed services data
 */
export const getPrescriptionServices = async (
  query: WhereOptions<PrescribedService>
): Promise<PrescribedService[]> => {
  return await PrescribedService.findAll({ where: { ...query } });
};

/**
 * get prescribed services
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedServices = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedService.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && { ...JSON.parse(filter) }),
    },
    include: [
      {
        model: Service,
        attributes: ['name'],
      },
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
      },
    ],
  });
};
