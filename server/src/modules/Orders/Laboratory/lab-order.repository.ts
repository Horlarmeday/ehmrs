/* eslint-disable camelcase */
import { PrescribedDrug, PrescribedTest, Staff, Test } from '../../../database/models';
import sequelize, { WhereOptions } from 'sequelize';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { ERROR_UPDATING_DRUG } from '../Pharmacy/messages/response-messages';
import { getOnePrescribedDrug } from '../Pharmacy/pharmacy-order.repository';
import { ERROR_UPDATING_TEST } from './messages/response-messages';

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

export const updatePrescribedTest = async (data: Partial<PrescribedTest>) => {
  try {
    await PrescribedTest.update({ ...data }, { where: { id: data.id } });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_TEST);
  }
  return getOnePrescribedTest({ id: data.id });
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
      ...(filter && JSON.parse(filter)),
    },
    include: [
      {
        model: Test,
        attributes: ['name', 'type'],
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

export const getOnePrescribedTest = async (query: WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findOne({
    where: { ...query },
    include: [
      { model: Test, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
    ],
  });
};
