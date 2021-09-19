/* eslint-disable camelcase */
import {PrescribedDrugBody} from "./interface/prescribed-drug.body";

const { PrescribedDrug } = require('../../../database/models');

/**
 * prescribe a drug for patient
 * @param data
 * @returns {object} prescribed drug data
 */
export async function prescribeDrug(data: PrescribedDrugBody) {
  const {
    drug_id,
    drug_type,
    quantity,
    quantity_to_dispense,
    route,
    dosage_form,
    prescribed_strength,
    strength,
    frequency,
    duration,
    duration_unit,
    notes,
    total_price,
    examiner,
    capitated_price,
    patient_id,
    visit_id,
    start_date,
  } = data;
  return PrescribedDrug.create({
    drug_id,
    drug_type,
    quantity,
    quantity_to_dispense,
    route,
    dosage_form,
    prescribed_strength,
    strength,
    frequency,
    duration,
    duration_unit,
    notes,
    total_price,
    examiner,
    capitated_price,
    patient_id,
    visit_id,
    start_date,
    date_prescribed: Date.now(),
  });
}
