/* eslint-disable camelcase */
import { Op } from 'sequelize';

import { Insurance, HMO, PatientInsurance } from '../../database/models';

/**
 * create a health insurance type
 * @param data
 * @returns {object} insurance data
 */
export async function createInsurance(data) {
  const { name, description, staff_id } = data;
  return Insurance.create({
    name,
    description,
    staff_id,
  });
}

/**
 * get insurance by id
 * @param data
 * @returns {object} return insurance data
 */
export async function getInsuranceById(data) {
  return Insurance.findByPk(data);
}

/**
 * get hmo by id
 * @param data
 * @returns {object} return hmo data
 */
export async function getHMOById(data) {
  return HMO.findByPk(data);
}

/**
 * create an HMO
 * @param data
 * @returns {object} hmo data
 */
export async function createHMO(data) {
  const { name, hmo_num, insurance_id, staff_id } = data;
  const hmo = await HMO.create({
    name,
    hmo_num,
    insurance_id,
    staff_id,
  });
  return HMO.findOne({
    where: { id: hmo.id },
    include: [{ model: Insurance, attributes: ['name'] }],
  });
}

/**
 * get health insurances
 *
 * @function
 * @returns {json} json object with insurances data
 * @param currentPage
 * @param pageLimit
 */
export async function getInsurances(currentPage = 1, pageLimit = 10) {
  return Insurance.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * search insurances
 *
 * @function
 * @returns {json} json object with insurances data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchInsurances(currentPage = 1, pageLimit = 10, search) {
  return Insurance.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * get HMOs
 *
 * @function
 * @returns {json} json object with HMOs data
 * @param currentPage
 * @param pageLimit
 */
export async function getHMOs(currentPage = 1, pageLimit = 10) {
  return HMO.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Insurance, as: 'insurance' }],
  });
}

/**
 * get HMOs under an health insurance
 *
 * @function
 * @returns {json} json object with HMOs data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function getInsuranceHMOs(currentPage = 1, pageLimit = 10, filter) {
  return HMO.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Insurance, as: 'insurance' }],
    where: {
      insurance_id: filter,
    },
  });
}

/**
 * search HMOs
 *
 * @function
 * @returns {json} json object with HMOs data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchHMOs(currentPage = 1, pageLimit = 10, search) {
  return HMO.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    include: [{ model: Insurance, as: 'insurance' }],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * update an health insurance type
 * @param data
 * @returns {object} insurance data
 */
export async function updateInsurance(data) {
  const insurance = await getInsuranceById(data.insurance_id);
  return insurance.update(data);
}

/**
 * update an HMO
 * @param data
 * @returns {object} HMO data
 */
export async function updateHMO(data) {
  const hmo = await getHMOById(data.hmo_id);
  return hmo.update(data);
}

/**
 * get patient insurance by id
 * @returns {object} return patient insurance data
 * @param query
 */
export const getPatientInsuranceQuery = async (query: Record<string, unknown>) => {
  return PatientInsurance.findOne({
    where: { ...query },
    include: [
      {
        model: Insurance,
        attributes: ['name'],
      },
      {
        model: HMO,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get patient insurance count
 * @returns {object} return patient insurance count
 * @param query
 */
export const getPatientInsuranceCount = async (query: Record<string, any>) => {
  return PatientInsurance.count({ where: { ...query } });
};

/**
 * update patient insurance
 * @returns {object} return patient insurance affected row
 * @param query
 * @param fieldsToUpdate
 */
export const updatePatientInsurance = async (
  query: Record<string, any>,
  fieldsToUpdate: Record<string, any>
) => {
  return PatientInsurance.update({ ...fieldsToUpdate }, { where: { ...query } });
};

/**
 * make insurance default
 * @returns {object} return patient insurance affected row
 * @param insurance_id
 * @param patient_id
 */
export const setInsuranceAsDefault = async (insurance_id: number, patient_id: number) => {
  if ((await getPatientInsuranceCount({ patient_id })) > 1)
    await updatePatientInsurance({ patient_id }, { is_default: false }); // first make all default false
  return await updatePatientInsurance({ id: insurance_id }, { is_default: true }); // make one default
};

/**
 * get a patient all health insurance
 * @returns {object} return patient insurance data
 * @param patientId
 */
export const getPatientHealthInsurances = async (patientId: number) => {
  return PatientInsurance.findAll({
    where: { patient_id: patientId },
    include: [
      {
        model: Insurance,
        attributes: ['name'],
      },
      {
        model: HMO,
        attributes: ['name'],
      },
    ],
  });
};
