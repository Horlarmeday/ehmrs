import sequelize from '../../database/config/config';
import { Op, Transaction } from 'sequelize';
import {
  Admission,
  Bed,
  Inventory,
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
    const admission = await Admission.create({ ...data }, { transaction: t });

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

    // don't await the result
    insertDefaultAdmissionItems({
      patient,
      items: oneDefault.data,
      admission,
      insurance,
      inventories,
    });

    return await getAdmissionById(admission.id);
  });
};

/**
 * get admission by its id
 * @param admission_id
 */
export const getAdmissionById = (admission_id: number) => {
  return Admission.findByPk(admission_id, {
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname'] },
    ],
  });
};

/**
 * get admission by patient id
 * @param patient_id
 */
export const getAdmissionByPatientId = (patient_id: number) => {
  return Admission.findOne({
    where: { patient_id },
    include: [
      { model: Ward, attributes: ['name'] },
      { model: Bed, attributes: ['code'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname'] },
    ],
  });
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
  discharge_status,
  search = null,
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
    order: [['createdAt', 'DESC']],
    where: {
      discharge_status,
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
