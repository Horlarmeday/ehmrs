import {
  OperationNote,
  Patient,
  PrescribedService,
  Service,
  Staff,
  SurgeryRequest,
} from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { dateIntervalQuery, patientAttributes, staffAttributes } from '../../core/helpers/helper';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import sequelizeConnection from '../../database/config/config';
import { ServiceType } from '../../database/models/prescribedService';
import { BadException } from '../../common/util/api-error';

/**
 * request surgery
 * @param data
 * @returns {Promise<SurgeryRequest>} item data
 */
export const requestSurgery = async (data): Promise<SurgeryRequest> => {
  return await sequelizeConnection.transaction(async t => {
    const service = await Service.findOne({ where: { id: data.service_id }, transaction: t });
    if (!service) throw new BadException('Error', 400, 'Cannot find service');

    const surgeryRequest = await SurgeryRequest.create({ ...data }, { transaction: t });

    await PrescribedService.create(
      {
        service_id: service.id,
        price: service.price,
        service_type: ServiceType.CASH,
        requester: data.staff_id,
        visit_id: data.visit_id,
        patient_id: data.patient_id,
        date_requested: Date.now(),
      },
      { transaction: t }
    );
    return surgeryRequest;
  });
};

/**
 * get one surgery
 * @param query
 */
export const getOneSurgery = async (query: WhereOptions<SurgeryRequest>) => {
  const request = await SurgeryRequest.findOne({
    where: { ...query },
    include: [
      { model: Patient, attributes: patientAttributes },
      { model: Service, attributes: ['name'] },
      { model: Staff, attributes: staffAttributes },
    ],
  });
  if (request) {
    const insurance = await getPatientInsuranceQuery({
      patient_id: request?.patient_id,
      is_default: true,
    });
    return { ...request.toJSON(), insurance };
  }
  return null;
};

/**
 * get surgeries
 *
 * @function
 * @returns {Promise<{ total: any; docs: SurgeryRequest[]; pages: number; perPage: number; currentPage: number }>} json object with active visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 * @param filter
 */
export const getSurgeries = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}): Promise<{
  total: any;
  docs: SurgeryRequest[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return SurgeryRequest.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('date_requested', start, end)),
    },
    include: [
      { model: Service, attributes: ['name'] },
      { model: Staff, attributes: staffAttributes },
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
      },
    ],
  });
};

/**
 * create operation note
 * @param data
 * @returns {Promise<OperationNote>} operation note data
 */
export const createOperationNote = async (data): Promise<OperationNote> => {
  return OperationNote.create({ ...data });
};

/**
 * get operation notes
 * @returns json object with operation notes data
 * @param visitId
 */
export const getOperationNotes = async (visitId: number): Promise<OperationNote[]> => {
  return OperationNote.findAll({
    where: {
      visit_id: visitId,
    },
    include: [
      { model: Staff, as: 'staff', attributes: staffAttributes },
      { model: Staff, as: 'anaesthetist', attributes: staffAttributes },
      { model: Staff, as: 'scrub_nurse', attributes: staffAttributes },
      { model: Staff, as: 'surgeon', attributes: staffAttributes },
    ],
  });
};
