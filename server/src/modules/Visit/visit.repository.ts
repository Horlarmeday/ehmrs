/* eslint-disable camelcase */

import { Op, Sequelize, WhereOptions } from 'sequelize';

import { Visit, Patient } from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { VisitCategory, VisitStatus } from '../../database/models/visit';
import { calcLimitAndOffset, dateIntervalQuery } from '../../core/helpers/helper';
import { FindAttributeOptions } from 'sequelize/types/model';

export const patientAttributes = ['fullname', 'photo', 'hospital_id', 'firstname', 'lastname'];
/**
 * create a patient visit
 * @param data
 * @returns {Promise<Visit>} visit data
 */
export async function createVisit(data): Promise<Visit> {
  const {
    patient_id,
    type,
    staff_id,
    ante_natal_id,
    category,
    professional,
    department,
    date_of_visit,
    priority,
  } = data || {};

  return Visit.create({
    patient_id,
    category,
    professional,
    department,
    date_visit_start: date_of_visit,
    type,
    staff_id,
    ante_natal_id,
    priority,
  });
}

/**
 * get a patient last visit status
 * @returns {Promise<Visit>} visit data
 * @param patient_id
 */
export async function getLastActiveVisit(patient_id: number): Promise<Visit> {
  return Visit.findOne({
    where: { patient_id, status: VisitStatus.ONGOING },
    order: [['createdAt', 'DESC']],
  });
}

/**
 * end a patient visit
 * @returns {Promise<Visit>} visit data
 * @param visit
 */
export async function endVisit(visit: Visit): Promise<Visit> {
  return visit.update({ status: VisitStatus.ENDED, date_visit_ended: Date.now() });
}

/**
 * get patient visit by Id
 * @returns {Promise<Visit>} visit data
 * @param id
 */
export async function getVisitById(id: number): Promise<Visit> {
  return Visit.findByPk(id);
}

/**
 * get a visit by Id and including patient details
 * @param id
 */
export async function getVisit(id: number) {
  const visit = await Visit.findOne({
    where: { id },
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
        ],
      },
    ],
  });
  const insurance = await getPatientInsuranceQuery({
    patient_id: visit.patient_id,
    is_default: true,
  });
  return { ...visit.toJSON(), insurance };
}

/** ***********************
 * ACTIVE VISITS
 ********************** */

/**
 * search active visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with active visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchActiveVisits(
  currentPage = 1,
  pageLimit = 10,
  search: string
): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
        where: {
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
        },
      },
    ],
  });
}

/**
 * get all active visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
 * @param currentPage
 * @param pageLimit
 */
export async function getActiveVisits(
  currentPage = 1,
  pageLimit = 10
): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
}

/** ***********************
 * ALL VISITS
 ********************** */

/**
 * search all visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchVisits(
  currentPage = 1,
  pageLimit = 10,
  search: string
): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    attributes: [[Sequelize.fn('MAX', Sequelize.col('patient_id')), 'patient_id']],
    group: ['patient_id'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
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
        },
      },
    ],
  });
}

/**
 * get all visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with visits data
 * @param currentPage
 * @param pageLimit
 */
export async function getVisits(
  currentPage = 1,
  pageLimit = 10
): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    attributes: [[Sequelize.fn('MAX', Sequelize.col('patient_id')), 'patient_id']],
    group: ['patient_id'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
}

export const getVisitsQuery = async (
  currentPage = 1,
  pageLimit = 5,
  query: WhereOptions<Visit>,
  attributes: FindAttributeOptions
) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const visits = await Visit.findAll({ where: { ...query }, offset, limit, attributes });
  const count = await Visit.count({ where: { ...query } });
  return { visits, limit, offset, count };
};

/** ***********************
 * CATEGORY VISITS
 ********************** */

/**
 * search type of visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param category
 */
export async function searchCategoryVisits(
  currentPage = 1,
  pageLimit = 10,
  search: string,
  category = 'Outpatient'
): Promise<{
  total: any;
  docs: Visit[];
  pages: number;
  perPage: number;
  currentPage: number;
}> {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      category,
      status: VisitStatus.ONGOING,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
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
        },
      },
    ],
  });
}

/**
 * get all types of visits
 *
 * @function
 * @returns { Promise<{total: any, docs: any, pages: number, perPage: number, currentPage: number}>} json object with visits data
 * @param currentPage
 * @param pageLimit
 * @param category
 */
export async function getCategoryVisits(
  currentPage = 1,
  pageLimit = 10,
  category = 'Outpatient'
): Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }> {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      category,
      status: VisitStatus.ONGOING,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
    ],
  });
}

/** ***********************
 * PROFESSIONAL ASSIGNED VISITS
 ********************** */
/**
 * search type of visits
 *
 * @function
 * @returns {Promise<{ total: any; docs: Visit[]; pages: number; perPage: number; currentPage: number }>} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param role
 * @param start
 * @param end
 */
export const getProfessionalAssignedVisits = async ({
  currentPage = 1,
  pageLimit = 10,
  role,
  search = null,
  start = null,
  end = null,
}): Promise<{
  total: any;
  docs: Visit[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Visit.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      status: VisitStatus.ONGOING,
      professional: role,
      [Op.or]: [
        {
          category: VisitCategory.OPD,
        },
        {
          category: VisitCategory.EMERGENCY,
        },
      ],
      ...(start && end && dateIntervalQuery('date_visit_start', start, end)),
    },
    include: [
      {
        model: Patient,
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
