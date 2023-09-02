/* eslint-disable camelcase */

import { Op, Sequelize } from 'sequelize';

import { Visit, Patient } from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

const patientAttributes = () => ['fullname', 'photo', 'hospital_id', 'firstname', 'lastname'];
/**
 * create a patient visit
 * @param data
 * @returns {object} visit data
 */
export async function createVisit(data) {
  const { patient_id, type, staff_id } = data;

  return Visit.create({
    patient_id,
    type,
    staff_id,
    is_active: true,
  });
}

/**
 * get a patient last visit status
 * @param data
 * @returns {object} visit data
 */
export async function getLastVisitStatus(data) {
  return Visit.findOne({
    where: { patient_id: data, is_active: true },
    order: [['createdAt', 'DESC']],
  });
}

/**
 * end a patient visit
 * @returns {object} visit data
 * @param visit
 */
export async function endVisit(visit) {
  return visit.update({ is_active: false, date_visit_ended: Date.now() });
}

/**
 * get patient visit by Id
 * @returns {object} visit data
 * @param id
 */
export async function getVisitById(id: number) {
  return Visit.findByPk(id);
}

/**
 * get a visit by Id and including patient details
 * @returns {object} visit data
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
 * @returns {json} json object with active visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchActiveVisits(currentPage = 1, pageLimit = 10, search) {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      is_active: true,
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes(),
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
 * @returns {json} json object with visits data
 * @param currentPage
 * @param pageLimit
 */
export async function getActiveVisits(currentPage = 1, pageLimit = 10) {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      is_active: true,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes(),
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
 * @returns {json} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchVisits(currentPage = 1, pageLimit = 10, search) {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    attributes: [[Sequelize.fn('MAX', Sequelize.col('patient_id')), 'patient_id']],
    group: ['patient_id'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes(),
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
 * @returns {json} json object with visits data
 * @param currentPage
 * @param pageLimit
 */
export async function getVisits(currentPage = 1, pageLimit = 10) {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    attributes: [[Sequelize.fn('MAX', Sequelize.col('patient_id')), 'patient_id']],
    group: ['patient_id'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes(),
      },
    ],
  });
}

/** ***********************
 * TYPE VISITS
 ********************** */

/**
 * search type of visits
 *
 * @function
 * @returns {json} json object with all visits data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param type
 */
export async function searchTypeVisits(currentPage = 1, pageLimit = 10, search, type = 'OPD') {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      type,
      is_active: true,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes(),
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
 * @returns {json} json object with visits data
 * @param currentPage
 * @param pageLimit
 * @param type
 */
export async function getTypeVisits(currentPage = 1, pageLimit = 10, type = 'OPD') {
  return Visit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      type,
      is_active: true,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes(),
      },
    ],
  });
}
