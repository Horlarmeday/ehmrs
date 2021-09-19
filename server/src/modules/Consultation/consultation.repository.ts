/* eslint-disable camelcase */
import { BadException } from '../../common/util/api-error';
import {StatusCodes} from "../../core/helpers/helper";

const { History, Complaint, Diagnosis } = require('../../database/models');

/**
 * create a patient complaint
 * @param data
 * @returns {object} complaint data
 */
export async function createComplaint(data) {
  const { patient_id, complaint, frequency, frequency_number, notes, visit_id, staff_id } = data;

  return Complaint.create({
    patient_id,
    complaint,
    frequency,
    frequency_number,
    notes,
    visit_id,
    staff_id,
  });
}

/**
 * create a patient history
 * @param data
 * @returns {object} patient history data
 */
export async function createObservation(data) {
  const {
    complaint_note,
    history_note,
    examination_note,
    has_smoking_history,
    visit_id,
    staff_id,
    patient_id,
  } = data;

  return History.create({
    complaint_note,
    history_note,
    examination_note,
    has_smoking_history,
    visit_id,
    staff_id,
    patient_id,
  });
}

/**
 * create a patient diagnosis
 * @param data
 * @returns {object} diagnosis data
 */
export async function createDiagnosis(data) {
  return Diagnosis.bulkCreate(data);
}

/**
 * get a model by visit id
 * @param model
 * @param data
 * @returns {array} of model data
 */
export async function getModelByVisitId(model, data) {
  return model.findAll({ where: { visit_id: data } });
}

/**
 * get consultation/visit summary
 * @param data
 * @returns {object} consultation summary data
 */
export async function getConsultationSummary(data) {
  const diagnosis = getModelByVisitId(Diagnosis, data);
  const complaint = getModelByVisitId(Complaint, data);
  const history = getModelByVisitId(History, data);

  try {
    const [diagnoses, complaints, histories] = await Promise.all([diagnosis, complaint, history]);
    return {
      diagnoses,
      complaints,
      histories,
    };
  } catch (e) {
    throw new BadException('ERROR', StatusCodes.SERVER_ERROR, e);
  }
}
