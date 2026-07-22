/* eslint-disable camelcase */
import { PrescribedAdditionalItemBody, PrescribedDrugBody } from './interface/prescribed-drug.body';
import {
  AdditionalTreatment,
  DosageForm,
  Drug,
  Measurement,
  Patient,
  PatientInsurance,
  PatientTreatment,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Unit,
} from '../../../database/models';
import { Op, Optional, Transaction, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { DrugForm, DispenseStatus, PaymentStatus } from '../../../database/enums';
import { getOneRouteOfAdministration } from '../../Pharmacy/pharmacy.repository';
import { PatientStatus, DefaultType } from '../../../database/enums';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import {
  EXCLUDED_INSURANCE,
  flattenArray,
  getDrugType,
  StatusCodes,
} from '../../../core/helpers/helper';
import {
  ERROR_UPDATING_DRUG,
  ERROR_UPDATING_ITEM,
  INJECTION_SYRINGES_NOT_FOUND,
} from './messages/response-messages';
import { sequelizeConnection } from '../../../database/config/data-source';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import { emitChargeCapturedForRows } from '../../Outbox/outbox-writer';

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

    // Emit charge.captured for each drug in the SAME transaction (ADR-0018): the drug and its
    // event commit together or both roll back. No-op unless EMR_OUTBOX_ENABLED.
    await emitChargeCapturedForRows('drug', drugs, dayjs().format('YYYY-MM-DD'), t);

    if (injections?.length) {
      const injectionDefaults = await getOneDefault({ type: DefaultType.INJECTION_ITEMS });
      if (!injectionDefaults) throw new BadException('Error', 400, INJECTION_SYRINGES_NOT_FOUND);

      const prescribedInjections = drugs.filter(drug =>
        injections.some(injection => drug.dosage_form_id === injection.dosage_form_id)
      );

      const patientInsurance = await getPatientInsuranceQuery({ patient_id: patient.id });

      const additionalItems = await Promise.all(
        prescribedInjections.map(async injection => {
          return bulkSyringeNeedlePrescriptions({
            prescription: injection,
            patient,
            injectionItems: injectionDefaults?.data,
            patient_insurance_id: injection?.patient_insurance_id,
            insurance: patientInsurance,
          });
        })
      );

      const itemBodies = flattenArray(additionalItems);
      const createdItems = await bulkCreateAdditionalItems(itemBodies, t);

      // Consumables (syringes/needles) are billable like any line — emit for them too, in the
      // same transaction. Missing this is the silent-charge-loss ADR-0027 warns about.
      await emitChargeCapturedForRows(
        'additional_item',
        createdItems,
        dayjs().format('YYYY-MM-DD'),
        t
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
        model: Staff,
        as: 'nhis_drug_processor',
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
        model: Staff,
        as: 'nhis_item_processor',
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
 * bulk create additional items with consolidation logic
 * @param data - array of items to create
 * @param transaction - optional transaction
 * @returns {Promise<PrescribedAdditionalItem[]>} prescribed additional item data
 */
export const bulkCreateAdditionalItems = async (
  data: (PrescribedAdditionalItemBody & { date_prescribed?: Date | number })[],
  transaction?: Transaction
): Promise<PrescribedAdditionalItem[]> => {
  if (!data || data.length === 0) {
    return [];
  }

  // Consolidate items: find existing similar items and group for update vs create
  const { itemsToUpdate, itemsToCreate } = await consolidateAdditionalItems(data, transaction);

  const createdItems: PrescribedAdditionalItem[] = [];

  // Update existing items with consolidated quantities
  if (itemsToUpdate.length > 0) {
    await Promise.all(
      itemsToUpdate.map(async ({ id, updates }) => {
        await PrescribedAdditionalItem.update(updates, {
          where: { id },
          transaction,
        });
      })
    );
    // Fetch updated items to return
    const updatedItems = await Promise.all(
      itemsToUpdate.map(async ({ id }) => {
        return PrescribedAdditionalItem.findByPk(id, { transaction });
      })
    );
    createdItems.push(...(updatedItems.filter(Boolean) as PrescribedAdditionalItem[]));
  }

  // Create new items that don't have matches
  if (itemsToCreate.length > 0) {
    const newItems = await PrescribedAdditionalItem.bulkCreate(
      (itemsToCreate as unknown) as readonly Optional<
        PrescribedAdditionalItem,
        keyof PrescribedAdditionalItem
      >[],
      { transaction }
    );
    createdItems.push(...newItems);
  }

  return createdItems;
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
        model: Staff,
        as: 'nhis_drug_processor',
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
      { model: Staff, as: 'requester', attributes: staffAttributes },
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
      { model: Staff, as: 'requester', attributes: staffAttributes },
      { model: Staff, as: 'nhis_item_processor', attributes: staffAttributes },
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

/**
 * generate a similarity key for matching items
 * @param item - item to generate key for
 * @returns {string} similarity key
 */
const getSimilarityKey = (
  item:
    | (PrescribedAdditionalItemBody & { date_prescribed?: Date | number })
    | PrescribedAdditionalItem
): string => {
  const date = item.date_prescribed ? new Date(item.date_prescribed) : new Date();
  const dateKey = dayjs(date).format('YYYY-MM-DD');
  return `${item.drug_id}_${item.unit_id}_${item.drug_type}_${item.patient_id}_${item.examiner}_${dateKey}`;
};

/**
 * query similar additional items that can be consolidated
 * @param item - item to find similar matches for
 * @param transaction - optional transaction
 * @returns {Promise<PrescribedAdditionalItem | null>} similar item if found
 */
export const querySimilarAdditionalItems = async (
  item: PrescribedAdditionalItemBody & { date_prescribed?: Date | number },
  transaction?: Transaction
): Promise<PrescribedAdditionalItem | null> => {
  const itemDate = item.date_prescribed ? new Date(item.date_prescribed) : new Date();
  const startOfDay = dayjs(itemDate)
    .startOf('day')
    .toDate();
  const endOfDay = dayjs(itemDate)
    .endOf('day')
    .toDate();

  const whereClause: WhereOptions<PrescribedAdditionalItem> = {
    drug_id: item.drug_id,
    unit_id: item.unit_id,
    drug_type: item.drug_type,
    patient_id: item.patient_id,
    examiner: item.examiner,
    payment_status: PaymentStatus.PENDING,
    dispense_status: DispenseStatus.PENDING,
    date_prescribed: {
      [Op.gte]: startOfDay,
      [Op.lt]: endOfDay,
    },
  };

  return PrescribedAdditionalItem.findOne({
    where: whereClause,
    transaction,
  });
};

/**
 * consolidate additional items by finding existing similar items and grouping for update vs create
 * Optimized to use a single bulk query instead of N+1 queries for better performance
 * @param items - array of items to consolidate
 * @param transaction - optional transaction
 * @returns {Promise<{itemsToUpdate: Array<{id: number, updates: Partial<PrescribedAdditionalItem>}>, itemsToCreate: PrescribedAdditionalItemBody[]}>}
 */
export const consolidateAdditionalItems = async (
  items: (PrescribedAdditionalItemBody & { date_prescribed?: Date | number })[],
  transaction?: Transaction
): Promise<{
  itemsToUpdate: Array<{ id: number; updates: Partial<PrescribedAdditionalItem> }>;
  itemsToCreate: (PrescribedAdditionalItemBody & { date_prescribed?: Date | number })[];
}> => {
  // Early return if no items
  if (!items || items.length === 0) {
    return { itemsToUpdate: [], itemsToCreate: [] };
  }

  const itemsToUpdate: Array<{ id: number; updates: Partial<PrescribedAdditionalItem> }> = [];
  const itemsToCreate: (PrescribedAdditionalItemBody & { date_prescribed?: Date | number })[] = [];

  // Build array of OR conditions for all items in a single query
  const orConditions = items.map(item => {
    const itemDate = item.date_prescribed ? new Date(item.date_prescribed) : new Date();
    const startOfDay = dayjs(itemDate)
      .startOf('day')
      .toDate();
    const endOfDay = dayjs(itemDate)
      .endOf('day')
      .toDate();

    return {
      drug_id: item.drug_id,
      unit_id: item.unit_id,
      drug_type: item.drug_type,
      patient_id: item.patient_id,
      examiner: item.examiner,
      payment_status: PaymentStatus.PENDING,
      dispense_status: DispenseStatus.PENDING,
      date_prescribed: {
        [Op.gte]: startOfDay,
        [Op.lt]: endOfDay,
      },
    };
  });

  // Single bulk query to fetch all potentially matching items
  const existingItems = await PrescribedAdditionalItem.findAll({
    where: {
      [Op.or]: orConditions,
    },
    transaction,
  });

  // Build Map for O(1) lookup of existing items by similarity key
  const existingItemsMap = new Map<string, PrescribedAdditionalItem>();
  existingItems.forEach(item => {
    const key = getSimilarityKey(item);
    // If multiple items match the same key, keep the first one (shouldn't happen with proper constraints)
    if (!existingItemsMap.has(key)) {
      existingItemsMap.set(key, item);
    }
  });

  // Match items in memory using the lookup map
  for (const item of items) {
    const key = getSimilarityKey(item);
    const existingItem = existingItemsMap.get(key);

    if (existingItem) {
      // Calculate unit price from new item (if available) or existing item
      const newItemUnitPrice =
        item.quantity_to_dispense > 0 && item.total_price
          ? item.total_price / item.quantity_to_dispense
          : existingItem.quantity_to_dispense > 0
          ? existingItem.total_price / existingItem.quantity_to_dispense
          : 0;

      // Calculate new quantities
      const newQuantityPrescribed =
        Number(existingItem.quantity_prescribed) + Number(item.quantity_prescribed || 0);
      const newQuantityToDispense =
        Number(existingItem.quantity_to_dispense) + Number(item.quantity_to_dispense || 0);

      // Recalculate total price based on new item's unit price (per plan: use price from new item if different)
      const newTotalPrice = newItemUnitPrice * newQuantityToDispense;

      itemsToUpdate.push({
        id: existingItem.id,
        updates: {
          quantity_prescribed: newQuantityPrescribed,
          quantity_to_dispense: newQuantityToDispense,
          total_price: newTotalPrice,
        },
      });
    } else {
      // No similar item found, create new one
      itemsToCreate.push(item);
    }
  }

  return { itemsToUpdate, itemsToCreate };
};

export const bulkSyringeNeedlePrescriptions = async ({
  prescription,
  patient,
  injectionItems,
  patient_insurance_id,
  insurance,
}: {
  prescription: PrescribedDrug;
  patient: Patient;
  injectionItems: Array<any>;
  patient_insurance_id?: number;
  insurance: PatientInsurance;
}) => {
  const formattedDate = dayjs(patient.date_of_birth).format('YYYY-MM-DD');
  const age = dayjs().diff(dayjs(formattedDate), 'year');
  const route = await getOneRouteOfAdministration({ id: prescription.route_id });
  const isNHIS = EXCLUDED_INSURANCE.includes(insurance?.insurance?.name);
  const drugType = getDrugType(patient.has_insurance, insurance);

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
    const syringe = injectionItems.find(
      ({ drug }) =>
        new RegExp(`\\b${syringeName}\\b`, 'i').test(drug.name) && drug?.drug_type === drugType
    );

    const isGloves = /gloves/i.test(syringeName);
    if (syringe) {
      return {
        drug_id: syringe.drug.drug_id,
        unit_id: syringe.drug.unit_id,
        total_price: syringe.drug.price * quantity * (isNHIS && !isGloves ? 0.1 : 1),
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
