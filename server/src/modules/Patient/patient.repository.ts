/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { delay, padNumberWithZero, processArray } from '../../core/helpers/general';
import { generateRandomNumbers, processSnappedPhoto } from '../../core/helpers/helper';
import { assignHospitalNumber } from '../../core/command/schedule';

const { Patient, Insurance, HMO } = require('../../database/models');

const db = require('../../database/models');

/**
 * generate the hospital id
 * @returns string
 */
export async function generateHospitalNumber() {
  const randomNumbers = generateRandomNumbers(5);
  return `SVH/${padNumberWithZero(randomNumbers, 6)}`;
}

/**
 * query staff account in the DB by phone
 *
 * @function
 * @returns {json} json object with phone data
 * @param data
 */
export async function findPatientByPhone(data) {
  return Patient.findOne({ where: { phone: data } });
}

/**
 * query staff account in the DB by hospital Id
 *
 * @function
 * @returns {json} json object with hospital Id data
 * @param data
 */
export async function getPatientByHospitalId(data) {
  return Patient.findOne({ where: { hospital_id: data } });
}

/**
 * get patient by id
 * @param data
 * @returns {object} return patient data
 */
export async function getPatientById(data) {
  return Patient.findByPk(data);
}

/**
 * create a cash patient account
 * @param data
 * @returns {object} patient data
 */
export async function createCashPatient(data) {
  const {
    firstname,
    email,
    lastname,
    middlename,
    phone,
    next_of_kin_name,
    next_of_kin_phone,
    next_of_kin_address,
    occupation,
    marital_status,
    address,
    gender,
    date_of_birth,
    country,
    state,
    lga,
    religion,
    fileName,
    relationship,
    alt_phone,
    staff_id,
  } = data;

  return Patient.create({
    firstname,
    lastname,
    middlename,
    email,
    phone,
    next_of_kin_phone,
    next_of_kin_address,
    occupation,
    next_of_kin_name,
    marital_status,
    address,
    gender,
    date_of_birth,
    country,
    state,
    lga,
    religion,
    photo: fileName,
    relationship,
    alt_phone,
    staff_id,
    fullname: `${firstname} ${lastname}`,
  });
}

/**
 * create a dependant by from group of dependants
 *
 * @param dependant
 * @returns {object} of dependant
 */
async function delayedLog(dependant) {
  await delay();
  const { fileName } = await processSnappedPhoto(dependant.photo, dependant.firstname);

  const patient = await Patient.create({
    fullname: `${dependant.firstname} ${dependant.lastname}`,
    firstname: dependant.firstname,
    lastname: dependant.lastname,
    phone: dependant.phone,
    gender: dependant.gender,
    insurance_id: dependant.insurance_id,
    hmo_id: dependant.hmo_id,
    date_of_birth: dependant.date_of_birth,
    address: dependant.address,
    enrollee_code: dependant.enrollee_code,
    photo: fileName,
    relationship: dependant.relationship,
    plan: dependant.plan,
    staff_id: dependant.staff_id,
    principal_id: dependant.patient_id,
    patient_type: 'Dependant',
    country: dependant.country,
    state: dependant.state,
    lga: dependant.lga,
    religion: dependant.religion,
  });
  await assignHospitalNumber(patient.id);
  return patient;
}

/**
 * create a health insurance patient account
 * @param data
 * @returns {object} patient data
 */
export async function createInsurancePatient(data) {
  const {
    firstname,
    lastname,
    email,
    middlename,
    phone,
    next_of_kin_name,
    next_of_kin_phone,
    next_of_kin_address,
    occupation,
    marital_status,
    address,
    gender,
    date_of_birth,
    insurance_id,
    hmo_id,
    plan,
    country,
    state,
    lga,
    religion,
    fileName,
    relationship,
    alt_phone,
    staff_id,
    enrollee_code,
    organization,
    dependants,
  } = data;

  return db.sequelize.transaction(async t => {
    const patient = await Patient.create(
      {
        firstname,
        lastname,
        middlename,
        email,
        next_of_kin_phone,
        phone,
        next_of_kin_address,
        occupation,
        next_of_kin_name,
        marital_status,
        address,
        gender,
        date_of_birth,
        country,
        state,
        lga,
        religion,
        enrollee_code,
        photo: fileName,
        relationship,
        alt_phone,
        staff_id,
        fullname: `${firstname} ${lastname}`,
        has_insurance: true,
        insurance_id,
        hmo_id,
        plan,
        organization,
        patient_type: 'Principal',
      },
      { transaction: t }
    );
    await assignHospitalNumber(patient.id);
    // check if there are dependants in the body
    if (dependants.length) {
      const modifiedDependants = dependants.map(d => ({
        ...d,
        staff_id,
        patient_id: patient.id,
        country: patient.country,
        state: patient.state,
        lga: patient.lga,
        religion: patient.religion,
      }));
      const createdDependants = await processArray(modifiedDependants, delayedLog);

      return { patient, createdDependants };
    }
    return patient;
  });
}

/**
 * create a ordinary patient account
 * @param data
 * @returns {object} patient data
 */
export async function createOrdinaryPatient(data) {
  const {
    firstname,
    lastname,
    middlename,
    email,
    phone,
    marital_status,
    address,
    gender,
    date_of_birth,
    country,
    religion,
    state,
    lga,
    staff_id,
  } = data;

  return Patient.create({
    firstname,
    lastname,
    middlename,
    email,
    phone,
    marital_status,
    address,
    gender,
    date_of_birth,
    country,
    state,
    lga,
    religion,
    staff_id,
    fullname: `${firstname} ${lastname}`,
  });
}

/**
 * get enrollee by enrollee_code
 * @param data
 * @returns {object} return patient data
 */
export async function findDependantByEnrolleeCode(data) {
  return Patient.findOne({ where: { enrollee_code: data } });
}

/**
 * create a dependant
 * @param data
 * @returns {object} dependant data
 */
export async function createDependant(data) {
  const {
    firstname,
    lastname,
    phone,
    gender,
    insurance_id,
    hmo_id,
    date_of_birth,
    address,
    enrollee_code,
    photo,
    relationship,
    plan,
    staff_id,
    patient_id,
  } = data;
  return Patient.create({
    firstname,
    lastname,
    phone,
    gender,
    insurance_id,
    hmo_id,
    date_of_birth,
    address,
    enrollee_code,
    photo,
    relationship,
    plan,
    staff_id,
    fullname: `${firstname}  ${lastname}`,
    principal_id: patient_id,
    patient_type: 'Dependant',
  });
}

/**
 * get patients
 *
 * @function
 * @returns {json} json object with patients data
 * @param currentPage
 * @param pageLimit
 */
export async function getPatients(currentPage = 1, pageLimit = 10) {
  return Patient.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get patients by date
 *
 * @function
 * @returns {json} json object with patients data
 * @param currentPage
 * @param pageLimit
 * @param start
 * @param end
 */
export async function getPatientsByDate(currentPage = 1, pageLimit = 10, start, end) {
  return Patient.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      createdAt: {
        [Op.gte]: new Date(new Date(start).setHours(0, 0, 0)),
        [Op.lt]: new Date(new Date(end).setHours(23, 59, 59)),
      },
    },
  });
}

/**
 * search patients
 *
 * @function
 * @returns {json} json object with patients data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchPatients(currentPage = 1, pageLimit = 10, search) {
  return Patient.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
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
  });
}

/**
 * update patient data
 * @param data
 * @returns {object} return patient data
 */
export async function updatePatient(data) {
  const patient = await getPatientById(data.patient_id);
  return patient.update(data);
}

/**
 * get one patient
 * @param data
 * @returns {object} return patient data
 */
export async function getOnePatient(data) {
  return Patient.findOne({
    where: { id: data },
    include: [{ model: Insurance }, { model: HMO }, { model: Patient, as: 'dependants' }],
  });
}
