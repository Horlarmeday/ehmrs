import sequelize, { Op, where, WhereOptions } from 'sequelize';
import {
  countRecords,
  getModelById,
  getNumberOfRecords,
  getPeriodQuery,
} from '../../core/helpers/general';

import {
  Insurance,
  Patient,
  PatientInsurance,
  PrescribedTest,
  Sample,
  Staff,
  Test,
  TestPrescription,
  TestResult,
  TestTariff,
} from '../../database/models';
import {
  calcLimitAndOffset,
  canUsePriceTariff,
  dateIntervalQuery,
  paginate,
  patientAttributes,
  staffAttributes,
  StatusCodes,
} from '../../core/helpers/helper';
import { chain } from 'lodash';
import { PrescriptionType, TestStatus } from '../../database/models/prescribedTest';
import sequelizeConnection from '../../database/config/config';
import { ResultStatus } from '../../database/models/testResult';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';
import { BadException } from '../../common/util/api-error';
import { CANNOT_ADD_RESULTS, RESULT_NOT_FOUND, TEST_NOT_FOUND } from './messages/response-messages';
import { Result } from './dto/laboratory-result.dto';
import { PaymentStatus } from '../../database/models/prescribedDrug';
import { Test as TestType } from '../Orders/Laboratory/interface/prescribed-test.body';
import { ERROR_UPDATING_TEST } from '../Orders/Laboratory/messages/response-messages';
import { getOnePrescribedTest } from '../Orders/Laboratory/lab-order.repository';

const testResultFieldsToUpdate = (fields: string[] = []) => [
  'prescribed_test_id',
  'result',
  'is_abnormal',
  'comments',
  'status',
  'updatedAt',
  ...fields,
];

/** ***********************
 * TEST SAMPLE
 ********************** */

/**
 * create a test sample
 * @param data
 * @returns {object} test sample data
 */
export async function createTestSample(data) {
  const { name, staff_id } = data;

  return Sample.create({
    name,
    staff_id,
  });
}

/**
 * update a test sample
 * @param data
 * @returns {object} test sample data
 */
export async function updateTestSample(data) {
  const { sample_id } = data;
  const sample = await getModelById(Sample, sample_id);
  return sample.update(data);
}

/**
 * search test sample type
 *
 * @function
 * @returns {json} json object with test sample data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchTestSamples(currentPage = 1, pageLimit = 10, search) {
  return Sample.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * get test samples
 *
 * @function
 * @returns {json} json object with test samples data
 * @param currentPage
 * @param pageLimit
 */
export async function getTestSamples(currentPage = 1, pageLimit = 10) {
  return Sample.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}

/** ***********************
 * TESTS
 ********************** */

/**
 * create a test
 * @param data
 * @returns {object} test data
 */
export async function createTest(data) {
  const {
    name,
    price,
    sample_id,
    staff_id,
    result_unit,
    valid_range,
    nhis_price,
    phis_price,
    retainership_price,
    result_form,
  } = data;
  const count = await getNumberOfRecords(Test);

  return Test.create({
    name,
    staff_id,
    price,
    sample_id,
    result_unit,
    valid_range,
    code: `D${count + 1}`,
    result_form,
    nhis_price: nhis_price || null,
    phis_price: phis_price || null,
    retainership_price: retainership_price || null,
    is_available_for_nhis: !!nhis_price,
    is_available_for_phis: !!phis_price,
  });
}

/**
 * update a test
 * @param data
 * @returns {object} test data
 */
export async function updateTest(data) {
  const { test_id } = data;
  const test = await getModelById(Test, test_id);
  return test.update(data);
}

/**
 * get tests
 *
 * @function
 * @returns {json} json object with tests data
 * @param currentPage
 * @param pageLimit
 * @param filter
 * @param search
 */
export async function getTests({ currentPage = 1, pageLimit = 20, filter = null, search = null }) {
  return Test.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    order: [['name', 'ASC']],
    where: {
      ...(filter && JSON.parse(filter)),
      ...(search && {
        name: {
          [Op.like]: `%${search}%`,
        },
      }),
    },
  });
}

/** ***********************
 * TEST TARIFFS
 ********************** */

/**
 * create test tariff
 *
 * @function
 * @returns {json} json object with tests data
 * @param data
 */
export const createTestTariff = async data => {
  return TestTariff.bulkCreate(data, { updateOnDuplicate: ['price'] });
};

const testPriceTariff = async (insurance: PatientInsurance, test_id: number) => {
  const { price } =
    (await TestTariff.findOne({
      where: { test_id, hmo_id: insurance.hmo_id, insurance_id: insurance.insurance_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getTestPrice = async (patient: Patient, test: TestType) => {
  if (!canUsePriceTariff(patient)) return test.price;
  if (test.test_type === PrescriptionType.CASH) return test.price;

  const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
  if (!insurance) return test.price;

  const price = await testPriceTariff(insurance, test.test_id);
  if (price) return price;

  const foundTest = await Test.findByPk(test.test_id);
  const insurancePrices = {
    NHIS: foundTest?.nhis_price,
    PHIS: foundTest?.phis_price,
    Retainership: foundTest?.retainership_price,
    FHSS: foundTest?.nhis_price,
  };
  return insurancePrices[insurance.insurance.name] || null;
};

/** ***********************
 * LABORATORY RESULTS
 ********************** */

/**
 * get all samples to collect
 *
 * @function
 * @returns {Promise<TestPrescription[]>} json object with test samples data
 * @param currentPage
 * @param pageLimit
 * @param period
 * @param search
 * @param start
 * @param end
 */
export const getSamplesToCollect = async ({
  currentPage = 1,
  pageLimit = 10,
  period = null,
  search = null,
  start = null,
  end = null,
}): Promise<{
  total: any;
  pages: number;
  perPage: number;
  docs: TestPrescription[];
  currentPage: number;
}> => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    status: TestStatus.PENDING,
    ...(period && getPeriodQuery(period, 'date_requested')),
    ...(start && end && dateIntervalQuery('date_requested', start, end)),
  };
  const samples = await TestPrescription.findAll({
    attributes: {
      include: [
        // Count the number of tests in each sample and alias it as 'test_count'
        [sequelize.fn('COUNT', sequelize.col('tests.id')), 'test_count'],
        // [
        //   sequelize.fn(
        //     'COUNT',
        //     sequelize.literal(
        //       `DISTINCT CASE WHEN tests.payment_status = '${PaymentStatus.PENDING}' THEN tests.id END`
        //     )
        //   ),
        //   'total_pending_payments',
        // ],
      ],
    },
    where: {
      ...query,
    },
    order: [['date_requested', 'DESC']],
    include: [
      {
        model: PrescribedTest,
        as: 'tests',
        attributes: [], // Exclude all columns from the PrescribedTest table (we only need the count)
      },
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                complete_name: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
    ],
    group: ['TestPrescription.id'], // Group the results by testPrescription.id to get the count per sample
    subQuery: false,
    limit,
    offset,
  });
  const count = await TestPrescription.count({ where: { ...query } });
  return paginate({ rows: samples, count }, currentPage, limit);
};

/**
 * get all collected samples
 *
 * @function
 * @returns json object with test samples data
 * @param currentPage
 * @param pageLimit
 * @param period
 * @param search
 * @param start
 * @param end
 */
export const getCollectedSamples = async ({
  currentPage = 1,
  pageLimit = 10,
  period = null,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    status: TestStatus.SAMPLE_COLLECTED,
    ...(period && getPeriodQuery(period, 'date_sample_received')),
    ...(start && end && dateIntervalQuery('date_sample_received', start, end)),
  };
  const samples = await TestPrescription.findAll({
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('tests.id')), 'total'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN tests.status = '${TestStatus.PENDING}' THEN tests.id END`
            )
          ),
          'pending_tests_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN tests.status = '${TestStatus.VERIFIED}' THEN tests.id END`
            )
          ),
          'verified_tests_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN tests.status = '${TestStatus.RESULT_ADDED}' THEN tests.id END`
            )
          ),
          'pending_validations_count',
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN tests.payment_status = '${PaymentStatus.PENDING}' THEN tests.id END`
            )
          ),
          'total_pending_payments',
        ],
      ],
    },
    order: [['date_sample_received', 'DESC']],
    where: {
      ...query,
    },
    include: [
      {
        model: PrescribedTest,
        as: 'tests',
        attributes: [], // Exclude all columns from the PrescribedTest table (we only need the count)
      },
      {
        model: Patient,
        attributes: patientAttributes,
        where: {
          ...(search && {
            [Op.or]: [
              {
                firstname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                lastname: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                hospital_id: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                complete_name: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }),
        },
        include: [
          {
            model: PatientInsurance,
            where: { is_default: true },
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'insurance_id'],
            include: [{ model: Insurance, attributes: ['name'] }],
          },
        ],
      },
    ],
    group: ['TestPrescription.id'], // Group the results by testPrescription.id to get the count per sample
    subQuery: false,
    limit,
    offset,
  });
  const count = await TestPrescription.count({ where: { ...query } });
  return paginate({ rows: samples, count }, currentPage, limit);
};

export const getLastTestPrescription = async (patient_id: number) => {
  return TestPrescription.findOne({ where: { patient_id }, order: [['date_requested', 'DESC']] });
};

export const createTestPrescription = async (data: any) => {
  return TestPrescription.create({ ...data });
};

export const getTestPrescription = async (query: WhereOptions<TestPrescription>) => {
  return TestPrescription.findOne({ where: { ...query } });
};

export const getOneTestPrescription = async (query: WhereOptions<TestPrescription>) => {
  return TestPrescription.findOne({
    where: { ...query },
    include: [
      {
        model: PrescribedTest,
        attributes: ['test_id', 'status', 'payment_status', 'id'],
        include: [{ model: Test, attributes: ['name', 'result_unit'] }],
      },
    ],
  });
};

export const getOneSampleToCollect = async (testPrescriptionId: number | string) => {
  const testPrescription = await TestPrescription.findOne({
    where: { id: testPrescriptionId, status: TestStatus.PENDING },
    attributes: [],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: PrescribedTest,
        attributes: ['test_id', 'payment_status'],
        include: [
          { model: Test, attributes: ['name', 'result_unit'] },
          { model: Sample, attributes: ['name'] },
        ],
      },
    ],
  });
  if (!testPrescription) throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, TEST_NOT_FOUND);
  const insurance = await getPatientInsuranceQuery({
    patient_id: testPrescription?.patient?.id,
    is_default: true,
  });
  return {
    ...testPrescription.toJSON(),
    tests: groupTestsBySample(testPrescription.tests),
    insurance: { ...insurance?.toJSON() },
  };
};

export const getOneCollectedSample = async (testPrescriptionId: number | string) => {
  const testPrescription = await TestPrescription.findOne({
    where: { id: testPrescriptionId, status: TestStatus.SAMPLE_COLLECTED },
    attributes: ['accession_number', 'result_notes', 'visit_id'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: PrescribedTest,
        attributes: ['test_id', 'id', 'status', 'test_type', 'payment_status', 'is_urgent'],
        include: [
          { model: Test, attributes: ['name', 'result_unit', 'valid_range', 'result_form'] },
          { model: Sample, attributes: ['name'] },
          {
            model: TestResult,
            attributes: [
              'result',
              'is_abnormal',
              'comments',
              'institute_referred',
              'referral_reason',
              'status',
            ],
          },
        ],
      },
    ],
  });
  if (!testPrescription) throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, TEST_NOT_FOUND);
  const insurance = await getPatientInsuranceQuery({
    patient_id: testPrescription?.patient?.id,
    is_default: true,
  });
  return {
    ...testPrescription?.toJSON(),
    tests: testPrescription.tests,
    insurance: { ...insurance?.toJSON() },
  };
};

export const updateTestPrescription = (
  query: sequelize.WhereOptions<any>,
  fieldsToUpdate: { [x: string]: any }
) => {
  return TestPrescription.update({ ...fieldsToUpdate }, { where: { ...query } });
};

export const validateTestResults = async (
  data: Partial<Result & { staff_id: number; date_created: number }>[],
  result_notes: string
) => {
  return sequelizeConnection.transaction(async t => {
    // append results
    const result = await TestResult.bulkCreate(data, {
      updateOnDuplicate: testResultFieldsToUpdate(),
      transaction: t,
    });

    await Promise.all(
      data.map(async test =>
        PrescribedTest.update(
          { ...statusToUpdate(test) },
          { where: { id: test.prescribed_test_id }, transaction: t }
        )
      )
    );
    if (result_notes) {
      await TestPrescription.update(
        { result_notes },
        { where: { id: data[0].test_prescription_id }, transaction: t }
      );
    }

    return result;
  });
};

export const approveTestResults = async (data: Partial<Result & { staff_id: number }>[]) => {
  return sequelizeConnection.transaction(async t => {
    const result = await Promise.all(
      data.map(async test => {
        if (test.test_status) {
          return PrescribedTest.update(
            {
              status: TestStatus.APPROVED,
              test_approved_date: Date.now(),
              test_approved_by: test.staff_id,
            },
            { where: { id: test.prescribed_test_id }, transaction: t }
          );
        }
      })
    );
    const testsCount = await PrescribedTest.count({
      where: {
        test_prescription_id: data[0].test_prescription_id,
        status: TestStatus.APPROVED,
      },
      transaction: t,
    });
    const testPrescriptionCount = await TestPrescription.count({
      where: { id: data[0].test_prescription_id },
      include: [PrescribedTest],
      transaction: t,
    });
    if (testsCount === testPrescriptionCount) {
      await TestPrescription.update(
        { status: TestStatus.COMPLETED },
        { where: { id: data[0].test_prescription_id }, transaction: t }
      );
    }
    return result;
  });
};

export const appendTestResults = async (data: any[]) => {
  return sequelizeConnection.transaction(async t => {
    const testResults = await Promise.all(
      data.map(result => TestResult.upsert(result, { transaction: t }))
    );

    const testIds = data.map(({ prescribed_test_id }) => prescribed_test_id) as number[];
    const results = await TestResult.findAll({
      where: { prescribed_test_id: testIds },
      transaction: t,
    });

    if (!results?.length)
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_ADD_RESULTS);

    await Promise.all(
      data.map(async test =>
        PrescribedTest.update(
          {
            status: test.testStatus,
            result_id: results?.find(
              ({ prescribed_test_id }) => prescribed_test_id === test.prescribed_test_id
            )?.id,
          },
          { where: { id: test.prescribed_test_id }, transaction: t }
        )
      )
    );
    return testResults;
  });
};

export const getTestResults = async ({
  currentPage = 1,
  pageLimit = 10,
  start = null,
  end = null,
  search = null,
}) => {
  return TestPrescription.paginate({
    page: +currentPage,
    paginate: +pageLimit,
    attributes: [
      'id',
      'accession_number',
      'source',
      'date_sample_received',
      'patient_id',
      'createdAt',
      'status',
    ],
    order: [['date_sample_received', 'DESC']],
    where: {
      ...(search && {
        [Op.or]: [
          {
            accession_number: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.firstname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.lastname$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.hospital_id$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$patient.complete_name$': {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(start && end && dateIntervalQuery('date_sample_received', start, end)),
    },
    include: [
      {
        model: PrescribedTest,
        as: 'tests',
        where: {
          status: TestStatus.APPROVED,
        },
        required: true,
        attributes: [],
      },
      {
        model: Patient,
        as: 'patient',
        attributes: patientAttributes,
        required: true,
      },
    ],
  });
};

export const getOneTestResult = async (testPrescriptionId: number) => {
  const testPrescription = await TestPrescription.findOne({
    where: { id: testPrescriptionId },
    attributes: ['result_notes', 'accession_number', 'date_requested'],
    include: [
      {
        model: Patient,
        attributes: patientAttributes,
      },
      {
        model: PrescribedTest,
        attributes: ['test_id', 'id', 'status', 'test_approved_date', 'test_verified_date'],
        include: [
          { model: Test, attributes: ['name', 'result_unit', 'valid_range', 'result_form'] },
          { model: Sample, attributes: ['name'] },
          {
            model: TestResult,
            attributes: ['result', 'is_abnormal', 'comments', 'status'],
          },
          {
            model: Staff,
            as: 'test_verifier',
            attributes: staffAttributes,
          },
          {
            model: Staff,
            as: 'test_approver',
            attributes: staffAttributes,
          },
        ],
        where: {
          status: TestStatus.APPROVED,
        },
        required: true,
      },
    ],
  });
  if (!testPrescription)
    throw new BadException('NOT_FOUND', StatusCodes.NOT_FOUND, RESULT_NOT_FOUND);

  const insurance = await getPatientInsuranceQuery({
    patient_id: testPrescription?.patient?.id,
    is_default: true,
  });

  return {
    ...testPrescription.toJSON(),
    insurance: { ...insurance?.toJSON() },
  };
};

export const getVerifiedTestResults = async ({
  currentPage = 1,
  pageLimit = 10,
  period,
  search = null,
  start = null,
  end = null,
}) => {
  const { limit, offset } = calcLimitAndOffset(+currentPage, +pageLimit);
  const query = {
    status: TestStatus.SAMPLE_COLLECTED,
    ...(period && getPeriodQuery(period, 'date_sample_received')),
    ...(search && {
      [Op.or]: [
        {
          accession_number: {
            [Op.eq]: search,
          },
        },
        {
          '$patient.firstname$': {
            [Op.like]: `%${search}%`,
          },
        },
        {
          '$patient.lastname$': {
            [Op.like]: `%${search}%`,
          },
        },
        {
          '$patient.hospital_id$': {
            [Op.like]: `%${search}%`,
          },
        },
        {
          '$patient.complete_name$': {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    }),
    ...(start && end && dateIntervalQuery('date_sample_received', start, end)),
  };
  const samples = await TestPrescription.findAll({
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('tests.id')), 'total'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              `DISTINCT CASE WHEN tests.status = '${TestStatus.VERIFIED}' THEN tests.id END`
            )
          ),
          'verified_tests_count',
        ],
      ],
    },
    order: [['date_sample_received', 'DESC']],
    where: { ...query },
    include: [
      {
        model: PrescribedTest,
        as: 'tests',
        attributes: [],
        where: {
          status: TestStatus.VERIFIED,
        },
        required: true,
      },
      {
        model: Patient,
        attributes: patientAttributes,
        required: true,
      },
    ],
    group: ['TestPrescription.id'], // Group the results by testPrescription.id to get the count per sample
    subQuery: false,
    limit,
    offset,
  });
  const count = await TestPrescription.count({ where: { ...query } });
  return paginate({ rows: samples, count }, currentPage, limit);
};

export const todayTestStats = async () => {
  const [
    samplesToCollect,
    samplesCollected,
    awaitingValidation,
    resultCompleted,
    awaitingApproval,
  ] = await Promise.all([
    countRecords(TestPrescription, { status: TestStatus.PENDING }, 'date_requested'),
    countRecords(TestPrescription, { status: TestStatus.SAMPLE_COLLECTED }, 'date_sample_received'),
    countRecords(PrescribedTest, { status: TestStatus.RESULT_ADDED }, 'date_requested'),
    countRecords(TestPrescription, { status: TestStatus.COMPLETED }, 'date_requested'),
    countRecords(PrescribedTest, { status: TestStatus.VERIFIED }, 'date_requested'),
  ]);
  return {
    samplesToCollect,
    samplesCollected,
    awaitingValidation,
    resultCompleted,
    awaitingApproval,
  };
};

export const changeTestResultsStatus = async (data: number[], testPrescriptionId: number) => {
  try {
    return await sequelizeConnection.transaction(async t => {
      const tests = await PrescribedTest.update(
        {
          status: TestStatus.PENDING,
          result_status: ResultStatus.PENDING,
        },
        { where: { id: data }, transaction: t }
      );
      await TestResult.update(
        { status: ResultStatus.PENDING },
        { where: { prescribed_test_id: data }, transaction: t }
      );
      await TestPrescription.update(
        { status: TestStatus.SAMPLE_COLLECTED },
        { where: { id: testPrescriptionId }, transaction: t }
      );
      return tests;
    });
  } catch (e) {
    throw new BadException('Error', StatusCodes.SERVER_ERROR, ERROR_UPDATING_TEST);
  }
};

const groupTestsBySample = (tests: PrescribedTest[]) => {
  return chain(tests)
    .groupBy(x => x.sample.name)
    .map((value, key) => ({
      sample: key,
      data: value,
    }))
    .value();
};

const statusToUpdate = (test: Partial<Result & { staff_id: number; date_created: number }>) => {
  switch (test.status) {
    case ResultStatus.ACCEPTED:
      return {
        status: TestStatus.VERIFIED,
        result_status: ResultStatus.ACCEPTED,
        test_verified_date: Date.now(),
        test_verified_by: test.staff_id,
      };
    case ResultStatus.REJECTED:
      return { status: TestStatus.PENDING, result_status: ResultStatus.REJECTED };
    default:
      return { status: TestStatus.PENDING, result_status: ResultStatus.PENDING };
  }
};

/** ***********************
 * NHIS TESTS - DEPRECATED
 ********************** */
//
// /**
//  * create a NHIS test
//  * @param data
//  * @returns {object} NHIS test data
//  */
// export async function createNhisTest(data) {
//   const { name, price, sample_id, code, staff_id, type } = data;
//
//   return NhisTest.create({
//     name,
//     staff_id,
//     price,
//     sample_id,
//     code,
//     type,
//   });
// }
//
// /**
//  * update a NHIS test
//  * @param data
//  * @returns {object} NHIS test data
//  */
// export async function updateNhisTest(data) {
//   const { test_id } = data;
//   const test = await getModelById(NhisTest, test_id);
//   return test.update(data);
// }
//
// /**
//  * search NHIS tests
//  *
//  * @function
//  * @returns {json} json object with NHIS tests data
//  * @param currentPage
//  * @param pageLimit
//  * @param search
//  */
// export async function searchNhisTests(currentPage = 1, pageLimit = 10, search) {
//   return NhisTest.paginate({
//     page: currentPage,
//     paginate: pageLimit,
//     order: [['createdAt', 'DESC']],
//     where: {
//       name: {
//         [Op.like]: `%${search}%`,
//       },
//     },
//   });
// }
//
// /**
//  * filter NHIS tests
//  *
//  * @function
//  * @returns {json} json object with NHIS tests data
//  * @param currentPage
//  * @param pageLimit
//  * @param filter
//  */
// export async function filterNhisTests(currentPage = 1, pageLimit = 10, filter) {
//   return NhisTest.paginate({
//     page: currentPage,
//     paginate: pageLimit,
//     order: [['createdAt', 'DESC']],
//     where: {
//       sample_id: filter,
//     },
//   });
// }
//
// /**
//  * get NHIS tests
//  *
//  * @function
//  * @returns {json} json object with NHIS tests data
//  * @param currentPage
//  * @param pageLimit
//  */
// export async function getNhisTests(currentPage = 1, pageLimit = 10) {
//   return NhisTest.paginate({
//     page: currentPage,
//     paginate: pageLimit,
//     order: [['createdAt', 'DESC']],
//   });
// }
