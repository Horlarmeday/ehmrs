import sequelize, { Op, WhereOptions } from 'sequelize';
import {
  calcLimitAndOffset,
  canUsePriceTariff,
  dateIntervalQuery,
  generateRandomNumbers,
  getPrescriptionsByVisit,
  paginate,
  patientAttributes,
  staffAttributes,
  StatusCodes,
} from '../../core/helpers/helper';
import { getModelById, getPeriodQuery } from '../../core/helpers/general';

import {
  DosageForm,
  Drug,
  DrugPrescription,
  DrugTariff,
  HMO,
  Insurance,
  InventoryItem,
  InventoryItemHistory,
  Measurement,
  Patient,
  PatientInsurance,
  PrescribedAdditionalItem,
  PrescribedDrug,
  RoutesOfAdministration,
  Staff,
  Unit,
} from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import {
  DispenseStatus,
  VisitCategory,
  DrugStatus,
  HistoryType,
  DrugForm,
  Source,
} from '../../database/enums';
import { sequelizeConnection } from '../../database/config/data-source';
import { DispenseDrugType, ReturnDrugType } from './interface/prescribed-drug.type';
import {
  getAdditionalItems,
  getAdditionalItemsWithoutJoins,
  getDrugsPrescribed,
  getPrescribedDrugsWithoutJoins,
} from '../Orders/Pharmacy/pharmacy-order.repository';
import { BadException } from '../../common/util/api-error';
import { PRESCRIPTION_NOT_FOUND } from './messages/response-messages';
import { getVisitsQuery } from '../Visit/visit.repository';
import { getPrescriptionTests } from '../Orders/Laboratory/lab-order.repository';
import { getAncTriages, getAntenatalObservations } from '../Antenatal/antenatal.repository';
import { getTriages } from '../Triage/triage.repository';
import {
  getConsultationSummary,
  getPatientDiagnoses,
} from '../Consultation/consultation.repository';

type DispensedEntity = { dispense_status: DispenseStatus };

const areEntitiesFullyDispensed = (entities?: DispensedEntity[]): boolean => {
  if (!entities || entities.length === 0) {
    return true;
  }
  return entities.every(entity => entity.dispense_status === DispenseStatus.DISPENSED);
};

export const isPrescriptionFullyDispensed = (
  prescriptions?: DispensedEntity[],
  additionalItems?: DispensedEntity[]
): boolean => {
  return areEntitiesFullyDispensed(prescriptions) && areEntitiesFullyDispensed(additionalItems);
};

async function includeOneModel({ model, modelToInclude, id, includeAs }) {
  return model.findOne({
    where: { id },
    include: [{ model: modelToInclude, as: includeAs, attributes: ['name'] }],
  });
}

/** ***********************
 * GENERIC DRUGS
 ********************** */

/**
 * create a generic drug
 * @param data
 * @returns {object} generic drug data
 */
export async function createGenericDrug(data) {
  const { name, type, staff_id } = data;

  return Drug.create({
    name,
    staff_id,
    type,
    code: `D${generateRandomNumbers(6)}`,
  });
}

/**
 * update a generic drug
 * @param data
 * @returns {object} generic drug data
 */
export async function updateGenericDrug(data) {
  const { drug_id } = data;
  const drug = await getModelById(Drug, drug_id);
  return drug.update(data);
}

/**
 * search generic drugs
 *
 * @function
 * @returns {json} json object with generic drugs data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchGenericDrugs(currentPage = 1, pageLimit = 10, search) {
  return Drug.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          code: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    },
  });
}

/**
 * get generic drugs
 *
 * @function
 * @returns {json} json object with generic drugs data
 * @param currentPage
 * @param pageLimit
 */
export async function getGenericDrugs(currentPage = 1, pageLimit = 10) {
  return Drug.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get generic drugs by id
 *
 * @function
 * @returns {json} json object with generic drug data
 * @param drug_id
 */
export async function getGenericDrugById(drug_id: number): Promise<Drug> {
  return await getModelById(Drug, drug_id);
}

/** ***********************
 * DOSAGE FORMS
 ********************** */

/**
 * create a dosage form
 * @param data
 * @returns {object} dosage form data
 */
export async function createDosageForm(data) {
  const { name, staff_id } = data;

  return DosageForm.create({
    name,
    staff_id,
  });
}

/**
 * update a dosage form
 * @param data
 * @returns {object} dosage form data
 */
export async function updateDosageForm(data) {
  const { dosage_form_id } = data;
  const dosageForm = await getModelById(DosageForm, dosage_form_id);
  return dosageForm.update(data);
}

/**
 * get dosage forms
 *
 * @function
 * @returns {json} json object with dosage forms data
 */
export async function getDosageForms() {
  return DosageForm.findAll({
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * MEASUREMENTS
 ********************** */

/**
 * create a measurement - (volume or strength)
 * @param data
 * @returns {object} measurement data
 */
export async function createMeasurement(data) {
  const { name, staff_id, dosage_form_id } = data;

  const measurement = await Measurement.create({
    name,
    staff_id,
    dosage_form_id,
  });
  return includeOneModel({
    model: Measurement,
    modelToInclude: DosageForm,
    id: measurement.id,
    includeAs: 'dosage_form',
  });
}

/**
 * update a measurement
 * @param data
 * @returns {object} measurement data
 */
export async function updateMeasurement(data) {
  const { measurement_id } = data;
  const measurement = await getModelById(Measurement, measurement_id);
  return measurement.update(data);
}

/**
 * get measurements
 *
 * @function
 * @returns {json} json object with measurements data
 */
export async function getMeasurements() {
  return Measurement.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: DosageForm, as: 'dosage_form', attributes: ['name'] }],
  });
}

/**
 * get measurements in a dosage form
 *
 * @function
 * @returns {json} json object with measurements data
 */
export async function getDosageFormMeasurements(dosage_form_id) {
  return Measurement.findAll({
    where: {
      dosage_form_id,
    },
    order: [['createdAt', 'DESC']],
  });
}

/** **************************
 * ROUTES OF ADMINISTRATION
 ************************** */

/**
 * create a route of administration
 * @param data
 * @returns {object} route of administration data
 */
export async function createRouteOfAdministration(data) {
  const { name, staff_id, dosage_form_id } = data;

  const route = await RoutesOfAdministration.create({
    name,
    staff_id,
    dosage_form_id,
  });
  return includeOneModel({
    model: RoutesOfAdministration,
    modelToInclude: DosageForm,
    id: route.id,
    includeAs: 'dosage_form',
  });
}

/**
 * update a route of administration
 * @param data
 * @returns {object} route of administration data
 */
export async function updateRouteOfAdministration(data) {
  const { route_id } = data;
  const route = await getModelById(RoutesOfAdministration, route_id);
  return route.update(data);
}

/**
 * get routes of administration
 *
 * @function
 * @returns {json} json object with routes of administration data
 */
export async function getRoutesOfAdministration() {
  return RoutesOfAdministration.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: DosageForm, as: 'dosage_form', attributes: ['name'] }],
  });
}

/**
 * get routes of administration in a dosage form
 *
 * @function
 * @returns {json} json object with routes of administration data
 */
export async function getDosageFormRoutes(dosage_form_id: number) {
  return RoutesOfAdministration.findAll({
    where: {
      dosage_form_id,
    },
    order: [['createdAt', 'DESC']],
  });
}

/**
 * get one routes of administration
 *
 * @function
 * @returns {Promise<RoutesOfAdministration>} json object with routes of administration data
 */
export const getOneRouteOfAdministration = async (
  query: WhereOptions<RoutesOfAdministration>
): Promise<RoutesOfAdministration> => {
  return RoutesOfAdministration.findOne({ where: { ...query } });
};

/** ***********************
 * DRUG TARIFFS
 ********************** */

/**
 * create test tariff
 *
 * @function
 * @returns {DrugTariff[]} json object with drugs data
 * @param data
 */
export const createDrugTariff = async (
  data: readonly sequelize.Optional<any, string>[]
): Promise<DrugTariff[]> => {
  return DrugTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const drugPriceTariff = async (insurance: PatientInsurance, drug_id: number) => {
  const { price } =
    (await DrugTariff.findOne({
      where: { drug_id, hmo_id: insurance.hmo_id, insurance_id: insurance.insurance_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getDrugPrice = async (
  patient: Patient,
  drug_id: number,
  inventoryItem: InventoryItem
) => {
  if (!canUsePriceTariff(patient)) return inventoryItem?.selling_price;

  const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
  if (!insurance) return inventoryItem?.selling_price;

  return (await drugPriceTariff(insurance, drug_id)) || inventoryItem?.selling_price;
};

/** ***********************
 * PRESCRIBED DRUGS
 ********************** */
export const getLastDrugPrescription = async (patient_id: number) => {
  return DrugPrescription.findOne({ where: { patient_id }, order: [['date_prescribed', 'DESC']] });
};

export const createDrugPrescription = async (data: sequelize.Optional<any, string>) => {
  return DrugPrescription.create({ ...data });
};

export const getOnePrescription = async (query: sequelize.WhereOptions<any>) => {
  return DrugPrescription.findOne({ where: { ...query } });
};

/**
 * get prescription statistics by status
 *
 * @function
 * @returns {json} json object with prescription statistics
 * @param period
 */
export const getPrescriptionStatistics = async ({
  period = null,
}): Promise<{
  total: number;
  pending: number;
  partialDispense: number;
  completeDispense: number;
}> => {
  const baseQuery: WhereOptions<any> = {
    ...(period && getPeriodQuery(period, 'date_prescribed')),
  };

  const [total, pending, partialDispense, completeDispense] = await Promise.all([
    DrugPrescription.count({ where: baseQuery }),
    DrugPrescription.count({
      where: {
        ...baseQuery,
        status: DrugStatus.PENDING,
      },
    }),
    DrugPrescription.count({
      where: {
        ...baseQuery,
        status: DrugStatus.PARTIAL_DISPENSED,
      },
    }),
    DrugPrescription.count({
      where: {
        ...baseQuery,
        status: DrugStatus.COMPLETE_DISPENSE,
      },
    }),
  ]);

  return {
    total,
    pending,
    partialDispense,
    completeDispense,
  };
};

/**
 * get drugs prescriptions
 *
 * @function
 * @returns {json} json object with drugs prescriptions data
 * @param currentPage
 * @param pageLimit
 * @param period
 * @param search
 * @param start
 * @param end
 * @param status
 * @param source
 */
export const getDrugPrescriptions = async ({
  currentPage = 1,
  pageLimit = 10,
  period = null,
  search = null,
  start = null,
  end = null,
  status = null,
  source = null,
}): Promise<{
  total: number;
  pages: number;
  perPage: number;
  docs: DrugPrescription[];
  currentPage: number;
}> => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);

  // Build status filter - maintain backward compatibility
  let statusFilter: WhereOptions<any> = {};
  if (status) {
    // Map frontend status values to enum values
    const statusMap: Record<string, DrugStatus> = {
      Pending: DrugStatus.PENDING,
      'Partial Dispense': DrugStatus.PARTIAL_DISPENSED,
      'Complete Dispense': DrugStatus.COMPLETE_DISPENSE,
    };
    if (statusMap[status]) {
      statusFilter = { status: statusMap[status] };
    }
  } else {
    // Default behavior: show PENDING and PARTIAL_DISPENSED
    statusFilter = {
      [Op.or]: [
        { status: DrugStatus.PENDING },
        { status: DrugStatus.PARTIAL_DISPENSED },
        { status: DrugStatus.COMPLETE_DISPENSE },
      ],
    };
  }

  // Build source filter
  let sourceFilter: WhereOptions<any> = {};
  if (source) {
    // Map frontend source values to enum values
    const sourceMap: Record<string, Source> = {
      Antenatal: Source.ANC,
      Consultation: Source.CONSULTATION,
      Theater: Source.THEATER,
      Immunization: Source.IMMUNIZATION,
    };
    if (sourceMap[source]) {
      sourceFilter = { source: sourceMap[source] };
    }
  }

  const query = {
    ...statusFilter,
    ...sourceFilter,
    ...(period && getPeriodQuery(period, 'date_prescribed')),
    ...(start && end && dateIntervalQuery('date_prescribed', start, end)),
  };
  const samples = await DrugPrescription.findAll({
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('drugs.id')), 'total'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN drugs.dispense_status = '${DispenseStatus.DISPENSED}' THEN drugs.id END`
            )
          ),
          'dispensed_drugs_count',
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(items.id) FROM Additional_item_prescriptions AS items WHERE items.drug_prescription_id = DrugPrescription.id)`
          ),
          'items_count',
        ],
        [
          sequelize.literal(
            `(SELECT COUNT(items.id) FROM Additional_item_prescriptions AS items WHERE items.drug_prescription_id = DrugPrescription.id AND items.dispense_status = '${DispenseStatus.DISPENSED}')`
          ),
          'dispensed_items_count',
        ],
      ],
    },
    order: [['date_prescribed', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: PrescribedDrug,
        as: 'drugs',
        attributes: [], // Exclude all columns from the PrescribedDrug table (we only need the count)
      },
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
    group: ['DrugPrescription.id'], // Group the results by DrugPrescription.id to get the count per sample
    subQuery: false,
    limit,
    offset,
  });
  const count = await DrugPrescription.count({ where: { ...query } });
  return paginate({ rows: samples, count }, currentPage, limit);
};

/**
 * get one drug prescription
 *
 * @function
 * @returns {json} json object with drugs prescriptions data
 * @param drugPrescriptionId
 */
export const getOneDrugPrescription = async (drugPrescriptionId: number | string): Promise<any> => {
  const drugPrescription = await DrugPrescription.findOne({
    where: { id: drugPrescriptionId },
    attributes: ['status', 'visit_id', 'createdAt'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: Staff,
        attributes: staffAttributes,
        as: 'examiner',
      },
      {
        model: PrescribedDrug,
        include: [
          { model: Drug, attributes: ['name'] },
          { model: RoutesOfAdministration, attributes: ['name'] },
          { model: DosageForm, attributes: ['name'] },
          { model: Measurement, attributes: ['name'] },
          {
            model: Staff,
            attributes: staffAttributes,
            as: 'dispenser',
          },
          {
            model: Staff,
            attributes: staffAttributes,
            as: 'requester',
          },
        ],
      },
      {
        model: PrescribedAdditionalItem,
        include: [
          { model: Drug, attributes: ['name'] },
          { model: Unit, attributes: ['name'] },
          {
            model: Staff,
            attributes: staffAttributes,
            as: 'dispenser',
          },
          {
            model: Staff,
            attributes: staffAttributes,
            as: 'requester',
          },
        ],
      },
    ],
  });
  if (!drugPrescription)
    throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, PRESCRIPTION_NOT_FOUND);
  const insurance = await getPatientInsuranceQuery({
    patient_id: drugPrescription?.patient?.id,
    is_default: true,
  });
  return {
    ...drugPrescription.toJSON(),
    insurance: { ...insurance?.toJSON() },
  };
};

const getDispenseStatus = (
  quantityToDispense: number,
  prescribedDrug: PrescribedDrug | PrescribedAdditionalItem
) => {
  const quantityRemaining = prescribedDrug.quantity_to_dispense - prescribedDrug.quantity_dispensed;
  if (quantityToDispense < quantityRemaining) return DispenseStatus.PARTIAL_DISPENSED;
  return DispenseStatus.DISPENSED;
};

const getReturnStatus = (
  quantityToReturn: number,
  prescribedDrug: PrescribedDrug | PrescribedAdditionalItem
) => {
  const quantityRemaining = prescribedDrug.quantity_dispensed - prescribedDrug.quantity_returned;
  if (quantityToReturn < quantityRemaining) return DispenseStatus.PARTIAL_RETURNED;
  return DispenseStatus.RETURNED;
};

/**
 * dispense drug from inventory
 *
 * @function
 * @param inventoryItem
 * @param prescribedDrug
 * @param data
 */
export const dispenseDrug = async (
  inventoryItem: InventoryItem,
  prescribedDrug: PrescribedDrug | PrescribedAdditionalItem,
  data: DispenseDrugType
) => {
  return await sequelizeConnection.transaction(async t => {
    const { quantity_to_dispense, staff_id, drug_prescription_id } = data;
    inventoryItem.quantity_consumed += +quantity_to_dispense;
    inventoryItem.quantity_remaining -= +quantity_to_dispense;
    const item = await inventoryItem.save({ transaction: t });

    await InventoryItemHistory.create(
      {
        quantity_dispensed: quantity_to_dispense,
        quantity_remaining: item.quantity_remaining,
        inventory_item_id: inventoryItem.id,
        inventory_id: inventoryItem.inventory_id,
        unit_id: inventoryItem.unit_id,
        staff_id,
        history_date: Date.now(),
        history_type: HistoryType.DISPENSED,
        patient_id: prescribedDrug.patient_id,
        drug_prescription_id: data?.prescription_id,
        visit_id: prescribedDrug.visit_id,
        additional_item_id: data?.additional_item_id,
      },
      { transaction: t }
    );

    prescribedDrug.dispense_status = getDispenseStatus(+quantity_to_dispense, prescribedDrug);
    prescribedDrug.quantity_dispensed += +quantity_to_dispense;
    prescribedDrug.dispensed_by = data.staff_id;
    prescribedDrug.date_dispensed = new Date();
    const drug = await prescribedDrug.save({ transaction: t });

    const [prescriptions, additionalItems] = await Promise.all([
      PrescribedDrug.findAll({
        where: { drug_prescription_id },
        attributes: ['dispense_status', 'quantity_dispensed'],
        transaction: t,
      }),
      PrescribedAdditionalItem.findAll({
        where: { drug_prescription_id },
        attributes: ['dispense_status', 'quantity_dispensed'],
        transaction: t,
      }),
    ]);

    const prescriptionComplete = isPrescriptionFullyDispensed(prescriptions, additionalItems);

    await DrugPrescription.update(
      {
        status: prescriptionComplete ? DrugStatus.COMPLETE_DISPENSE : DrugStatus.PARTIAL_DISPENSED,
      },
      { where: { id: drug_prescription_id }, transaction: t }
    );
    return drug;
  });
};

/**
 * return drug back to inventory
 *
 * @function
 * @param inventoryItem
 * @param prescribedDrug
 * @param data
 */
export const returnDrugToInventory = async (
  inventoryItem: InventoryItem,
  prescribedDrug: PrescribedDrug | PrescribedAdditionalItem,
  data: ReturnDrugType
) => {
  return await sequelizeConnection.transaction(async t => {
    const { quantity_to_return, staff_id, drug_prescription_id, reason_for_return } = data;
    inventoryItem.quantity_consumed -= +quantity_to_return;
    inventoryItem.quantity_remaining += +quantity_to_return;
    const item = await inventoryItem.save({ transaction: t });

    const history = await InventoryItemHistory.create(
      {
        quantity_returned: quantity_to_return,
        quantity_remaining: +item.quantity_remaining,
        inventory_item_id: inventoryItem.id,
        inventory_id: inventoryItem.inventory_id,
        unit_id: inventoryItem.unit_id,
        staff_id,
        history_date: Date.now(),
        history_type: HistoryType.RETURNED,
        patient_id: prescribedDrug.patient_id,
        drug_prescription_id: data?.prescription_id,
        visit_id: prescribedDrug.visit_id,
        additional_item_id: data?.additional_item_id,
        reason_for_return,
      },
      { transaction: t }
    );

    prescribedDrug.dispense_status = getReturnStatus(quantity_to_return, prescribedDrug);
    prescribedDrug.quantity_returned += +quantity_to_return;
    prescribedDrug.returned_by = data.staff_id;
    prescribedDrug.reason_for_return = data.reason_for_return;
    prescribedDrug.date_returned = new Date();
    await prescribedDrug.save({ transaction: t });

    await DrugPrescription.update(
      {
        status: DrugStatus.PARTIAL_DISPENSED,
      },
      { where: { id: drug_prescription_id }, transaction: t }
    );

    return history;
  });
};

/**
 * get visit observations
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitObservations = async (visitIds: number[], categories: VisitCategory[]) => {
  const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
  const nonAncVisitIds = visitIds.filter((_, index) => categories[index] !== VisitCategory.ANC);

  const [ancObservations, consultationSummaries] = await Promise.all([
    ancVisitIds.length > 0 ? getAntenatalObservations({ visit_id: ancVisitIds }) : [],
    nonAncVisitIds.length > 0 ? getConsultationSummary({ visit_id: nonAncVisitIds }) : [],
  ]);

  return [...ancObservations, ...consultationSummaries];
};

/**
 * get visit triages
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitTriages = async (visitIds: number[], categories: VisitCategory[]) => {
  const ancVisitIds = visitIds.filter((_, index) => categories[index] === VisitCategory.ANC);
  const nonAncVisitIds = visitIds.filter((_, index) => categories[index] !== VisitCategory.ANC);

  const [ancTriages, regularTriages] = await Promise.all([
    ancVisitIds.length > 0 ? getAncTriages({ visit_id: ancVisitIds }) : [],
    nonAncVisitIds.length > 0 ? getTriages({ visit_id: nonAncVisitIds }) : [],
  ]);

  return [...ancTriages, ...regularTriages];
};

/**
 * get prescription triages
 *
 * @function
 * @param visitIds
 * @param categories
 */
export const getVisitsPrescriptions = async (visitIds: number[], categories: VisitCategory[]) => {
  const [tests, drugs, observations, triages, diagnoses, items] = await Promise.all([
    getPrescriptionTests({ visit_id: visitIds }),
    getDrugsPrescribed({ visit_id: visitIds }),
    getVisitObservations(visitIds, categories),
    getVisitTriages(visitIds, categories),
    getPatientDiagnoses({ visit_id: visitIds }),
    getAdditionalItems({ visit_id: visitIds }),
  ]);

  const data = {
    tests: getPrescriptionsByVisit(tests.map(prescription => prescription.toJSON())),
    drugs: getPrescriptionsByVisit(drugs.map(prescription => prescription.toJSON())),
    observations: getPrescriptionsByVisit(observations.map(prescription => prescription.toJSON())),
    triages: getPrescriptionsByVisit(triages.map(prescription => prescription.toJSON())),
    diagnoses: getPrescriptionsByVisit(diagnoses.map(prescription => prescription.toJSON())),
    items: getPrescriptionsByVisit(items.map(prescription => prescription.toJSON())),
  };

  return visitIds.map(id => ({
    tests: data.tests[id] || [],
    drugs: data.drugs[id] || [],
    observations: data.observations[id] || [],
    triages: data.triages[id] || [],
    diagnoses: data.diagnoses[id] || [],
    items: data.items[id] || [],
  }));
};

/**
 * get drug prescriptions history
 * @param currentPage
 * @param pageLimit
 * @param patientId
 */
export const getDrugPrescriptionsHistory = async (
  currentPage = 1,
  pageLimit = 5,
  patientId: number
): Promise<{
  total: number;
  docs: any[];
  pages: number;
  perPage: number;
  currentPage: number;
}> => {
  const { visits, limit, count } = await getVisitsQuery(
    currentPage,
    pageLimit,
    {
      patient_id: patientId,
    },
    ['id', 'date_visit_start', 'date_visit_ended', 'patient_id', 'category', 'status']
  );

  const visitJSON = visits.map(visit => visit.toJSON());
  const visitIds = visitJSON.map(visit => visit.id);
  const categories = visitJSON.map(visit => visit.category);
  const prescriptions = await getVisitsPrescriptions(visitIds, categories);

  const summary = visitJSON.map((visit, index) => ({
    ...visit,
    ...prescriptions[index],
  }));

  return paginate({ rows: summary, count }, currentPage, limit);
};

/**
 * get pending prescriptions by inventory item
 * @param inventoryItemId
 * @param currentPage
 * @param pageLimit
 */
export const getPendingPrescriptionsByInventoryItem = async ({
  inventoryItemId,
  currentPage = 1,
  pageLimit = 10,
}): Promise<{
  total: number;
  pages: number;
  perPage: number;
  docs: (PrescribedDrug | PrescribedAdditionalItem)[];
  currentPage: number;
}> => {
  // Fetch the inventory item
  const inventoryItem = await getModelById(InventoryItem, inventoryItemId);
  if (!inventoryItem) {
    throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, 'Inventory item not found');
  }

  const { drug_id, inventory_id, drug_form } = inventoryItem;

  // Build where clause for filtering
  const whereClause = {
    inventory_id,
    drug_id,
    [Op.or]: [
      { dispense_status: DispenseStatus.PENDING },
      { dispense_status: DispenseStatus.PARTIAL_DISPENSED },
    ],
  };

  // Determine which model to query based on drug_form
  if (drug_form === DrugForm.DRUG) {
    // Query PrescribedDrug
    return await PrescribedDrug.paginate({
      where: whereClause,
      page: currentPage,
      paginate: pageLimit,
      order: [['date_prescribed', 'DESC']],
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: Staff,
          as: 'requester',
          attributes: staffAttributes,
        },
        {
          model: DrugPrescription,
          attributes: ['id', 'status', 'date_prescribed'],
        },
      ],
    });
  } else {
    // Query PrescribedAdditionalItem
    return await PrescribedAdditionalItem.paginate({
      where: whereClause,
      page: currentPage,
      paginate: pageLimit,
      order: [['date_prescribed', 'DESC']],
      include: [
        {
          model: Patient,
          attributes: patientAttributes,
        },
        {
          model: Staff,
          as: 'requester',
          attributes: staffAttributes,
        },
        {
          model: Unit,
          attributes: ['id', 'name'],
        },
        {
          model: DrugPrescription,
          attributes: ['id', 'status', 'date_prescribed'],
        },
      ],
    });
  }
};
