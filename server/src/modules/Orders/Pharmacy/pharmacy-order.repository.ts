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
import { Transaction, WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { DrugForm } from '../../../database/enums';
import { getOneRouteOfAdministration } from '../../Pharmacy/pharmacy.repository';
import { PatientStatus, DefaultType } from '../../../database/enums';
import { getOneDefault } from '../../AdminSettings/admin.repository';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import { flattenArray, getDrugType, StatusCodes } from '../../../core/helpers/helper';
import { multiplyNairaByQuantity } from '../../../core/helpers/money';
import { getInventoryItemLayers } from '../../Inventory/inventory.repository';
import {
  CAPTURED_LINE_CHANGE_NOT_ALLOWED,
  ERROR_UPDATING_DRUG,
  ERROR_UPDATING_ITEM,
  INJECTION_SYRINGES_NOT_FOUND,
} from './messages/response-messages';
import { sequelizeConnection } from '../../../database/config/data-source';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';
import {
  emitChargeCapturedForRows,
  deletePrescribedLineWithReversalRequested,
  hasEmittedChargeCaptured,
} from '../../Outbox/outbox-writer';
import { sameMoney } from '../../../core/helpers/money';

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
  return sequelizeConnection.transaction(async t => {
    const drug = await PrescribedDrug.create(
      {
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
      },
      { transaction: t }
    );
    await emitChargeCapturedForRows('drug', [drug], dayjs().format('YYYY-MM-DD'), t);
    return drug;
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
      // `bulkCreateAdditionalItems` emits for every created row in this same transaction.
      await bulkCreateAdditionalItems(itemBodies, t);
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
 * The eight split columns are inbox-owned (ADR-0096). No HTTP body may write them, whatever the
 * caller sends.
 */
const SPLIT_COLUMNS = [
  'coverage_outcome',
  'split_amount',
  'patient_share',
  'patient_net',
  'insurer_amount',
  'insurer_net',
  'corporate_amount',
  'corporate_net',
] as const;

function withoutSplitColumns<T extends Record<string, any>>(data: T): Partial<T> {
  const clean: Record<string, any> = { ...data };
  for (const column of SPLIT_COLUMNS) {
    delete clean[column];
  }
  return clean as Partial<T>;
}

function quantityChanged(next: unknown, current: unknown): boolean {
  if (next === undefined || next === null) {
    return false;
  }
  return Number(next) !== Number(current);
}

/**
 * update prescribed drug
 * @param data
 */
export const updatePrescribedDrug = async (data: Partial<PrescribedDrug>) => {
  const update = withoutSplitColumns(data);

  try {
    await sequelizeConnection.transaction(async transaction => {
      const existing = await PrescribedDrug.findByPk(update.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existing && (await hasEmittedChargeCaptured('drug', update.id, transaction))) {
        const priceChanged =
          update.total_price !== undefined && !sameMoney(update.total_price, existing.total_price);
        if (
          priceChanged ||
          quantityChanged(update.quantity_prescribed, existing.quantity_prescribed) ||
          quantityChanged(update.quantity_to_dispense, existing.quantity_to_dispense)
        ) {
          throw new BadException(
            'Error',
            StatusCodes.BAD_REQUEST,
            CAPTURED_LINE_CHANGE_NOT_ALLOWED
          );
        }
      }

      await PrescribedDrug.update({ ...update }, { where: { id: update.id }, transaction });
    });
  } catch (e) {
    if (e instanceof BadException) {
      throw e;
    }
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
  return sequelizeConnection.transaction(async t => {
    const item = await PrescribedAdditionalItem.create(
      {
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
      },
      { transaction: t }
    );
    await emitChargeCapturedForRows('additional_item', [item], dayjs().format('YYYY-MM-DD'), t);
    return item;
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

  const createAll = async (t: Transaction): Promise<PrescribedAdditionalItem[]> => {
    // NO consolidation. A captured line's amount/quantity must never change silently, so every
    // extra quantity is a NEW line with its own `charge.captured`. This is what makes prescribing
    // an injection twice produce two consumable lines rather than one merged line.
    const created = await PrescribedAdditionalItem.bulkCreate(data as never, { transaction: t });
    await emitChargeCapturedForRows('additional_item', created, dayjs().format('YYYY-MM-DD'), t);
    return created;
  };

  // Callers that already own a transaction get the same atomicity; callers that do not (the
  // admission/dialysis paths) get one here, so the lines and their events never diverge.
  return transaction ? createAll(transaction) : sequelizeConnection.transaction(createAll);
};

/**
 * update additional items
 * @param data
 */
export const updateAdditionalItem = async (data: Partial<PrescribedAdditionalItem>) => {
  const update = withoutSplitColumns(data);

  try {
    await sequelizeConnection.transaction(async transaction => {
      const existing = await PrescribedAdditionalItem.findByPk(update.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existing && (await hasEmittedChargeCaptured('additional_item', update.id, transaction))) {
        const priceChanged =
          update.total_price !== undefined && !sameMoney(update.total_price, existing.total_price);
        if (
          priceChanged ||
          quantityChanged(update.quantity_prescribed, existing.quantity_prescribed) ||
          quantityChanged(update.quantity_to_dispense, existing.quantity_to_dispense)
        ) {
          throw new BadException(
            'Error',
            StatusCodes.BAD_REQUEST,
            CAPTURED_LINE_CHANGE_NOT_ALLOWED
          );
        }
      }

      await PrescribedAdditionalItem.update(
        { ...update },
        { where: { id: update.id }, transaction }
      );
    });
  } catch (e) {
    if (e instanceof BadException) {
      throw e;
    }
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
    nhis_status: prescription.drug_type === 'NHIS' ? 'Pending' : null,
    date_prescribed: Date.now(),
  };

  const selectSyringe = async (syringeName: string) => {
    const syringe = injectionItems.find(
      ({ drug }) =>
        new RegExp(`\\b${syringeName}\\b`, 'i').test(drug.name) && drug?.drug_type === drugType
    );

    if (!syringe) {
      return null;
    }

    // Price from the CURRENT store row, not the default-config snapshot. The default is only a
    // fallback for a consumable that has no dispensary layer yet.
    const layers = await getInventoryItemLayers(prescription.inventory_id, syringe.drug.drug_id);
    const unitPrice = layers[0]?.selling_price ?? syringe.drug.price;

    return {
      drug_id: syringe.drug.drug_id,
      unit_id: syringe.drug.unit_id,
      total_price: multiplyNairaByQuantity(
        unitPrice,
        quantity,
        `consumable ${syringe.drug.drug_id} total_price`
      ),
    };
  };

  const syringeData =
    prescriptionStrength <= 2
      ? await selectSyringe('2 mls')
      : prescriptionStrength <= 5
      ? await selectSyringe('5 mls')
      : await selectSyringe('10 mls');

  if (syringeData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...syringeData,
    });
  }

  const needleData =
    route.name === 'Intramuscular'
      ? age <= 15
        ? await selectSyringe('extraneedle 23G')
        : await selectSyringe('extraneedle 21G')
      : route.name === 'Intravenous' && patient.patient_status === PatientStatus.OUTPATIENT
      ? age <= 15
        ? await selectSyringe('scalp vein 23G')
        : await selectSyringe('scalp vein 21G')
      : null;

  if (needleData) {
    additionalItems.push({
      ...prescribeAdditionalItemData,
      ...needleData,
    });
  }

  const gloveData =
    patient.patient_status === PatientStatus.OUTPATIENT
      ? await selectSyringe('examination gloves/pair')
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
    ? await selectSyringe('water for injection')
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
  return deletePrescribedLineWithReversalRequested(
    'drug',
    drugId,
    transaction => PrescribedDrug.findOne({ where: { id: drugId }, transaction }),
    transaction => PrescribedDrug.destroy({ where: { id: drugId }, transaction })
  );
};

/**
 * delete prescribed additional item
 * @param itemId
 */
export const deleteAdditionalItem = async (itemId: number) => {
  return deletePrescribedLineWithReversalRequested(
    'additional_item',
    itemId,
    transaction => PrescribedAdditionalItem.findOne({ where: { id: itemId }, transaction }),
    transaction => PrescribedAdditionalItem.destroy({ where: { id: itemId }, transaction })
  );
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
