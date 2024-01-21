import { Op, Optional, WhereOptions } from 'sequelize';
import { Immunization, Patient, Staff } from '../../database/models';
import { staffAttributes, patientAttributes } from '../../core/helpers/helper';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

/**
 * Enrol patient for immunization
 * @param data
 */
export const createImmunizationAccount = async (
  data: Optional<Immunization, keyof Immunization>
) => {
  return Immunization.create({ ...data });
};

/**
 * Get one immunization account
 * @param query
 */
export const getOneImmunization = async (query: WhereOptions<Immunization>) => {
  return Immunization.findOne({
    where: { ...query },
    include: [
      {
        model: Patient,
        attributes: [
          'fullname',
          'firstname',
          'lastname',
          'date_of_birth',
          'photo',
          'photo_url',
          'gender',
          'hospital_id',
          'has_insurance',
          'address',
        ],
      },
    ],
  });
};

/**
 * update immunization account
 * @param immunizationId
 * @param data
 */
export const updateImmunizationAccount = async (
  immunizationId: number,
  data: Optional<Immunization, keyof Immunization>
) => {
  return Immunization.update({ ...data }, { where: { id: immunizationId } });
};

/**
 * get immunization patients
 *
 * @function
 * @returns {Promise<{currentPage, docs, pages, perPage, total}>} json object with antenatal patients data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export const getImmunizationPatients = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
}): Promise<{
  currentPage: number;
  docs: Immunization[];
  pages: number;
  perPage: number;
  total: number;
}> => {
  return Immunization.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    where: {
      ...(search && {
        [Op.or]: [
          {
            immunization_number: {
              [Op.eq]: search,
            },
          },
          {
            '$patient.firstname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.lastname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.hospital_id$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Staff,
        attributes: staffAttributes,
      },
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
};
