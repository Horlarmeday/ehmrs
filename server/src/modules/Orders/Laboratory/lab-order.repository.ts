/* eslint-disable camelcase */
const { PrescribedTest } = require('../../../database/models');

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, test_type, requester, price, patient_id, visit_id } = data;

  return PrescribedTest.create({
    test_id: test_id,
    test_type,
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
