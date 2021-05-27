/* eslint-disable camelcase */
import { getModelByVisitId } from '../Consultation/consultation.repository';

const { Triage } = require('../../database/models');

/**
 * create a patient vital signs
 * @param data
 * @returns {object} vital signs data
 */
export async function createTriage(data) {
  const {
    rvs,
    weight,
    height,
    bmi,
    pulse,
    respiration,
    temperature,
    staff_id,
    patient_id,
    systolic,
    diastolic,
    heart_rate,
    fetal_heart_rate,
    spo2,
    muac,
    visit_id,
  } = data;

  return Triage.create({
    patient_id,
    rvs,
    weight,
    height,
    bmi,
    pulse,
    respiration,
    temperature,
    systolic,
    diastolic,
    heart_rate,
    fetal_heart_rate,
    muac,
    spo2,
    staff_id,
    visit_id,
  });
}

/**
 * get all triage done in a visit
 *
 * @function
 * @returns {json} json object with triage data
 * @param data
 */
export async function getTriageInAVisit(data) {
  return getModelByVisitId(Triage, data);
}
