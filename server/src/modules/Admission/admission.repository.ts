import sequelize from '../../database/config/config';
import sequelizeConnection from '../../database/config/config';
import { Op, Optional, Transaction, WhereOptions } from 'sequelize';
import {
  Admission,
  Antenatal,
  Bed,
  CarePlan,
  Delivery,
  Discharge,
  Insurance,
  Inventory,
  IOChart,
  NursingNote,
  Observation,
  Patient,
  PatientInsurance,
  PostNatal,
  PrescribedService,
  Staff,
  Visit,
  Ward,
  WardRound,
} from '../../database/models';
import { BedStatus } from '../../database/models/bed';
import { ServiceType } from '../../database/models/prescribedService';
import { PatientStatus } from '../../database/models/patient';
import { getOneDefault, getWardWithService } from '../AdminSettings/admin.repository';
import { getPatientById } from '../Patient/patient.repository';
import { AdmissionBodyType, ChangeWardBodyType, DischargeBodyType } from './types/admission.types';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { VisitCategory, VisitStatus } from '../../database/models/visit';
import { DrugForm } from '../../database/models/drug';
import { DefaultType } from '../../database/models/default';
import { Source } from '../../database/models/prescribedDrug';
import {
  bulkCreateAdditionalItems,
  getAdditionalItems,
  getDrugsPrescribed,
  getPatientTreatments,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { Gender } from '../../database/models/staff';
import { getInventories } from '../Inventory/inventory.repository';
import { staffAttributes } from '../Antenatal/antenatal.repository';
import {
  dateIntervalQuery,
  EXCLUDED_INSURANCE,
  getAge,
  getDrugType,
  isToday,
  patientAttributes,
  StatusCodes,
} from '../../core/helpers/helper';
import { DischargeStatus } from '../../database/models/admission';
import { DischargeType } from '../../database/models/discharge';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import { getPrescriptionInvestigations } from '../Orders/Radiology/radiology-order.repository';
import { getPrescriptionServices } from '../Orders/Service/service-order.repository';
import { getPatientDiagnoses } from '../Consultation/consultation.repository';
import { AccountStatus } from '../../database/models/antenatal';
import { CreatePostNatal } from '../Antenatal/types/antenatal.types';
import { BadException } from '../../common/util/api-error';
import { NO_AVAILABLE_BED } from './messages/response-messages';
import { createDrugPrescription, getLastDrugPrescription } from '../Pharmacy/pharmacy.repository';
import { DrugStatus } from '../../database/models/drugPrescription';
import dayjs from 'dayjs';

enum Ages {
  ALL_AGES = 'ALL_AGES',
  LESS_THAN_EQUAL_TO_ONE = 'LESS_THAN_EQUAL_TO_ONE',
  GREATER_THAN_ONE_LESS_THAN_FIFTEEN = 'GREATER_THAN_ONE_LESS_THAN_FIFTEEN',
  GREATER_THAN_FIFTEEN = 'GREATER_THAN_FIFTEEN',
}
/**
 * Admit patient into a ward
 * @param data
 */
export const admitPatient = async (data: AdmissionBodyType) => {
  const { bed_id, admitted_by, patient_id, visit_id, ward_id, ante_natal_id } = data;
  const [ward, insurance, patient, admissionItems, inventories] = await Promise.all([
    getWardWithService(ward_id),
    getPatientInsuranceQuery({ patient_id }),
    getPatientById(patient_id),
    getOneDefault({ type: DefaultType.ADMISSION_ITEMS }),
    getInventories(),
  ]);

  let bedId = bed_id;
  // bed_id is only sent from client when the ward is VIP else we have to search the ward for
  // available bed space
  if (!bed_id) {
    const beds = ward?.beds?.filter(bed => bed.status === BedStatus.UNTAKEN);
    if (beds?.length) {
      bedId = beds[0].id;
    } else {
      throw new BadException('INVALID', StatusCodes.BAD_REQUEST, NO_AVAILABLE_BED);
    }
  }

  return sequelize.transaction(async (t: Transaction) => {
    const admission = await Admission.create(
      {
        ...data,
        visit_id,
        admitted_by: admitted_by.sub,
        date_admitted: Date.now(),
        bed_id: bedId,
      },
      { transaction: t }
    );

    await Bed.update({ status: BedStatus.TAKEN }, { where: { id: bedId }, transaction: t });

    if (
      !patient.has_insurance ||
      !EXCLUDED_INSURANCE.includes(insurance?.insurance?.name) ||
      patient.admitted_days_in_year > 21
    )
      await PrescribedService.create(
        {
          service_id: ward.service.id,
          price: ward.service.price,
          service_type: ServiceType.CASH,
          requester: admitted_by.sub,
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

    // update the visit with the admission id
    await Visit.update(
      {
        category: VisitCategory.IPD,
        admission_id: admission.id,
        date_visit_start: Date.now(),
        status: VisitStatus.ONGOING,
        ...(ante_natal_id && { ante_natal_id }),
      },
      { where: { id: visit_id }, transaction: t }
    );

    if (admissionItems) {
      // don't await the result
      insertDefaultAdmissionItems({
        patient,
        items: admissionItems.data,
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
      { model: Ward, as: 'ward', attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};

/**
 * get one admission query
 * @param query
 */
export const getOneAdmissionQuery = async (query: WhereOptions<Admission>) => {
  return Admission.findOne({
    where: { ...query },
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
        attributes: patientAttributes,
      },
      { model: Ward, as: 'ward', attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
  if (admission) {
    const insurance = await getPatientInsuranceQuery({
      patient_id: admission.patient_id,
      is_default: true,
    });
    return { ...admission.toJSON(), insurance };
  }
  return null;
};

export const updateAdmission = async (data: { [p: string]: any }, admissionId: number) => {
  return Admission.update({ ...data }, { where: { id: admissionId } });
};

export const getAdmission = (admissionId: number) => {
  return Admission.findByPk(admissionId);
};

/**
 * get admission history
 * @param admissionId
 */
export const getAdmissionHistory = async (admissionId: number) => {
  const admission = await getAdmission(admissionId);
  const [
    tests,
    drugs,
    investigations,
    observations,
    plans,
    diagnoses,
    items,
    services,
    charts,
    notes,
    treatments,
    wardRounds,
  ] = await Promise.all([
    getPrescriptionTests({ visit_id: admission.visit_id }),
    getDrugsPrescribed({ visit_id: admission.visit_id }),
    getPrescriptionInvestigations({ visit_id: admission.visit_id }),
    getObservations({ admission_id: admissionId }),
    getCarePlans({ admission_id: admissionId }),
    getPatientDiagnoses({ visit_id: admission.visit_id }),
    getAdditionalItems({ visit_id: admission.visit_id }),
    getPrescriptionServices({ visit_id: admission.visit_id }),
    getIOCharts({ admission_id: admissionId }),
    getNursingNotes({ admission_id: admissionId }),
    getPatientTreatments({ filter: JSON.stringify({ visit_id: admission.visit_id }) }),
    getWardRounds({ admission_id: admissionId }),
  ]);
  return {
    tests,
    drugs,
    investigations,
    observations,
    plans,
    diagnoses,
    items,
    services,
    charts,
    notes,
    treatments: treatments.docs,
    wardRounds,
  };
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
      discharge_status: DischargeStatus.ON_ADMISSION,
    },
    include: [
      {
        model: Ward,
        as: 'ward',
        attributes: ['name', 'occupant_type'],
        where: {
          ...(filter && {
            [Op.or]: [{ ...JSON.parse(filter) }, { occupant_type: 'All' }],
          }),
        },
      },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
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
              {
                complete_name: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
    ],
  });
};

/**
 * get antenatal admitted patients
 *
 * @function
 * @returns {Promise<{ total: any; docs: Admission[]; pages: number; perPage: number; currentPage: number }>} json object with all admission data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param discharge_status
 */
export const getAntenatalAdmittedPatients = async ({
  currentPage = 1,
  pageLimit = 10,
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
      discharge_status: DischargeStatus.ON_ADMISSION,
      ante_natal_id: {
        [Op.ne]: null,
      },
    },
    include: [
      {
        model: Ward,
        as: 'ward',
        attributes: ['name', 'occupant_type'],
      },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
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
              {
                complete_name: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
    ],
  });
};

/**
 * get discharge recommended patients
 */
export const getDischargeRecommendedPatients = async () => {
  return await Admission.findAll({
    where: {
      should_discharge: true,
      discharge_status: DischargeStatus.ON_ADMISSION,
    },
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      { model: Ward, as: 'ward', attributes: ['name', 'occupant_type'] },
    ],
  });
};

/**
 * change patient ward
 *
 * @function
 * @returns {void}
 * @param admission
 * @param data
 */
export const changePatientWard = async (
  admission: Admission,
  data: ChangeWardBodyType
): Promise<void> => {
  return sequelizeConnection.transaction(async t => {
    // remove patient from previous bed in the old ward
    await Bed.update(
      { status: BedStatus.UNTAKEN },
      { where: { id: admission.bed_id }, transaction: t }
    );
    // change the ward details in the admission
    await admission.update({ ...data, previous_ward: admission.ward_id }, { transaction: t });
    // assign new bed to the patient in the new ward
    await Bed.update({ status: BedStatus.TAKEN }, { where: { id: data.bed_id }, transaction: t });
  });
};

const getDrugPrescription = async (patient_id: number, data: any) => {
  const drugPrescriptionData = {
    source: data.source,
    requester: 'staff_id' in data ? data.staff_id : data.examiner,
    visit_id: data.visit_id,
    patient_id,
    date_prescribed: Date.now(),
    ...(data?.ante_natal_id && { ante_natal_id: data?.ante_natal_id }),
  };

  const lastPrescription = await getLastDrugPrescription(patient_id);

  if (lastPrescription && !isToday(lastPrescription?.date_prescribed))
    return createDrugPrescription(drugPrescriptionData);

  // if drug has not been dispensed - pick the id and use it in prescribed drug
  if (lastPrescription?.status === DrugStatus.PENDING) return lastPrescription;

  // if drug was prescribed today and has been dispensed - create new one
  if (lastPrescription?.status === DrugStatus.COMPLETE_DISPENSE)
    return createDrugPrescription(drugPrescriptionData);

  return createDrugPrescription(drugPrescriptionData);
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
  const age = getAge(patient.date_of_birth);
  const sex = patient.gender;
  const source = admission.ante_natal_id ? Source.ANC : Source.CONSULTATION;
  const drugType = getDrugType(patient.has_insurance, insurance);

  const inventory = inventories.find(({ accepted_drug_type }) =>
    new RegExp(`\\b${drugType}\\b`, 'i').test(accepted_drug_type)
  );
  const isNHIS = EXCLUDED_INSURANCE.includes(insurance?.insurance?.name);
  const drugPrescription = await getDrugPrescription(patient.id, {
    visit_id: admission.visit_id,
    source: Source.CONSULTATION,
    examiner: admission.admitted_by,
    ante_natal_id: admission.ante_natal_id,
  });
  const createItems = (filteredItems: any[]) => {
    const consumables = filteredItems?.filter(item => item?.drug?.drug_type === drugType);
    if (consumables?.length) {
      return consumables?.map(item => ({
        drug_form: DrugForm.CONSUMABLE,
        quantity_prescribed: +item.quantity,
        quantity_to_dispense: +item.quantity,
        visit_id: admission?.visit_id,
        inventory_id: inventory?.id || 1,
        start_date: Date.now(),
        date_prescribed: Date.now(),
        ante_natal_id: admission?.ante_natal_id,
        examiner: admission?.admitted_by,
        drug_type: drugType,
        source,
        patient_id: patient.id,
        drug_id: item?.drug?.drug_id,
        unit_id: item?.drug?.unit_id,
        drug_prescription_id: drugPrescription?.id,
        patient_insurance_id: insurance?.id,
        total_price:
          item?.drug?.price * item.quantity * (isNHIS && !/gloves/i.test(item) ? 0.1 : 1),
      }));
    }
    return [];
  };

  const allAgesItems = items.filter(item => item.age === Ages.ALL_AGES);
  const consumables = createItems(allAgesItems);
  if (consumables?.length) {
    await bulkCreateAdditionalItems(consumables);
  }

  if (age <= 1) {
    const ageLessOneItems = items.filter(item => item.age === Ages.LESS_THAN_EQUAL_TO_ONE);
    const ageLessOneConsumables = createItems(ageLessOneItems);
    if (ageLessOneConsumables?.length) {
      await bulkCreateAdditionalItems(ageLessOneConsumables);
    }
  }

  if (age > 1 && age <= 15) {
    const betweenOneAndFifteenItems = items.filter(
      item => item.age === Ages.GREATER_THAN_ONE_LESS_THAN_FIFTEEN
    );
    const betweenOneAndFifteenConsumables = createItems(betweenOneAndFifteenItems);
    if (betweenOneAndFifteenConsumables?.length) {
      await bulkCreateAdditionalItems(betweenOneAndFifteenConsumables);
    }
  }

  if (age > 15 && sex === Gender.FEMALE) {
    const femaleItems = items.filter(
      item => item.age === Ages.GREATER_THAN_FIFTEEN && item.sex === Gender.FEMALE
    );
    const femaleItemsConsumables = createItems(femaleItems);
    if (femaleItemsConsumables?.length) {
      await bulkCreateAdditionalItems(femaleItemsConsumables);
    }
  }

  if (age > 15 && sex === Gender.MALE) {
    const maleItems = items.filter(
      item => item.age === Ages.GREATER_THAN_FIFTEEN && item.sex === Gender.MALE
    );
    const maleItemsConsumables = createItems(maleItems);
    if (maleItemsConsumables?.length) {
      await bulkCreateAdditionalItems(maleItemsConsumables);
    }
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
    order: [['createdAt', 'DESC']],
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
    order: [['createdAt', 'DESC']],
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
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/******************
 * Nursing Notes
 ******************/

/**
 * create a Nursing notes
 * @param data
 */
export const createNursingNote = async (data: { [p: string]: any }) => {
  return NursingNote.create(data);
};

/**
 * get a patient Nursing Notes
 * @param query
 */
export const getNursingNotes = async (query: WhereOptions<NursingNote>) => {
  return NursingNote.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/******************
 * Ward Round
 ******************/

/**
 * create a Ward round
 * @param data
 */
export const createWardRound = async (data: { [p: string]: any }) => {
  return WardRound.create(data);
};

/**
 * get a patient Ward rounds
 * @param query
 */
export const getWardRounds = async (query: WhereOptions<WardRound>) => {
  return WardRound.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/******************
 * Discharge Patient
 ******************/

type DischargePatientType = DischargeBodyType & {
  admission_id: number;
  ward_id: number;
  patient_id: number;
  visit_id: number;
  discharged_by: number;
};

/**
 * Discharge a patient
 * @param data
 */
export const dischargePatient = async (data: DischargePatientType) => {
  const { discharged_by, patient_id, admission_id, discharge_type } = data;
  return await sequelize.transaction(async (t: Transaction) => {
    const admission = await Admission.findOne({ where: { id: admission_id }, transaction: t });
    // create discharge record
    const discharge = await Discharge.create({ ...data }, { transaction: t });

    // update the admission status
    await Admission.update(
      { discharged_by, discharge_status: DischargeStatus.DISCHARGED },
      { where: { id: admission_id }, transaction: t }
    );

    await Bed.update(
      { status: BedStatus.UNTAKEN },
      { where: { id: admission.bed_id }, transaction: t }
    );
    // update the patient status
    await Patient.update(
      {
        patient_status:
          discharge_type === DischargeType.DEATH
            ? PatientStatus.DECEASED
            : PatientStatus.OUTPATIENT,
      },
      { where: { id: patient_id }, transaction: t }
    );

    // end visit
    await Visit.update(
      { status: VisitStatus.ENDED, date_visit_ended: Date.now() },
      { where: { id: data.visit_id }, transaction: t }
    );

    const numberOfDaysAdmitted = dayjs().diff(dayjs(admission.date_admitted), 'days');
    await Patient.increment(
      { admitted_days_in_year: numberOfDaysAdmitted },
      { where: { id: patient_id }, transaction: t }
    );
    return getOneDischargeRecord({ id: discharge.id });
  });
};

/**
 * get discharge records
 *
 * @function
 * @returns {Promise<{ total: any; docs: Discharge[]; pages: number; perPage: number; currentPage: number }>} json object with all discharge data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param discharge_status
 */
export const getDischargeRecords = async ({
  currentPage = 1,
  pageLimit = 10,
  search = null,
  start = null,
  end = null,
}): Promise<{
  total: any;
  docs: Discharge[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  return Discharge.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_discharged', 'DESC']],
    where: {
      ...(start && end && dateIntervalQuery('date_discharged', start, end)),
    },
    include: [
      {
        model: Ward,
        as: 'ward',
        attributes: ['name'],
      },
      { model: Staff, attributes: staffAttributes },
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
              {
                complete_name: {
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
 * get one discharge record
 * @param query
 */
export const getOneDischargeRecord = async (query: WhereOptions<Discharge>) => {
  return Discharge.findOne({
    where: { ...query },
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Staff, attributes: staffAttributes },
    ],
  });
};

/***************************
 * DELIVERY INFO
 ***************************/
/**
 * Create a patient delivery information
 * @param data
 */
export const createDeliveryInfo = async data => {
  return Delivery.create({ ...data });
};

/**
 * get a patient delivery information
 * @param query
 */
export const getDeliveryInfo = async (query: WhereOptions<Delivery>) => {
  return Delivery.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};

/***************************
 * POST NATAL
 ***************************/
/**
 * Create a patient postnatal information
 * @param data
 * @param antenatalId
 */
export const createPostnatal = async (
  data: Optional<CreatePostNatal, keyof CreatePostNatal>,
  antenatalId: number
) => {
  return await sequelizeConnection.transaction(async t => {
    const postnatal = await PostNatal.create({ ...data }, { transaction: t });

    if (antenatalId) {
      await Antenatal.update(
        { account_status: AccountStatus.COMPLETED, end_date: Date.now() },
        { where: { id: antenatalId }, transaction: t }
      );
    }

    await Visit.update(
      { status: VisitStatus.ENDED, date_visit_ended: Date.now() },
      { where: { id: data.visit_id }, transaction: t }
    );
    return postnatal;
  });
};

/**
 * get a patient delivery information
 * @param query
 */
export const getPostnatalInfo = async (query: WhereOptions<PostNatal>) => {
  return PostNatal.findAll({
    where: { ...query },
    include: [{ model: Staff, attributes: staffAttributes }],
  });
};
