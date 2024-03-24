import { OperationNote, Patient, Service, Staff, SurgeryRequest } from '../../database/models';
import { Op, WhereOptions } from 'sequelize';
import { dateIntervalQuery, patientAttributes, staffAttributes } from '../../core/helpers/helper';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

/**
 * request surgery
 * @param data
 * @returns {Promise<SurgeryRequest>} item data
 */
export const requestSurgery = async (data): Promise<SurgeryRequest> => {
  return SurgeryRequest.create({ ...data });
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
