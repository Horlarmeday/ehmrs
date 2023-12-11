/* eslint-disable camelcase */
import { getModelByVisitId } from '../Consultation/consultation.repository';
import { Triage } from '../../database/models';
import { WhereOptions } from 'sequelize';

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

/**
 * get all triage done in a visit
 *
 * @function
 * @returns {Promise<Triage[]>} json object with triage data
 * @param query
 */
export const getTriages = async (query: WhereOptions<Triage>): Promise<Triage[]> => {
  return Triage.findAll({ where: { ...query } });
};
