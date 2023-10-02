/* eslint-disable camelcase */
import { PrescribedTest, Staff, Test } from '../../../database/models';
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
  query: sequelize.WhereOptions<PrescribedTest>,
  fieldsToUpdate: { [x: string]: string }
) => {
  return PrescribedTest.update({ ...fieldsToUpdate }, { where: { ...query } });
};

export const getPrescriptionTests = async (query: sequelize.WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findAll({
    where: { ...query },
    include: [
      { model: Test, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: ['firstname', 'lastname', 'fullname'] },
    ],
  });
};
