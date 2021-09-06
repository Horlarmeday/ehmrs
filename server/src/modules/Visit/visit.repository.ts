/* eslint-disable camelcase */

import { Op, Sequelize } from 'sequelize';

const { Visit, Patient } = require('../../database/models');

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
export async function getVisitById(id) {
  return Visit.findByPk(id);
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
        attributes: ['fullname', 'photo', 'hospital_id'],
        where: {
          [Op.or]: [
            {
              fullname: {
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
        as: 'patient',
        attributes: ['fullname', 'photo', 'hospital_id'],
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
        as: 'patient',
        attributes: ['fullname', 'photo', 'hospital_id'],
        where: {
          [Op.or]: [
            {
              fullname: {
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
        as: 'patient',
        attributes: ['fullname', 'photo', 'hospital_id'],
      },
    ],
  });
}

/** ***********************
 * TYPE VISITS
 ********************** */

/**
 * search typed visits
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
        as: 'patient',
        attributes: ['fullname', 'photo', 'hospital_id'],
        where: {
          [Op.or]: [
            {
              fullname: {
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
 * get all typed visits
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
        as: 'patient',
        attributes: ['fullname', 'photo', 'hospital_id'],
      },
    ],
  });
}
