/* eslint-disable camelcase */
import { PrescribedTest, TestSample } from '../../../database/models';
import sequelize from 'sequelize';

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

export const updatePrescribedTest = (
  query: sequelize.WhereOptions<any>,
  fieldsToUpdate: { [x: string]: string }
) => {
  return PrescribedTest.update({ ...fieldsToUpdate }, { where: { ...query } });
};
