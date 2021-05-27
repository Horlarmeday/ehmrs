/* eslint-disable camelcase */
const { PrescribeTest } = require('../../../database/models');

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, test_type, requester, price, patient_id, visit_id } = data;

  return PrescribeTest.create({
    test_id: test_type === 'Cash' ? test_id : null,
    nhis_test_id: test_type === 'NHIS' ? test_id : null,
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
export async function prescribeMultipleTest(data) {
  return PrescribeTest.bulkCreate(data);
}
