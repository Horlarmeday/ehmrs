/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { canUsePriceTariff, generateRandomNumbers } from '../../core/helpers/helper';
import { getModelById } from '../../core/helpers/general';

import {
  DosageForm,
  Drug,
  DrugPrescription,
  DrugTariff,
  Measurement,
  Patient,
  PatientInsurance,
  RoutesOfAdministration,
} from '../../database/models';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

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
export async function getDosageFormRoutes(dosage_form_id) {
  return RoutesOfAdministration.findAll({
    where: {
      dosage_form_id,
    },
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * DRUG TARIFFS
 ********************** */

/**
 * create test tariff
 *
 * @function
 * @returns {json} json object with tests data
 * @param data
 */
export const createDrugTariff = async data => {
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

export const getDrugPrice = async (patient: Patient, drug_id: number) => {
  if (canUsePriceTariff(patient)) {
    const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
    return drugPriceTariff(insurance, drug_id);
  }
  return null;
};

/** ***********************
 * PRESCRIBED DRUGS
 ********************** */
export const getLastDrugPrescription = async (patient_id: number) => {
  return DrugPrescription.findOne({ where: { patient_id }, order: [['date_prescribed', 'DESC']] });
};

export const createDrugPrescription = async (data: any) => {
  return DrugPrescription.create({ ...data });
};

export const getOnePrescription = async query => {
  return DrugPrescription.findOne({ where: { ...query } });
};
