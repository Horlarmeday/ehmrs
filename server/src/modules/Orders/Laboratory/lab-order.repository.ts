/* eslint-disable camelcase */
import { PrescribedTest } from '../../../database/models';

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, requester, price, patient_id, visit_id } = data;

  return PrescribedTest.create({
    test_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
  });
}

/**
 * prescribe multiple tests for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function orderBulkTest(data) {
  return PrescribedTest.bulkCreate(data);
}
