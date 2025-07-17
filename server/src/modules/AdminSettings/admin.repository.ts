/* eslint-disable camelcase */
import sequelize, { Op, Optional, WhereOptions } from 'sequelize';
import { getModelById, getNumberOfRecords } from '../../core/helpers/general';

import {
  Bed,
  Default,
  Department,
  Encounter,
  Patient,
  PatientInsurance,
  Service,
  ServiceTariff,
  Staff,
  SystemSettings,
  TestPrescription,
  Unit,
  Ward,
  Visit,
  DrugPrescription,
  PrescribedDrug,
  Drug,
  DosageForm,
  RoutesOfAdministration,
  PrescribedTest,
  Test,
  InvestigationPrescription,
  PrescribedInvestigation,
  Investigation,
  PrescribedService,
  Observation,
  Triage,
  Diagnosis,
  ICD10Disease,
  ICPC2Disease,
} from '../../database/models';
import {
  calcLimitAndOffset,
  canUsePriceTariff,
  dateIntervalQuery,
  paginate,
  patientAttributes,
} from '../../core/helpers/helper';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { staffAttributes } from '../Antenatal/antenatal.repository';
import { BedStatus } from '../../database/models/bed';
import dayjs from 'dayjs';

/** ***********************
 * DEPARTMENT
 ********************** */

/**
 * create a department
 * @param data
 * @returns {object} department data
 */
export async function createDepartment(data) {
  const { name, description, staff_id } = data;

  return Department.create({
    name,
    staff_id,
    description,
  });
}

/**
 * update a department
 * @param data
 * @returns {object} department data
 */
export async function updateDepartment(data) {
  const { department_id } = data;
  const department = await getModelById(Department, department_id);
  return department.update(data);
}

/**
 * search departments
 *
 * @function
 * @returns {json} json object with departments data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchDepartments(currentPage = 1, pageLimit = 10, search) {
  return Department.paginate({
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
 * get departments
 *
 * @function
 * @returns {json} json object with departments data
 * @param currentPage
 * @param pageLimit
 */
export async function getDepartments(currentPage = 1, pageLimit = 10) {
  return Department.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * UNIT
 ********************** */

/**
 * create a unit (S.I unit)
 * @param data
 * @returns {object} department data
 */
export async function createUnit(data) {
  const { name, staff_id } = data;

  return Unit.create({
    name,
    staff_id,
  });
}

/**
 * update a unit
 * @param data
 * @returns {object} unit data
 */
export async function updateUnit(data) {
  const { unit_id } = data;
  const unit = await getModelById(Unit, unit_id);
  return unit.update(data);
}

/**
 * search units
 *
 * @function
 * @returns {json} json object with units data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchUnits(currentPage = 1, pageLimit = 10, search) {
  return Unit.paginate({
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
 * get units
 *
 * @function
 * @returns {json} json object with units data
 * @param currentPage
 * @param pageLimit
 */
export async function getUnits(currentPage = 1, pageLimit = 10) {
  return Unit.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * WARD
 ********************** */

/**
 * create a ward
 * @param data
 * @returns {object} ward data
 */
export async function createWard(data) {
  const { name, staff_id, service_id, occupant_type } = data;

  return Ward.create({
    name,
    staff_id,
    service_id,
    occupant_type,
  });
}

/**
 * update a ward
 * @param data
 * @returns {object} ward data
 */
export async function updateWard(data) {
  const { ward_id } = data;
  const ward = await getModelById(Ward, ward_id);
  return ward.update(data);
}

/**
 * search wards
 *
 * @function
 * @returns {json} json object with wards data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchWards(currentPage = 1, pageLimit = 10, search) {
  return Ward.paginate({
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
 * get wards
 *
 * @function
 * @returns {json} json object with wards data
 * @param currentPage
 * @param pageLimit
 */
export async function getWards(currentPage = 1, pageLimit = 20) {
  return Ward.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get a ward and the associated service
 *
 * @function
 * @returns {json} json object with wards data
 * @param ward_id
 */
export const getWardWithService = async (ward_id: number) => {
  return Ward.findByPk(ward_id, {
    include: [
      { model: Service },
      {
        model: Bed,
        where: {
          status: BedStatus.UNTAKEN,
        },
        attributes: ['bed_type', 'id', 'code', 'status'],
      },
    ],
  });
};

/** ***********************
 * BED
 ********************** */
/**
 * create a bed
 * @param data
 * @returns {object} bed data
 */
export async function createBed(data) {
  const { code, bed_type, ward_id, staff_id } = data;

  return Bed.create({
    code,
    staff_id,
    bed_type,
    ward_id,
  });
}

/**
 * update a bed
 * @param data
 * @returns {object} bed data
 */
export async function updateBed(data) {
  const { bed_id } = data;
  const bed = await getModelById(Bed, bed_id);
  return bed.update(data);
}

/**
 * get beds
 *
 * @function
 * @returns {json} json object with beds data
 */
export async function getBeds() {
  return Bed.findAll({
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get wards and associated beds
 *
 * @function
 * @returns {Promise<Ward[]>} json object with wards(beds) data
 */
export const getWardsAndBeds = (search: string = null): Promise<Ward[]> => {
  return Ward.findAll({
    order: [['createdAt', 'DESC']],
    where: {
      ...(search && {
        name: {
          [Op.like]: `%${search}%`,
        },
      }),
    },
    include: [
      {
        model: Bed,
        attributes: ['bed_type', 'id', 'code', 'status'],
      },
    ],
  });
};

/**
 * get beds under a ward
 *
 * @function
 * @returns {json} json object with beds data
 */
export async function getBedsInAWard(data: number) {
  return Bed.findAll({
    order: [['createdAt', 'DESC']],
    where: {
      ward_id: data,
    },
  });
}

/** ***********************
 * SERVICES
 ********************** */
/**
 * create a service
 * @param data
 * @returns {object} service data
 */
export async function createService(data) {
  const { name, price, staff_id, type } = data;
  const count = await getNumberOfRecords(Service);
  return Service.create({
    name,
    staff_id,
    price,
    code: `S${count + 1}`,
    type,
  });
}

/**
 * update a service
 * @param data
 * @returns {object} service data
 */
export async function updateService(data) {
  const { service_id } = data;
  const service = await getModelById(Service, service_id);
  return service.update(data);
}

/**
 * search services
 *
 * @function
 * @returns {json} json object with services data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchServices(currentPage = 1, pageLimit = 20, search) {
  return Service.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['name', 'ASC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * get services
 *
 * @function
 * @returns {json} json object with services data
 * @param currentPage
 * @param pageLimit
 */
export async function getServices(currentPage = 1, pageLimit = 20) {
  return Service.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['name', 'ASC']],
  });
}

/**
 * get a service
 *
 * @function
 * @returns {Promise<Service>} json object with service data
 * @param query
 */
export const getOneService = async (query: WhereOptions<Service>): Promise<Service> => {
  return Service.findOne({ where: { ...query } });
};

/** ***********************
 * SERVICE TARIFFS
 ********************** */
/**
 * create service tariff
 *
 * @function
 * @returns {json} json object with service tariff data
 * @param data
 */
export const createServiceTariff = async data => {
  return ServiceTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const servicePriceTariff = async (
  insurance: PatientInsurance,
  service_id: number
): Promise<number> => {
  const { price } =
    (await ServiceTariff.findOne({
      where: { service_id, hmo_id: insurance?.hmo_id, insurance_id: insurance?.insurance_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getServicePrice = async (patient: Patient, service_id: number) => {
  if (canUsePriceTariff(patient)) {
    const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
    if (insurance) return servicePriceTariff(insurance, service_id);
    return null;
  }
  return null;
};

/***********************
 * DEFAULTS
 **********************/

/**
 * create admin defaults
 *
 * @function
 * @returns {Promise<Default>} json object with default data
 * @param data
 */
export const createDefault = async (data: Optional<string, any>): Promise<Default> => {
  const oneDefault = await getOneDefault({ type: data.type });
  if (oneDefault) {
    const dbData = oneDefault.data;
    const concattedData = dbData.concat(data.data);
    return await oneDefault.update({ data: concattedData });
  }
  return Default.create({ ...data });
};

/**
 * get admin defaults
 *
 * @function
 * @returns {Promise<Default[]>} json object with defaults data
 */
export const getDefaults = async (): Promise<Default[]> => {
  return Default.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/**
 * get an admin default
 *
 * @function
 * @returns {Promise<Default>} json object with default data
 * @param query
 */
export const getOneDefault = async (query: WhereOptions<Default>): Promise<Default> => {
  return Default.findOne({ where: { ...query } });
};

/**
 * Delete default data
 *
 * @function
 * @returns {Promise<Default>} json object with default data
 * @param query
 * @param dataId
 */
export const deleteDefaultData = async (
  query: WhereOptions<Default>,
  dataId: string
): Promise<Default> => {
  const oneDefault = await getOneDefault({ ...query });
  const dbData = oneDefault.data;
  const filteredData = dbData.filter(({ id }) => id !== dataId);
  return await oneDefault.update({ data: filteredData });
};

/********************
 * SYSTEM SETTINGS
 *******************/
/**
 * update system settings
 * @param data
 * @returns {object} system settings
 */
export async function updateSystemSettings(data) {
  const settings = await SystemSettings.findOne();
  return await settings.update(data);
}

/**
 * get system settings
 * @param data
 * @returns {object} system settings
 */
export async function getSystemSettings() {
  return await SystemSettings.findOne();
}

/** ***********************
 * ENCOUNTER
 ********************** */

/**
 * get encounters
 *
 * @function
 * @returns {Promise<Encounter>} json object with encounters data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param start
 * @param end
 */
export const getEncounters = async ({
  currentPage = 1,
  pageLimit = 20,
  search = null,
  start = dayjs()
    .startOf('month')
    .toDate(),
  end = dayjs()
    .endOf('month')
    .toDate(),
}): Promise<{
  total: number;
  pages: number;
  perPage: number;
  docs: any[];
  currentPage: number;
}> => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);

  const { rows, count } = await Encounter.findAndCountAll({
    attributes: [
      'staff_id',
      [sequelize.fn('COUNT', sequelize.col('Encounter.id')), 'totalEncounters'],
    ],
    include: [
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
        required: true,
        ...(search && {
          where: {
            [Op.or]: [
              { firstname: { [Op.like]: `%${search}%` } },
              { lastname: { [Op.like]: `%${search}%` } },
              { username: { [Op.like]: `%${search}%` } },
            ],
          },
        }),
      },
    ],
    where: {
      ...(start && end && dateIntervalQuery('time_of_encounter', start, end)),
    },
    group: ['staff_id'],
    order: [[sequelize.literal('totalEncounters'), 'DESC']],
    subQuery: false,
    limit,
    offset,
  });
  const encounters = rows.map(count => ({
    doctorId: count.staff_id,
    doctorName: count.examiner.fullname,
    totalEncounters: parseInt(<string>count.get('totalEncounters')),
  }));
  const totalPages = Math.ceil(count.length / limit);
  return paginate({ rows: encounters, count: totalPages }, currentPage, limit);
};

/**
 * Get detailed encounters for a specific staff member
 * @param staffId
 * @param currentPage
 * @param pageLimit
 * @param start
 * @param end
 */
export const getStaffEncounterDetails = async (
  staffId: number,
  currentPage = 1,
  pageLimit = 20,
  start?: Date,
  end?: Date
): Promise<{
  total: number;
  docs: any[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Encounter.paginate({
    page: currentPage,
    paginate: pageLimit,
    where: {
      staff_id: staffId,
      ...(start && end && dateIntervalQuery('time_of_encounter', start, end)),
    },
    include: [
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
      { model: Visit, attributes: ['id', 'category', 'status'] },
    ],
    order: [['time_of_encounter', 'DESC']],
  });
};

/**
 * Get encounter actions and related data for a specific encounter
 * @param encounterId
 */
export const getEncounterActions = async (encounterId: number) => {
  const encounter = await Encounter.findByPk(encounterId, {
    include: [
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
      { model: Visit, attributes: ['id', 'category', 'status'] },
    ],
  });

  if (!encounter) {
    return null;
  }

  // Get related actions based on encounter type and related entity
  const actions = await getRelatedActions(encounter);

  return {
    encounter,
    actions,
  };
};

/**
 * Get related actions for an encounter
 * @param encounter
 */
const getRelatedActions = async (encounter: any) => {
  const { related_entity_type, related_entity_id, visit_id, patient_id, staff_id } = encounter;

  const actions: any = {};

  // Get prescriptions
  const [
    drugPrescriptions,
    testPrescriptions,
    investigationPrescriptions,
    servicePrescriptions,
  ] = await Promise.all([
    DrugPrescription.findAll({
      where: { visit_id, patient_id, requester: staff_id },
      include: [
        { model: Staff, as: 'examiner', attributes: staffAttributes },
        {
          model: PrescribedDrug,
          include: [{ model: Drug }, { model: DosageForm }, { model: RoutesOfAdministration }],
        },
      ],
      order: [['date_prescribed', 'DESC']],
    }),
    TestPrescription.findAll({
      where: { visit_id, patient_id, requester: staff_id },
      include: [
        { model: Staff, as: 'examiner', attributes: staffAttributes },
        { model: PrescribedTest, include: [{ model: Test }] },
      ],
      order: [['date_requested', 'DESC']],
    }),
    InvestigationPrescription.findAll({
      where: { visit_id, patient_id, requester: staff_id },
      include: [
        { model: Staff, as: 'examiner', attributes: staffAttributes },
        { model: PrescribedInvestigation, include: [{ model: Investigation }] },
      ],
      order: [['date_requested', 'DESC']],
    }),
    PrescribedService.findAll({
      where: { visit_id, patient_id, requester: staff_id },
      include: [{ model: Staff, as: 'examiner', attributes: staffAttributes }, { model: Service }],
      order: [['date_requested', 'DESC']],
    }),
  ]);

  actions.drugPrescriptions = drugPrescriptions;
  actions.testPrescriptions = testPrescriptions;
  actions.investigationPrescriptions = investigationPrescriptions;
  actions.servicePrescriptions = servicePrescriptions;

  // Get observations and clinical notes
  const [observations, triages, diagnoses] = await Promise.all([
    Observation.findAll({
      where: { visit_id, patient_id, examiner: staff_id },
      include: [{ model: Staff, as: 'examiner', attributes: staffAttributes }],
      order: [['createdAt', 'DESC']],
    }),
    Triage.findAll({
      where: { visit_id, patient_id, examiner: staff_id },
      include: [{ model: Staff, as: 'examiner', attributes: staffAttributes }],
      order: [['createdAt', 'DESC']],
    }),
    Diagnosis.findAll({
      where: { visit_id, patient_id, examiner: staff_id },
      include: [
        { model: Staff, as: 'examiner', attributes: staffAttributes },
        { model: ICD10Disease },
        { model: ICPC2Disease },
      ],
      order: [['createdAt', 'DESC']],
    }),
  ]);

  actions.observations = observations;
  actions.triages = triages;
  actions.diagnoses = diagnoses;

  return actions;
};

/**
 * Get patient encounter history with a specific doctor
 * @param patientId
 * @param staffId
 * @param currentPage
 * @param pageLimit
 */
export const getPatientEncounterHistory = async (
  patientId: number,
  staffId: number,
  currentPage = 1,
  pageLimit = 20
): Promise<{
  total: number;
  docs: any[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Encounter.paginate({
    page: currentPage,
    paginate: pageLimit,
    where: {
      patient_id: patientId,
      staff_id: staffId,
    },
    include: [
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
      { model: Visit, attributes: ['id', 'category', 'status'] },
    ],
    order: [['time_of_encounter', 'DESC']],
  });
};

/**
 * Get one encounter
 * @param query
 */
export const getOneEncounter = async (query: WhereOptions<Encounter>): Promise<Encounter> => {
  return Encounter.findOne({
    where: { ...query },
    include: [
      { model: Staff, attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
    ],
  });
};

export const getStaffEncounters = async (
  query: WhereOptions<Encounter>,
  currentPage = 1,
  pageLimit = 20
): Promise<{
  total: number;
  docs: any[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Encounter.paginate({
    page: currentPage,
    paginate: pageLimit,
    where: {
      ...query,
    },
    include: [
      { model: Staff, attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
    ],
  });
};

/**
 * Get encounter details for a specific staff member with comprehensive statistics
 * @param params
 */
export const getEncounterDetailsByStaff = async (params: {
  staff_id: number;
  start: Date;
  end: Date;
}) => {
  const { staff_id, start, end } = params;

  // Get all encounters for the staff member in the date range
  const encounters = await Encounter.findAll({
    where: {
      staff_id,
      ...(start && end && dateIntervalQuery('time_of_encounter', start, end)),
    },
    include: [
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Patient, attributes: patientAttributes },
      { model: Visit, attributes: ['id', 'category', 'status'] },
    ],
    order: [['time_of_encounter', 'DESC']],
  });

  // Get unique patients seen by this doctor
  const uniquePatients = [...new Set(encounters.map(e => e.patient_id))];

  // Get unique visits
  const uniqueVisits = [...new Set(encounters.map(e => e.visit_id))];

  // Group encounters by type
  const encountersByType = encounters.reduce((acc, encounter) => {
    const type = encounter.encounter_type || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(encounter);
    return acc;
  }, {});

  // Get summary statistics
  const summary = {
    totalEncounters: encounters.length,
    uniquePatients: uniquePatients.length,
    uniqueVisits: uniqueVisits.length,
    encountersByType: Object.keys(encountersByType).map(type => ({
      type,
      count: encountersByType[type].length,
    })),
    dateRange: {
      start,
      end,
    },
  };

  return {
    summary,
    encounters,
    encountersByType,
  };
};
