/* eslint-disable camelcase */
import { PrescribedAdditionalItemBody, PrescribedDrugBody } from './interface/prescribed-drug.body';
import {
  AdditionalTreatment,
  DosageForm,
  Drug,
  Measurement,
  Patient,
  PatientTreatment,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Unit,
} from '../../../database/models';
import { Optional, Transaction, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { DrugForm } from '../../../database/models/drug';
import { getOneRouteOfAdministration } from '../../Pharmacy/pharmacy.repository';
import { PatientStatus } from '../../../database/models/patient';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { DefaultType } from '../../../database/models/default';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import { flattenArray, StatusCodes } from '../../../core/helpers/helper';
import {
  ERROR_UPDATING_DRUG,
  ERROR_UPDATING_ITEM,
  INJECTION_SYRINGES_NOT_FOUND,
} from './messages/response-messages';
import sequelizeConnection from '../../../database/config/config';

type PrescribeDrugType = PrescribedDrugBody & {
  drug_prescription_id: number;
  nhis_status: string;
  patient_insurance_id?: number;
};
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
    immunization_id,
    surgery_id,
    nhis_status,
    patient_insurance_id,
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
    immunization_id,
    surgery_id,
    nhis_status,
    patient_insurance_id,
  });
}

/**
 * prescribe a drug for patient
 * @param data
 * @param injections
 * @param patient
 * @returns {object} prescribed drug data
 */
export const prescribeBulkDrugs = async (
  data,
  injections: PrescribedDrugBody[],
  patient: Patient
): Promise<PrescribedDrug[]> => {
  return sequelizeConnection.transaction(async (t: Transaction) => {
    const drugs = await PrescribedDrug.bulkCreate(data, { transaction: t });

    if (injections?.length) {
      const injectionDefaults = await getOneDefault({ type: DefaultType.INJECTION_ITEMS });
      if (!injectionDefaults) throw new BadException('Error', 400, INJECTION_SYRINGES_NOT_FOUND);

      const prescribedInjections = drugs.filter(drug =>
        injections.some(injection => drug.dosage_form_id === injection.dosage_form_id)
      );

      const additionalItems = await Promise.all(
        prescribedInjections.map(async injection => {
          return bulkSyringeNeedlePrescriptions({
            prescription: injection,
            patient,
            injectionItems: injectionDefaults?.data,
            patient_insurance_id: injection?.patient_insurance_id,
          });
        })
      );

      const itemBodies = flattenArray(additionalItems);
      await PrescribedAdditionalItem.bulkCreate(
        (itemBodies as unknown) as readonly Optional<any, string>[],
        { transaction: t }
      );
    }

    return drugs;
  });
};

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
      ...(filter && JSON.parse(filter)),
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
        attributes: staffAttributes,
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
 * update prescribed drug
 * @param data
 */
export const updatePrescribedDrug = async (data: Partial<PrescribedDrug>) => {
  try {
    await PrescribedDrug.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    console.error(e);
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_DRUG);
  }
  return getOnePrescribedDrug({ id: data.id });
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
      ...(filter && JSON.parse(filter)),
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
        attributes: staffAttributes,
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
 * update additional items
 * @param data
 */
export const updateAdditionalItem = async (data: Partial<PrescribedAdditionalItem>) => {
  try {
    await PrescribedAdditionalItem.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    console.error(e);
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_ITEM);
  }
  return getOneAdditionalItemWithJoins({ id: data.id });
};

/**
 * get one prescribed drug
 * @param query
 * @returns {Promise<PrescribedDrug>} prescribed drug data
 */
export const getOnePrescribedDrug = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug> => {
  return await PrescribedDrug.findOne({
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
        attributes: staffAttributes,
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
 * get one prescribed drug without joining other tables
 * @param query
 * @returns {Promise<PrescribedDrug>} prescribed drug data
 */
export const getOnePrescribedDrugWithoutJoins = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug> => {
  return PrescribedDrug.findOne({ where: { ...query } });
};

/**
 * get all prescribed drugs in a query without joins
 * @param query
 * @returns {Promise<PrescribedDrug[]>} prescribed drug data
 */
export const getPrescribedDrugsWithoutJoins = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug[]> => {
  return PrescribedDrug.findAll({ where: { ...query } });
};

/**
 * get all prescribed drugs in a query
 * @param query
 * @returns {Promise<PrescribedDrug[]>} prescribed drug data
 */
export const getDrugsPrescribed = async (
  query: WhereOptions<PrescribedDrug>
): Promise<PrescribedDrug[]> => {
  return PrescribedDrug.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Drug,
        attributes: ['name'],
        order: [['name', 'ASC']],
      },
      {
        model: Staff,
        as: 'requester',
        attributes: staffAttributes,
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
 * get all additional items in a query
 * @param query
 * @returns {Promise<PrescribedAdditionalItem[]>} additional items data
 */
export const getAdditionalItems = async (
  query: WhereOptions<PrescribedAdditionalItem>
): Promise<PrescribedAdditionalItem[]> => {
  return await PrescribedAdditionalItem.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Staff, attributes: staffAttributes },
      {
        model: Drug,
        attributes: ['name'],
      },
      {
        model: Unit,
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
export const getOneAdditionalItemWithJoins = async (
  query: WhereOptions<PrescribedAdditionalItem>
): Promise<PrescribedAdditionalItem> => {
  return await PrescribedAdditionalItem.findOne({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Staff, attributes: staffAttributes },
      {
        model: Drug,
        attributes: ['name'],
      },
      {
        model: Unit,
        attributes: ['name'],
      },
    ],
  });
};

/**
 * get all additional items in a query without table joins
 * @param query
 * @returns {Promise<PrescribedAdditionalItem[]>} additional items data
 */
export const getAdditionalItemsWithoutJoins = async (
  query: WhereOptions<PrescribedAdditionalItem>
): Promise<PrescribedAdditionalItem[]> => {
  return PrescribedAdditionalItem.findAll({ where: { ...query } });
};

export const syringeNeedleCalculation = async ({
  prescription,
  patient,
  injectionItems,
  patient_insurance_id,
}: {
  prescription: PrescribedDrug;
  patient: Patient;
  injectionItems: Array<any>;
  patient_insurance_id?: number;
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
    surgery_id: prescription.surgery_id,
    examiner: prescription.examiner,
    drug_type: prescription.drug_type,
    source: prescription.source,
    patient_id: patient.id,
    patient_insurance_id,
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

export const bulkSyringeNeedlePrescriptions = async ({
  prescription,
  patient,
  injectionItems,
  patient_insurance_id,
}: {
  prescription: PrescribedDrug;
  patient: Patient;
  injectionItems: Array<any>;
  patient_insurance_id?: number;
}) => {
  const formattedDate = dayjs(patient.date_of_birth).format('YYYY-MM-DD');
  const age = dayjs().diff(dayjs(formattedDate), 'year');
  const route = await getOneRouteOfAdministration({ id: prescription.route_id });

  const prescriptionStrength = +prescription.prescribed_strength;
  const quantity =
    (PRESCRIPTION_FREQUENCY[prescription.frequency] || 0) *
    (PRESCRIPTION_DURATION[prescription.duration_unit] || 0) *
    prescription.duration;
  const additionalItems: PrescribedAdditionalItemBody[] = [];

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
    surgery_id: prescription.surgery_id,
    examiner: prescription.examiner,
    drug_type: prescription.drug_type,
    source: prescription.source,
    patient_id: patient.id,
    patient_insurance_id,
    date_prescribed: Date.now(),
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

  if (syringeData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...syringeData,
    });
  }

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

  if (needleData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...needleData,
    });
  }

  const gloveData =
    patient.patient_status === PatientStatus.OUTPATIENT
      ? selectSyringe('examination gloves/pair')
      : null;
  if (gloveData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...gloveData,
    });
  }

  const oneDefault = await getOneDefault({ type: DefaultType.WATER_INJECTIONS });
  const waterNeededInjections = oneDefault?.data?.map(({ drug }) => drug.drug_id) || [];
  const waterData = waterNeededInjections?.includes(prescription.drug_id)
    ? selectSyringe('water for injection')
    : null;
  if (waterData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...waterData,
    });
  }
  return additionalItems;
};

/**
 * add treatments data for patient
 * @param data
 * @returns {Promise<PatientTreatment[]>} patient treatment data
 */
export const createBulkTreatmentData = async (data): Promise<PatientTreatment[]> => {
  return PatientTreatment.bulkCreate(data);
};

/**
 * get patient treatments
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPatientTreatments = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PatientTreatment.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_entered', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: PrescribedDrug,
        attributes: ['id'],
        include: [
          { model: Drug, attributes: ['name'] },
          {
            model: RoutesOfAdministration,
            attributes: ['name'],
          },
          {
            model: DosageForm,
            attributes: ['name'],
          },
        ],
      },
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
};

/**
 * delete prescribed drug
 * @param drugId
 */
export const deletePrescribedDrug = async (drugId: number) => {
  return PrescribedDrug.destroy({ where: { id: drugId } });
};

/**
 * delete prescribed additional item
 * @param itemId
 */
export const deleteAdditionalItem = async (itemId: number) => {
  return PrescribedAdditionalItem.destroy({ where: { id: itemId } });
};

/**
 * add additional treatments data for patient
 * @param data
 * @returns {Promise<AdditionalTreatment[]>} patient additional treatment data
 */
export const createBulkAdditionalTreatment = async (data): Promise<AdditionalTreatment[]> => {
  return AdditionalTreatment.bulkCreate(data);
};

/**
 * get patient additional treatments
 *
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getAdditionalTreatments = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return AdditionalTreatment.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_entered', 'DESC']],
    where: {
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Staff,
        attributes: staffAttributes,
      },
    ],
  });
};
