import sequelize from '../../database/config/config';
import { Op, Transaction, WhereOptions } from 'sequelize';
import {
  Admission,
  Bed,
  CarePlan,
  Inventory,
  IOChart,
  Observation,
  Patient,
  PatientInsurance,
  PrescribedService,
  Staff,
  Visit,
  Ward,
} from '../../database/models';
import { BedStatus } from '../../database/models/bed';
import { ServiceType } from '../../database/models/prescribedService';
import { PatientStatus } from '../../database/models/patient';
import { getOneDefault, getWardWithService } from '../AdminSettings/admin.repository';
import { getPatientById } from '../Patient/patient.repository';
import { AdmissionBodyType } from './types/admission.types';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { patientAttributes } from '../Visit/visit.repository';
import { VisitCategory } from '../../database/models/visit';
import dayjs from 'dayjs';
import { DrugForm } from '../../database/models/drug';
import { DefaultType } from '../../database/models/default';
import { Source } from '../../database/models/prescribedDrug';
import { bulkCreateAdditionalItems } from '../Orders/Pharmacy/pharmacy-order.repository';
import { Gender } from '../../database/models/staff';
import { DrugType } from '../../database/models/pharmacyStore';
import { getInventories } from '../Inventory/inventory.repository';
import { staffAttributes } from '../Antenatal/antenatal.repository';
import { dateIntervalQuery } from '../../core/helpers/helper';

enum Ages {
  ALL_AGES = 'ALL_AGES',
  LESS_THAN_EQUAL_TO_ONE = 'LESS_THAN_EQUAL_TO_ONE',
  GREATER_THAN_ONE_LESS_THAN_FIFTEEN = 'GREATER_THAN_ONE_LESS_THAN_FIFTEEN',
  GREATER_THAN_FIFTEEN = 'GREATER_THAN_FIFTEEN',
}
const EXCLUDED_INSURANCE = ['NHIS', 'FHSS'];

/**
 * Admit patient into a ward
 * @param data
 */
export const admitPatient = async (data: AdmissionBodyType) => {
  const { bed_id, admitted_by, patient_id, visit_id, ward_id } = data;
  const [ward, insurance, patient, oneDefault, inventories] = await Promise.all([
    getWardWithService(ward_id),
    getPatientInsuranceQuery({ patient_id }),
    getPatientById(patient_id),
    getOneDefault({ type: DefaultType.ADMISSION_ITEMS }),
    getInventories(),
  ]);

  return await sequelize.transaction(async (t: Transaction) => {
    const admission = await Admission.create(
      { ...data, date_admitted: Date.now() },
      { transaction: t }
    );

    await Bed.update({ status: BedStatus.TAKEN }, { where: { id: bed_id }, transaction: t });

    if (!patient.has_insurance || !EXCLUDED_INSURANCE.includes(insurance?.insurance?.name))
      await PrescribedService.create(
        {
          service_id: ward.service.id,
          price: ward.service.price,
          service_type: ServiceType.CASH,
          requester: admitted_by,
          visit_id,
          patient_id,
          date_requested: Date.now(),
        },
        { transaction: t }
      );
    await Patient.update(
      { patient_status: PatientStatus.INPATIENT },
      { where: { id: patient_id }, transaction: t }
    );
    await Visit.update(
      { category: VisitCategory.IPD, admission_id: admission.id },
      { where: { id: visit_id }, transaction: t }
    );

    if (oneDefault) {
      // don't await the result
      insertDefaultAdmissionItems({
        patient,
        items: oneDefault.data,
        admission,
        insurance,
        inventories,
      });
    }

    return getOneAdmission({ id: admission.id });
  });
};

/**
 * get one admission
 * @param query
 */
export const getOneAdmission = async (query: WhereOptions<Admission>) => {
  return Admission.findOne({
    where: { ...query },
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};

/**
 * get admission
 * @param query
 */
export const getAdmissionQuery = async (query: WhereOptions<Admission>) => {
  const admission = await Admission.findOne({
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
        ],
      },
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
  const insurance = await getPatientInsuranceQuery({
    patient_id: admission.patient_id,
    is_default: true,
  });
  return { ...admission.toJSON(), insurance };
};

export const updateAdmission = async (data: { [p: string]: any }, admissionId: number) => {
  return Admission.update({ ...data }, { where: { id: admissionId } });
};

/**
 * get admitted patients
 *
 * @function
 * @returns {Promise<{ total: any; docs: Admission[]; pages: number; perPage: number; currentPage: number }>} json object with all admission data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param discharge_status
 */
export const getAdmittedPatients = async ({
  currentPage = 1,
  pageLimit = 10,
  filter = null,
  search = null,
  start = null,
  end = null,
}): Promise<{
  total: any;
  docs: Admission[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Admission.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_admitted', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('date_admitted', start, end)),
    },
    include: [
      {
        model: Ward,
        attributes: ['name'],
      },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(filter && JSON.parse(filter)),
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
 * insert the default items for patient admission
 *
 * @function
 * @returns {boolean} json object with additional items data
 * @param {object} patient
 * @param items
 * @param admission
 * @param insurance
 * @param inventories
 */
export const insertDefaultAdmissionItems = async ({
  patient,
  items,
  admission,
  insurance,
  inventories,
}: {
  patient: Patient;
  items: any[];
  admission: Admission;
  insurance: PatientInsurance;
  inventories: Inventory[];
}): Promise<boolean> => {
  const formattedDate = dayjs(patient.date_of_birth).format('YYYY-MM-DD');
  const age = dayjs().diff(dayjs(formattedDate), 'year');
  const sex = patient.gender;
  const source = admission.ante_natal_id ? Source.ANC : Source.CONSULTATION;
  const drugType =
    patient.has_insurance && EXCLUDED_INSURANCE.includes(insurance.insurance.name)
      ? DrugType.NHIS
      : DrugType.CASH;

  const inventory = inventories.find(({ accepted_drug_type }) =>
    new RegExp(`\\b${drugType}\\b`, 'i').test(accepted_drug_type)
  );

  const createItems = (filteredItems: any[]) => {
    return filteredItems.map(item => ({
      drug_form: DrugForm.CONSUMABLE,
      quantity_prescribed: +item.quantity,
      quantity_to_dispense: +item.quantity,
      visit_id: admission.visit_id,
      inventory_id: inventory.id,
      start_date: Date.now(),
      date_prescribed: Date.now(),
      ante_natal_id: admission.ante_natal_id,
      examiner: admission.admitted_by,
      drug_type: drugType,
      source,
      patient_id: patient.id,
      drug_id: item.drug.drug_id,
      unit_id: item.drug.unit_id,
      total_price: item.drug.price * item.quantity * (patient.has_insurance ? 0.1 : 1),
    }));
  };

  const allAgesItems = items.filter(item => item.age === Ages.ALL_AGES);
  await bulkCreateAdditionalItems(createItems(allAgesItems));

  if (age <= 1) {
    const ageLessOneItems = items.filter(item => item.age === Ages.LESS_THAN_EQUAL_TO_ONE);
    await bulkCreateAdditionalItems(createItems(ageLessOneItems));
  }

  if (age > 1 && age <= 15) {
    const betweenOneAndFifteenItems = items.filter(
      item => item.age === Ages.GREATER_THAN_ONE_LESS_THAN_FIFTEEN
    );
    await bulkCreateAdditionalItems(createItems(betweenOneAndFifteenItems));
  }

  if (age > 15 && sex === Gender.FEMALE) {
    const femaleItems = items.filter(
      item => item.age === Ages.GREATER_THAN_FIFTEEN && item.sex === Gender.FEMALE
    );
    await bulkCreateAdditionalItems(createItems(femaleItems));
  }

  if (age > 15 && sex === Gender.MALE) {
    const maleItems = items.filter(
      item => item.age === Ages.GREATER_THAN_FIFTEEN && item.sex === Gender.MALE
    );
    await bulkCreateAdditionalItems(createItems(maleItems));
  }

  return true;
};

/******************
 * Observations
 ******************/

/**
 * create an observation
 * @param data
 */
export const createObservation = async (data: { [p: string]: any }) => {
  return Observation.create({ ...data });
};

/**
 * get a patient observations
 * @param query
 */
export const getObservations = async (query: WhereOptions<Observation>) => {
  return Observation.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/******************
 * Care Plan
 ******************/

/**
 * create a care plan
 * @param data
 */
export const createCarePlan = async (data: { [p: string]: any }) => {
  return CarePlan.create({ ...data });
};

/**
 * get a patient care plans
 * @param query
 */
export const getCarePlans = async (query: WhereOptions<CarePlan>) => {
  return CarePlan.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/******************
 * IO Chart
 ******************/

/**
 * create a care plan
 * @param data
 */
export const createIOChart = async (data: { [p: string]: any }[]) => {
  return IOChart.bulkCreate(data);
};

/**
 * get a patient IO Chart
 * @param query
 */
export const getIOCharts = async (query: WhereOptions<IOChart>) => {
  return IOChart.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};
