/* eslint-disable camelcase */
import { PrescribedTest, Staff, Test } from '../../../database/models';
import sequelize from 'sequelize';
import { staffAttributes } from '../../Antenatal/antenatal.repository';

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, requester, price, patient_id, visit_id, ante_natal_id } = data;

  return PrescribedTest.create({
    test_id,
    requester,
    price,
    patient_id,
    date_requested: Date.now(),
    visit_id,
    ante_natal_id,
  });
}

/**
 * prescribe multiple tests for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function orderBulkTest(data) {
  const tests = await PrescribedTest.bulkCreate(data);
  const testIds = tests.map(({ id }) => id);
  return getPrescriptionTests({ id: testIds });
}

export const updatePrescribedTest = (
  query: sequelize.WhereOptions<PrescribedTest>,
  fieldsToUpdate: { [x: string]: string }
) => {
  return PrescribedTest.update({ ...fieldsToUpdate }, { where: { ...query } });
};

/**
 * get prescribed tests
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export const getPrescribedTests = ({ currentPage = 1, pageLimit = 10, filter = null }) => {
  return PrescribedTest.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['date_requested', 'DESC']],
    where: {
      ...(filter && { ...JSON.parse(filter) }),
    },
    include: [
      {
        model: Test,
        attributes: ['name'],
      },
      {
        model: Staff,
        as: 'examiner',
        attributes: staffAttributes,
      },
    ],
  });
};

export const getPrescriptionTests = async (query: sequelize.WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findAll({
    where: { ...query },
    include: [
      { model: Test, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};
