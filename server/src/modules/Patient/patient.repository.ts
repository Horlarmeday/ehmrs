/* eslint-disable camelcase */
import { Op, WhereOptions } from 'sequelize';
import { JobSchedule } from '../../core/command/worker/schedule';
import { PatientType, TogglePatientInsurance, UpdatePatientInsurance } from './types/patient.types';
import {
  AdditionalTreatment,
  Admission,
  Antenatal,
  AntenatalObservation,
  AntenatalTriage,
  CarePlan,
  ClinicalNote,
  Delivery,
  Diagnosis,
  Discharge,
  HMO,
  Insurance,
  Patient,
  PatientInsurance,
  PrescribedDrug,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedTest,
  Staff,
  Visit,
  History,
  Immunization,
  DrugPrescription,
  InvestigationPrescription,
  InvestigationResult,
  IOChart,
  NursingNote,
  Observation,
  OperationNote,
  PrescribedAdditionalItem,
  PatientTreatment,
  Payment,
  PostNatal,
  PreviousPregnancy,
  SurgeryProcedure,
  SurgeryRequest,
  TestPrescription,
  TestResult,
  TestSample,
  Triage,
  WardRound,
  PaymentHistory,
} from '../../database/models';
import sequelizeConnection from '../../database/config/config';
import { BadException } from '../../common/util/api-error';
import {
  CANT_MERGE_SELF,
  PATIENT_HAS_INSURANCE,
  PATIENT_HAS_NO_INSURANCE,
  PATIENT_NOT_FOUND,
} from './messages/response-messages';
import {
  getInsuranceWithoutJoinQuery,
  getPatientInsuranceQuery,
  setInsuranceAsDefault,
  updatePatientInsurance,
} from '../Insurance/insurance.repository';
import {
  dateIntervalQuery,
  patientAttributes,
  staffAttributes,
  StatusCodes,
} from '../../core/helpers/helper';
import { VisitStatus } from '../../database/models/visit';

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
 * get patient query
 * @returns {object} return patient data
 * @param query
 */
export async function getPatientQuery(query: WhereOptions<Patient>) {
  return Patient.findOne({ where: { ...query } });
}

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
    next_of_kin_relationship,
    alt_phone,
    staff_id,
  } = data;

  return Patient.create({
    firstname: firstname.replace(/ +(?= )/g, '').trim(),
    lastname: lastname.replace(/ +(?= )/g, '').trim(),
    middlename: middlename?.replace(/ +(?= )/g, '')?.trim(),
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
    next_of_kin_relationship,
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

  const result = await sequelizeConnection.transaction(async t => {
    const patientInsurance = await PatientInsurance.findOne({
      where: { patient_id, insurance_id, hmo_id },
      transaction: t,
    });
    if (patientInsurance) throw new BadException('Exist', 400, PATIENT_HAS_INSURANCE);

    await PatientInsurance.update(
      {
        is_default: false,
      },
      { where: { patient_id }, transaction: t }
    );

    const insurance = await PatientInsurance.create(
      {
        insurance_id,
        hmo_id,
        plan,
        staff_id,
        enrollee_code,
        organization,
        patient_id,
        is_default: true,
      },
      { transaction: t }
    );

    await Patient.update(
      {
        has_insurance: true,
      },
      { where: { id: patient_id }, transaction: t }
    );

    // disabling dependants default insurance and the same new insurance for dependants
    const patientDependants = await Patient.findAll({
      where: { principal_id: patient_id, patient_type: PatientType.DEPENDANT },
      transaction: t,
    });
    if (patientDependants?.length) {
      const dependantIds = patientDependants.map(dependant => dependant.id);
      const dependantsInsurances = patientDependants.map(dependant => ({
        insurance_id,
        hmo_id,
        plan,
        staff_id,
        enrollee_code,
        organization,
        patient_id: dependant.id,
        is_default: true,
      }));
      await PatientInsurance.update(
        {
          is_default: false,
        },
        { where: { patient_id: dependantIds }, transaction: t }
      );
      await PatientInsurance.bulkCreate(dependantsInsurances, { transaction: t });
    }

    // check if there are dependants in the body
    if (dependants?.length) {
      const modifiedDependants = await Patient.bulkCreate(dependants, { transaction: t });
      await Promise.all(
        modifiedDependants.map(async dependant => {
          await PatientInsurance.create(
            {
              insurance_id,
              hmo_id,
              plan,
              staff_id,
              enrollee_code,
              organization,
              patient_id: dependant.id,
              is_default: true,
            },
            { transaction: t }
          );
          JobSchedule.assignHospitalNumber(dependant.id);
        })
      );
    }
    return insurance;
  });
  // await setInsuranceAsDefault(result.id, patient_id);
  return result;
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
    firstname: firstname.replace(/ +(?= )/g, '').trim(),
    lastname: lastname.replace(/ +(?= )/g, '').trim(),
    middlename: middlename?.replace(/ +(?= )/g, '')?.trim(),
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
  return PatientInsurance.findOne({ where: { enrollee_code: data } });
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
    date_of_birth,
    address,
    photo,
    relationship,
    staff_id,
    patient_id,
    lga,
    country,
    state,
    relationship_to_principal,
    enrollee_code,
  } = data;
  const patientInsurance = await PatientInsurance.findOne({ where: { patient_id } });
  if (!patientInsurance) throw new BadException('Error', 400, PATIENT_HAS_NO_INSURANCE);

  const dependant = await Patient.create({
    firstname: firstname.replace(/ +(?= )/g, '').trim(),
    lastname: lastname.replace(/ +(?= )/g, '').trim(),
    phone,
    gender,
    date_of_birth,
    address,
    photo,
    relationship,
    staff_id,
    lga,
    country,
    state,
    principal_id: patient_id,
    patient_type: PatientType.DEPENDANT,
    has_insurance: true,
    relationship_to_principal,
  });

  await PatientInsurance.create({
    insurance_id: patientInsurance.insurance_id,
    hmo_id: patientInsurance.hmo_id,
    plan: patientInsurance.plan,
    staff_id,
    enrollee_code,
    organization: patientInsurance.organization,
    patient_id: dependant.id,
    is_default: true,
  });
  return dependant;
}

/**
 * search patients
 *
 * @function
 * @returns {json} json object with patients data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param filter
 * @param start
 * @param end
 */
export async function getPatients({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  filter = null,
  start = null,
  end = null,
}) {
  return Patient.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Staff, attributes: staffAttributes },
      {
        model: PatientInsurance,
        where: { is_default: true },
        limit: 1,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'insurance_id', 'hmo_id'],
        include: [
          { model: Insurance, attributes: ['name'] },
          { model: HMO, attributes: ['name'] },
        ],
      },
    ],
    attributes: patientAttributes,
    where: {
      ...(filter && JSON.parse(filter)),
      ...(start && end && dateIntervalQuery('createdAt', start, end)),
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
            complete_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            phone: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            hospital_id: {
              [Op.like]: `%${search}`,
            },
          },
        ],
      }),
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
 * @returns {object} return patient data
 * @param patient_id
 */
export async function getPatientProfile(patient_id: number) {
  const patient = await Patient.findOne({
    where: { id: patient_id },
    include: [
      { model: Patient, as: 'dependants' },
      {
        model: Patient,
        as: 'principal',
        attributes: ['firstname', 'lastname', 'middlename', 'fullname', 'id'],
      },
    ],
  });
  const insurance = await getPatientInsuranceQuery({ patient_id, is_default: true });
  return { ...patient.toJSON(), insurance };
}

/**
 * get Patient by firstname and phone
 * @param data
 * @returns {object} prescribed service data
 */
export const getPatientByNameAndPhone = async data => {
  return await Patient.findOne({ where: { firstname: data.firstname, phone: data.phone } });
};

/**
 * update patient insurance
 * @returns {object} return patient data
 * @param data
 */
export const updateInsurance = async (data: UpdatePatientInsurance) => {
  const { patient_id, patient_insurance_id, ...rest } = data;
  const dependants = await Patient.findAll({ where: { principal_id: patient_id } });

  // Update principal
  const updatedInsurance = await updatePatientInsurance(
    { patient_id, id: patient_insurance_id },
    { ...rest, is_default: true }
  );

  if (dependants?.length) {
    const dependantIds = dependants.map(dependant => dependant.id);
    await Promise.all(
      dependantIds.map(async id => {
        const healthInsurance = await PatientInsurance.findOne({ where: { patient_id: id } });
        if (!healthInsurance) {
          await PatientInsurance.create({
            ...rest,
            patient_id: id,
            is_default: true,
          });
          return;
        }
        await updatePatientInsurance(
          {
            patient_id: id,
          },
          { ...rest, is_default: true }
        );
      })
    );
  }
  return updatedInsurance;
};

/**
 * toggle patient insurance
 * @returns {Promise<Patient>} return patient data
 * @param data
 */
export const togglePatientInsurance = async (data: TogglePatientInsurance): Promise<Patient> => {
  const { patient_id, has_insurance } = data;
  const updatedPatient = await updatePatient(data); // disable principal insurance
  await PatientInsurance.update({ is_default: false }, { where: { patient_id } }); // disable principal insurance

  const dependants = await Patient.findAll({
    where: { principal_id: patient_id, patient_type: PatientType.DEPENDANT },
  });

  if (dependants?.length) {
    const dependantIds = dependants.map(dependant => dependant.id);
    await Patient.update(
      { has_insurance },
      {
        where: {
          principal_id: patient_id,
          patient_type: PatientType.DEPENDANT,
        },
      }
    );
    await PatientInsurance.update({ is_default: false }, { where: { patient_id: dependantIds } });
  }
  return updatedPatient;
};

/**
 * convert dependant to principal
 * @returns {Promise<Patient>} return patient data
 * @param patientId
 */
export const convertDependantToPrincipal = async (patientId: number): Promise<Patient> => {
  const data = {
    patient_id: patientId,
    patient_type: PatientType.PATIENT,
    principal_id: null,
    has_insurance: false,
    relationship_to_principal: null,
  };
  const patient = await updatePatient(data);
  await PatientInsurance.update({ is_default: false }, { where: { patient_id: patientId } }); // disable insurance
  return patient;
};

/**
 * Merge multiple patient accounts into one account
 * @returns {Promise<Patient>} return patient data
 * @param sourcePatientIds
 * @param targetPatientId
 */
export const mergePatientAccounts = async (
  sourcePatientIds: number[],
  targetPatientId: number
): Promise<Patient> => {
  return sequelizeConnection.transaction(async t => {
    // Fetch the target patient
    const targetPatient = await Patient.findByPk(targetPatientId, { transaction: t });
    if (!targetPatient) throw new BadException('ERROR', StatusCodes.NOT_FOUND, PATIENT_NOT_FOUND);

    if (sourcePatientIds.includes(targetPatientId))
      throw new BadException('ERROR', StatusCodes.BAD_REQUEST, CANT_MERGE_SELF);

    // Define the tables to update
    const tablesToUpdate = [
      { model: Patient, foreignKey: 'principal_id' },
      { model: PrescribedTest, foreignKey: 'patient_id' },
      { model: PrescribedDrug, foreignKey: 'patient_id' },
      { model: PrescribedInvestigation, foreignKey: 'patient_id' },
      { model: PrescribedService, foreignKey: 'patient_id' },
      { model: PrescribedAdditionalItem, foreignKey: 'patient_id' },
      { model: AdditionalTreatment, foreignKey: 'patient_id' },
      { model: Admission, foreignKey: 'patient_id' },
      { model: Antenatal, foreignKey: 'patient_id' },
      { model: AntenatalObservation, foreignKey: 'patient_id' },
      { model: AntenatalTriage, foreignKey: 'patient_id' },
      { model: CarePlan, foreignKey: 'patient_id' },
      { model: ClinicalNote, foreignKey: 'patient_id' },
      { model: Delivery, foreignKey: 'patient_id' },
      { model: Diagnosis, foreignKey: 'patient_id' },
      { model: History, foreignKey: 'patient_id' },
      { model: Discharge, foreignKey: 'patient_id' },
      { model: Immunization, foreignKey: 'patient_id' },
      { model: DrugPrescription, foreignKey: 'patient_id' },
      { model: InvestigationPrescription, foreignKey: 'patient_id' },
      { model: InvestigationResult, foreignKey: 'patient_id' },
      { model: IOChart, foreignKey: 'patient_id' },
      { model: NursingNote, foreignKey: 'patient_id' },
      { model: Observation, foreignKey: 'patient_id' },
      { model: OperationNote, foreignKey: 'patient_id' },
      { model: PatientInsurance, foreignKey: 'patient_id' },
      { model: PatientTreatment, foreignKey: 'patient_id' },
      { model: Payment, foreignKey: 'uid' },
      { model: PaymentHistory, foreignKey: 'patient_id' },
      { model: PostNatal, foreignKey: 'patient_id' },
      { model: PreviousPregnancy, foreignKey: 'patient_id' },
      { model: SurgeryProcedure, foreignKey: 'patient_id' },
      { model: SurgeryRequest, foreignKey: 'patient_id' },
      { model: TestPrescription, foreignKey: 'patient_id' },
      { model: TestResult, foreignKey: 'patient_id' },
      { model: TestSample, foreignKey: 'patient_id' },
      { model: Triage, foreignKey: 'patient_id' },
      { model: Visit, foreignKey: 'patient_id' },
      { model: WardRound, foreignKey: 'patient_id' },
    ];

    // Update all tables in parallel
    await Promise.all(
      tablesToUpdate.map(async ({ model, foreignKey }: { model: any; foreignKey: string }) => {
        await model.update(
          { [foreignKey]: targetPatientId },
          {
            where: { [foreignKey]: { [Op.in]: sourcePatientIds } },
            transaction: t,
          }
        );
      })
    );

    // Delete source patients
    await Patient.destroy({
      where: { id: { [Op.in]: sourcePatientIds } },
      transaction: t,
    });

    // Return the updated target patient
    return Patient.findByPk(targetPatientId, { transaction: t });
  });
};
