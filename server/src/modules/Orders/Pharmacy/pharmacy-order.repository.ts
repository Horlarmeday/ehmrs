/* eslint-disable camelcase */
import { PrescribedAdditionalItemBody, PrescribedDrugBody } from './interface/prescribed-drug.body';

import {
  DosageForm,
  Drug,
  Measurement,
  Patient,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Unit,
} from '../../../database/models';
import { WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { DrugForm } from '../../../database/models/drug';
import { getOneRouteOfAdministration } from '../../Pharmacy/pharmacy.repository';
import { PatientStatus } from '../../../database/models/patient';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { DefaultType } from '../../../database/models/default';

type PrescribeDrugType = PrescribedDrugBody & { drug_prescription_id: number };
const PRESCRIPTION_FREQUENCY = {
  Stat: 1,
  OD: 1,
  BD: 2,
  TDS: 3,
  QDS: 4,
  Q4H: 6,
  Q2H: 12,
  Q1H: 24,
};

const PRESCRIPTION_DURATION = {
  Days: 1,
  Weeks: 7,
  Months: 30,
};

/**
 * prescribe a drug for patient
 * @param data
 * @returns {object} prescribed drug data
 */
export async function prescribeDrug(data: PrescribeDrugType): Promise<PrescribedDrug> {
  const {
    drug_id,
    drug_type,
    quantity_prescribed,
    quantity_to_dispense,
    dosage_form_id,
    prescribed_strength,
    strength_id,
    route_id,
    frequency,
    duration,
    duration_unit,
    notes,
    total_price,
    examiner,
    patient_id,
    visit_id,
    start_date,
    drug_prescription_id,
    drug_group,
    inventory_id,
    source,
    ante_natal_id,
    unit_id,
  } = data || {};
  return PrescribedDrug.create({
    drug_id,
    drug_type,
    quantity_prescribed,
    quantity_to_dispense,
    route_id,
    dosage_form_id,
    prescribed_strength,
    strength_id,
    frequency,
    duration,
    duration_unit,
    notes,
    total_price,
    examiner,
    patient_id,
    visit_id,
    start_date,
    date_prescribed: Date.now(),
    drug_prescription_id,
    drug_group: drug_group || null,
    inventory_id,
    source,
    ante_natal_id,
    unit_id,
  });
}

/**
 * get prescribed drugs
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedDrugs = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedDrug.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_prescribed', 'DESC']],
    where: {
      ...(filter && { ...JSON.parse(filter) }),
    },
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
      },
      {
        model: Staff,
        as: 'requester',
        attributes: ['firstname', 'lastname'],
      },
      {
        model: DosageForm,
        attributes: ['name'],
      },
      {
        model: Measurement,
        attributes: ['name'],
      },
      {
        model: RoutesOfAdministration,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get prescribed additional items
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedAdditionalItems = ({
  currentPage = 1,
  pageLimit = 10,
  filter = null,
}) => {
  return PrescribedAdditionalItem.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_prescribed', 'DESC']],
    where: {
      ...(filter && { ...JSON.parse(filter) }),
    },
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
      },
      {
        model: Staff,
        as: 'requester',
        attributes: ['firstname', 'lastname'],
      },
      {
        model: Unit,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * add additional item for patient
 * @param data
 * @returns {Promise<PrescribedAdditionalItem>} prescribed additional item data
 */
export const prescribeAdditionalItem = async (
  data: PrescribedAdditionalItemBody
): Promise<PrescribedAdditionalItem> => {
  const {
    drug_id,
    drug_type,
    quantity_prescribed,
    quantity_to_dispense,
    drug_prescription_id,
    prescribed_drug_id,
    drug_form,
    total_price,
    examiner,
    patient_id,
    visit_id,
    start_date,
    unit_id,
    inventory_id,
  } = data;
  return PrescribedAdditionalItem.create({
    drug_id,
    drug_type,
    quantity_prescribed,
    quantity_to_dispense,
    drug_form,
    total_price,
    examiner,
    patient_id,
    visit_id,
    start_date,
    drug_prescription_id,
    unit_id,
    date_prescribed: Date.now(),
    inventory_id,
    prescribed_drug_id,
  });
};

/**
 * bulk create additional items
 * @param data
 * @returns {Promise<PrescribedAdditionalItem[]>} prescribed additional item data
 */
export const bulkCreateAdditionalItems = async (data): Promise<PrescribedAdditionalItem[]> => {
  return await PrescribedAdditionalItem.bulkCreate(data);
};

/**
 * get one prescribed drug
 * @param query
 * @returns {Promise<PrescribedDrug>} prescribed drug data
 */
export const getOnePrescribedDrug = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug> => {
  return await PrescribedDrug.findOne({ where: { ...query } });
};

/**
 * get all prescribed drugs in a drug prescription
 * @param query
 * @returns {Promise<PrescribedDrug[]>} prescribed drug data
 */
export const getPrescriptionDrugs = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug[]> => {
  return await PrescribedDrug.findAll({
    where: { ...query },
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
      },
      {
        model: Staff,
        as: 'requester',
        attributes: ['firstname', 'lastname'],
      },
      {
        model: DosageForm,
        attributes: ['name'],
      },
      {
        model: Measurement,
        attributes: ['name'],
      },
      {
        model: RoutesOfAdministration,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get one additional item
 * @param query
 * @returns {Promise<PrescribedAdditionalItem>} additional item data
 */
export const getOneAdditionalItem = async (
  query: WhereOptions<PrescribedAdditionalItem>
): Promise<PrescribedAdditionalItem> => {
  return await PrescribedAdditionalItem.findOne({ where: { ...query } });
};

/**
 * get all additional items in a drug prescription
 * @param query
 * @returns {Promise<PrescribedAdditionalItem[]>} additional items data
 */
export const getPrescriptionAdditionalItems = async (
  query: WhereOptions<PrescribedAdditionalItem>
): Promise<PrescribedAdditionalItem[]> => {
  return await PrescribedAdditionalItem.findAll({ where: { ...query } });
};

export const syringeNeedleCalculation = async ({
  prescription,
  patient,
  injectionItems,
}: {
  prescription: PrescribedDrug;
  patient: Patient;
  injectionItems: Array<any>;
}) => {
  const formattedDate = dayjs(patient.date_of_birth).format('YYYY-MM-DD');
  const age = dayjs().diff(dayjs(formattedDate), 'year');
  const route = await getOneRouteOfAdministration({ id: prescription.route_id });

  const prescriptionStrength = +prescription.prescribed_strength;
  const quantity =
    (PRESCRIPTION_FREQUENCY[prescription.frequency] || 0) *
    (PRESCRIPTION_DURATION[prescription.duration_unit] || 0) *
    prescription.duration;

  const prescribeAdditionalItemData = {
    drug_form: DrugForm.CONSUMABLE,
    drug_prescription_id: prescription.drug_prescription_id,
    prescribed_drug_id: prescription.id,
    quantity_prescribed: quantity,
    quantity_to_dispense: quantity,
    visit_id: prescription.visit_id,
    inventory_id: prescription.inventory_id,
    start_date: prescription.start_date,
    ante_natal_id: prescription.ante_natal_id,
    examiner: prescription.examiner,
    drug_type: prescription.drug_type,
    source: prescription.source,
    patient_id: patient.id,
  };

  const selectSyringe = (syringeName: string) => {
    const syringe = injectionItems.find(({ drug }) =>
      new RegExp(`\\b${syringeName}\\b`, 'i').test(drug.name)
    );
    if (syringe) {
      return {
        drug_id: syringe.drug.drug_id,
        unit_id: syringe.drug.unit_id,
        total_price: syringe.drug.price * quantity * (patient.has_insurance ? 0.1 : 1),
      };
    }
    return null;
  };

  const syringeData =
    prescriptionStrength <= 2
      ? selectSyringe('2 mls')
      : prescriptionStrength <= 5
      ? selectSyringe('5 mls')
      : selectSyringe('10 mls');

  if (syringeData)
    await prescribeAdditionalItem({ ...prescribeAdditionalItemData, ...syringeData });

  const needleData =
    route.name === 'Intramuscular'
      ? age <= 15
        ? selectSyringe('extraneedle 23G')
        : selectSyringe('extraneedle 21G')
      : route.name === 'Intravenous' && patient.patient_status === PatientStatus.OUTPATIENT
      ? age <= 15
        ? selectSyringe('scalp vein 23G')
        : selectSyringe('scalp vein 21G')
      : null;

  if (needleData) await prescribeAdditionalItem({ ...prescribeAdditionalItemData, ...needleData });

  const gloveData =
    patient.patient_status === PatientStatus.OUTPATIENT ? selectSyringe('gloves per pair') : null;
  if (gloveData) await prescribeAdditionalItem({ ...prescribeAdditionalItemData, ...gloveData });

  const oneDefault = await getOneDefault({ type: DefaultType.WATER_INJECTIONS });
  const waterNeededInjections = oneDefault?.data?.map(({ drug }) => drug.drug_id) || [];
  const waterData = waterNeededInjections.includes(prescription.drug_id)
    ? selectSyringe('water for injection')
    : null;
  if (waterData) await prescribeAdditionalItem({ ...prescribeAdditionalItemData, ...waterData });

  return true;
};
