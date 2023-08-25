/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { assignHospitalNumber } from '../../core/command/schedule';
import { PatientType } from './types/patient.types';
import { HMO, Insurance, Patient, PatientInsurance } from '../../database/models';
import sequelizeConnection from '../../database/config/config';
import { BadException } from '../../common/util/api-error';

/**
 * query staff account in the DB by phone
 *
 * @function
 * @returns {json} json object with phone data
 * @param data
 */
export async function findPatientByPhone(data: string): Promise<Patient> {
  return Patient.findOne({ where: { phone: data } });
}

/**
 * query patient account in the DB by hospital Id
 *
 * @function
 * @returns {json} json object with hospital Id data
 * @param data
 */
export async function getPatientByHospitalId(data: string): Promise<Patient> {
  return Patient.findOne({ where: { hospital_id: data } });
}

/**
 * get patient by id
 * @param data
 * @returns {object} return patient data
 */
export async function getPatientById(data: number) {
  return Patient.findByPk(data);
}

/**
 * get patient with its insurance
 * @returns {object} return patient data
 * @param patient_id
 */
export const getPatientWithInsurance = (patient_id: number) => {
  return Patient.findByPk(patient_id, { include: [{ model: Insurance }] });
};

/**
 * create a patient account
 * @param data
 * @returns {object} patient data
 */
export async function createPatientAccount(data): Promise<Patient> {
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
  });
}

/**
 * create a health insurance patient account
 * @param data
 * @returns {object} patient data
 */
export const addPatientInsurance = async data => {
  const {
    insurance_id,
    hmo_id,
    plan,
    staff_id,
    enrollee_code,
    organization,
    dependants,
    patient_id,
  } = data;

  return sequelizeConnection.transaction(async t => {
    const patientInsurance = await PatientInsurance.findOne({
      where: { patient_id, insurance_id, hmo_id },
    });
    if (patientInsurance)
      throw new BadException('Exist', 400, 'Patient already subscribed to this HMO');

    const insurance = await PatientInsurance.create(
      {
        insurance_id,
        hmo_id,
        plan,
        staff_id,
        enrollee_code,
        organization,
        patient_id,
      },
      { transaction: t }
    );

    const patient = await Patient.update(
      {
        patient_insurance_id: insurance.id,
      },
      { where: { id: patient_id }, transaction: t }
    );

    // check if there are dependants in the body
    if (dependants.length) {
      const modifiedDependants = await Patient.bulkCreate(dependants, { transaction: t });
      await Promise.all(
        modifiedDependants.map(dependant => {
          PatientInsurance.create(
            {
              insurance_id,
              hmo_id,
              plan,
              staff_id,
              enrollee_code: dependant.enrollee_code,
              organization,
              patient_id: dependant.id,
            },
            { transaction: t }
          );
          assignHospitalNumber(dependant.id);
        })
      );
      return { patient, modifiedDependants };
    }
    return patient;
  });
};

/**
 * create a ordinary patient account
 * @param data
 * @returns {object} patient data
 */
export async function createEmergencyPatient(data) {
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
    principal_id: patient_id,
    patient_type: PatientType.DEPENDANT,
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
            [Op.like]: `%${search}`,
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
export async function updatePatient(data): Promise<Patient> {
  const patient = await getPatientById(data.patient_id);
  return patient.update(data);
}

/**
 * get one patient
 * @param data
 * @returns {object} return patient data
 */
export async function getPatientProfile(data) {
  return Patient.findOne({
    where: { id: data },
    include: [{ model: Insurance }, { model: HMO }, { model: Patient, as: 'dependants' }],
  });
}

/**
 * get Patient by firstname and phone
 * @param data
 * @returns {object} prescribed service data
 */
export const getPatientByNameAndPhone = async data => {
  return await Patient.findOne({ where: { firstname: data.firstname, phone: data.phone } });
};
