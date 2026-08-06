/* eslint-disable camelcase */
import { PrescribedTest, Staff, Test, TestResult } from '../../../database/models';
import sequelize, { WhereOptions } from 'sequelize';
import dayjs from 'dayjs';
import { staffAttributes } from '../../Antenatal/antenatal.repository';
import { BadException } from '../../../common/util/api-error';
import { StatusCodes } from '../../../core/helpers/helper';
import { ERROR_UPDATING_TEST } from './messages/response-messages';
import { sequelizeConnection } from '../../../database/config/data-source';
import {
  emitChargeCapturedForRows,
  deletePrescribedLineWithReversalRequested,
} from '../../Outbox/outbox-writer';

/**
 * prescribe a test for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function prescribeTest(data) {
  const { test_id, requester, price, patient_id, visit_id, ante_natal_id } = data;

  return sequelizeConnection.transaction(async t => {
    const test = await PrescribedTest.create(
      {
        test_id,
        requester,
        price,
        patient_id,
        date_requested: Date.now(),
        visit_id,
        ante_natal_id,
      },
      { transaction: t }
    );
    await emitChargeCapturedForRows('test', [test], dayjs().format('YYYY-MM-DD'), t);
    return test;
  });
}

/**
 * prescribe multiple tests for patient
 * @param data
 * @returns {object} prescribed test data
 */
export async function orderBulkTest(data) {
  // A1.2b: this write had NO transaction, so the lines and their outbox events could not commit
  // atomically. Wrapping it also makes the bulkCreate itself atomic — a partial failure no longer
  // leaves half a prescription behind. No-op emission unless EMR_OUTBOX_ENABLED.
  const tests = await sequelizeConnection.transaction(async t => {
    const created = await PrescribedTest.bulkCreate(data, { transaction: t });
    await emitChargeCapturedForRows('test', created, dayjs().format('YYYY-MM-DD'), t);
    return created;
  });
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
      {
        model: Staff,
        as: 'nhis_test_processor',
        attributes: staffAttributes,
      },
    ],
  });
};

export const getPrescriptionTests = async (query: sequelize.WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findAll({
    where: { ...query },
    order: [['createdAt', 'DESC']],
    include: [
      { model: Test, attributes: ['name'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: TestResult, as: 'result', attributes: ['result', 'status'] },
    ],
  });
};

export const getOnePrescribedTest = async (query: WhereOptions<PrescribedTest>) => {
  return PrescribedTest.findOne({
    where: { ...query },
    include: [
      { model: Test, attributes: ['name', 'type'] },
      { model: Staff, as: 'examiner', attributes: staffAttributes },
      { model: Staff, as: 'nhis_test_processor', attributes: staffAttributes },
    ],
  });
};

/**
 * delete prescribed test
 * @param testId
 */
export const deletePrescribedTest = async (testId: number) => {
  return deletePrescribedLineWithReversalRequested(
    'test',
    testId,
    transaction => PrescribedTest.findOne({ where: { id: testId }, transaction }),
    transaction => PrescribedTest.destroy({ where: { id: testId }, transaction })
  );
};
