import { PrescribedService } from '../../../database/models';
import { PrescribeServiceBody } from './types/service-order.types';
import { WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { Service, Staff } from '../../../database/models';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { StatusCodes } from '../../../core/helpers/helper';
import { BadException } from '../../../common/util/api-error';
import { ERROR_UPDATING_SERVICE } from './messages/response-messages';
import { sequelizeConnection } from '../../../database/config/data-source';
import {
  emitChargeCapturedForRows,
  deletePrescribedLineWithReversalRequested,
} from '../../Outbox/outbox-writer';

/**
 * prescribe multiple services for patient
 * @param data
 * @returns {object} prescribed service data
 */
export const orderBulkService = async data => {
  // A1.2b: wrap so the services and their outbox events commit atomically.
  return sequelizeConnection.transaction(async t => {
    const services = await PrescribedService.bulkCreate(data, { transaction: t });
    await emitChargeCapturedForRows('service', services, dayjs().format('YYYY-MM-DD'), t);
    return services;
  });
};

/**
 * prescribe a service for patient
 * @param data
 * @returns {Promise<PrescribedService>} prescribed service data
 */
export const prescribeService = async (data: PrescribeServiceBody): Promise<PrescribedService> => {
  const {
    service_id,
    requester,
    price,
    patient_id,
    visit_id,
    service_type,
    ante_natal_id,
    surgery_id,
  } = data || {};

  return sequelizeConnection.transaction(async t => {
    const service = await PrescribedService.create(
      {
        service_id,
        service_type,
        requester,
        price,
        patient_id,
        date_requested: Date.now(),
        visit_id,
        surgery_id,
        ante_natal_id,
      },
      { transaction: t }
    );
    await emitChargeCapturedForRows('service', [service], dayjs().format('YYYY-MM-DD'), t);
    return service;
  });
};

/**
 * update prescribed service
 * @param data
 */
export const updatePrescribedService = async (data: Partial<PrescribedService>) => {
  try {
    await PrescribedService.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_SERVICE);
  }
  return getOnePrescribedService({ id: data.id });
};

/**
 * get all prescribed services
 * @param query
 * @returns {Promise<PrescribedService[]>} prescribed services data
 */
export const getPrescriptionServices = async (
  query: WhereOptions<PrescribedService>
): Promise<PrescribedService[]> => {
  return await PrescribedService.findAll({
    where: { ...query },
    include: [
      { model: Service, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
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
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Service,
        attributes: ['name', 'type'],
      },
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
      },
      {
        model: Staff,
        as: 'nhis_service_processor',
        attributes: staffAttributes,
      },
    ],
  });
};

/**
 * get one prescribed service
 * @param query
 * @returns {Promise<PrescribedService>} prescribed service data
 */
export const getOnePrescribedService = async (
  query: WhereOptions<PrescribedService>
): Promise<PrescribedService> => {
  return await PrescribedService.findOne({
    where: { ...query },
    include: [
      { model: Service, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_service_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * delete prescribed service
 * @returns {number} prescribed service data
 * @param serviceId
 */
export const deleteService = async serviceId => {
  return deletePrescribedLineWithReversalRequested(
    'service',
    serviceId,
    transaction => PrescribedService.findOne({ where: { id: serviceId }, transaction }),
    transaction => PrescribedService.destroy({ where: { id: serviceId }, transaction })
  );
};
