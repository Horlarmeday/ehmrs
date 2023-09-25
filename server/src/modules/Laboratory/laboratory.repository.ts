/* eslint-disable camelcase */
import sequelize, { Op } from 'sequelize';
import { getModelById, getNumberOfRecords, getPeriodQuery } from '../../core/helpers/general';

import {
  NhisTest,
  Patient,
  PatientInsurance,
  PrescribedTest,
  Sample,
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
  todayQuery,
} from '../../core/helpers/helper';
import { chain } from 'lodash';
import { TestStatus } from '../../database/models/prescribedTest';
import sequelizeConnection from '../../database/config/config';
import { ResultStatus } from '../../database/models/testResult';
import { getPatientInsuranceQuery } from '../Insurance/insurance.repository';

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
  const { name, price, sample_id, staff_id, result_unit, valid_range } = data;
  const count = await getNumberOfRecords(Test);

  return Test.create({
    name,
    staff_id,
    price,
    sample_id,
    result_unit,
    valid_range,
    code: `D${count + 1}`,
  });
}

/**
 * get a test
 * @param data
 * @returns {object} test data
 */
export async function getTestById(data) {
  return getModelById(Test, data);
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
 * search tests
 *
 * @function
 * @returns {json} json object with tests data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchTests(currentPage = 1, pageLimit = 10, search) {
  return Test.paginate({
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
 * search tests
 *
 * @function
 * @returns {json} json object with tests data
 * @param currentPage
 * @param pageLimit
 * @param search
 * @param id
 */
export async function searchTestsInASample({ currentPage = 1, pageLimit = 10, search, sampleId }) {
  return Test.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      sample_id: sampleId,
      name: {
        [Op.like]: `%${search}%`,
      },
    },
  });
}

/**
 * filter tests
 *
 * @function
 * @returns {json} json object with tests data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function filterTests(currentPage = 1, pageLimit = 10, filter) {
  return Test.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      sample_id: filter,
    },
  });
}

/**
 * get tests
 *
 * @function
 * @returns {json} json object with tests data
 * @param currentPage
 * @param pageLimit
 */
export async function getTests(currentPage = 1, pageLimit = 10) {
  return Test.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
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

export const getTestPrice = async (patient: Patient, test_id: number) => {
  if (canUsePriceTariff(patient)) {
    const insurance = await getPatientInsuranceQuery({ patient_id: patient.id, is_default: true });
    return testPriceTariff(insurance, test_id);
  }
  return null;
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
        // Count the number of tests in each sample and alias it as 'testCount'
        [sequelize.fn('COUNT', sequelize.col('tests.id')), 'testCount'],
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
            ],
          }),
        },
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
 * @returns {json} json object with test samples data
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
              `DISTINCT CASE WHEN tests.status = '${TestStatus.REFERRED}' THEN tests.id END`
            )
          ),
          'referred_tests_count',
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
              `DISTINCT CASE WHEN tests.status = '${TestStatus.VERIFIED}' THEN tests.id END`
            )
          ),
          'pending_approved_count',
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
            ],
          }),
        },
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

export const getTestPrescription = async query => {
  return TestPrescription.findOne({ where: { ...query } });
};

export const getOneSampleToCollect = async (testPrescriptionId: number | string) => {
  const testPrescriptions = await TestPrescription.findOne({
    where: { id: testPrescriptionId, status: TestStatus.PENDING },
    attributes: [],
    include: [
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id', 'gender'],
      },
      {
        model: PrescribedTest,
        attributes: ['test_id'],
        include: [
          { model: Test, attributes: ['name'] },
          { model: Sample, attributes: ['name'] },
        ],
      },
    ],
  });
  return { ...testPrescriptions.toJSON(), tests: groupTestsBySample(testPrescriptions.tests) };
};

export const getOneCollectedSample = async (testPrescriptionId: number | string) => {
  const testPrescriptions = await TestPrescription.findOne({
    where: { id: testPrescriptionId, status: TestStatus.SAMPLE_COLLECTED },
    attributes: ['accession_number', 'result_notes'],
    include: [
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id', 'gender', 'id'],
      },
      {
        model: PrescribedTest,
        attributes: ['test_id', 'id', 'status'],
        include: [
          { model: Test, attributes: ['name'] },
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
  return { ...testPrescriptions.toJSON(), tests: groupTestsBySample(testPrescriptions.tests) };
};

export const updateTestPrescription = (
  query: sequelize.WhereOptions<any>,
  fieldsToUpdate: { [x: string]: any }
) => {
  return TestPrescription.update({ ...fieldsToUpdate }, { where: { ...query } });
};

export const validateTestResults = async (data, result_notes) => {
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
    await TestPrescription.update(
      { result_notes },
      { where: { id: data[0].test_prescription_id }, transaction: t }
    );
    return result;
  });
};

export const approveTestResults = async data => {
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
        status: {
          [Op.ne]: TestStatus.REFERRED,
        },
      },
    });
    if (data.length === testsCount) {
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
    const testResults = await TestResult.bulkCreate(data, {
      updateOnDuplicate: testResultFieldsToUpdate(['institute_referred', 'referral_reason']),
      transaction: t,
    });
    const testIds = data.map(({ prescribed_test_id }) => prescribed_test_id) as number[];

    const results = await TestResult.findAll({ where: { prescribed_test_id: testIds } });

    await Promise.all(
      data.map(async test =>
        PrescribedTest.update(
          {
            status: test.testStatus,
            result_id: results.find(
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
    attributes: ['id', 'accession_number', 'source', 'date_sample_received', 'patient_id'],
    order: [['date_sample_received', 'DESC']],
    where: {
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
        required: true,
      },
    ],
  });
};

export const getOneTestResult = async (testPrescriptionId: number) => {
  return TestPrescription.findOne({
    where: { id: testPrescriptionId },
    attributes: ['result_notes', 'accession_number', 'date_requested'],
    include: [
      {
        model: Patient,
        attributes: ['firstname', 'lastname', 'hospital_id', 'gender'],
      },
      {
        model: PrescribedTest,
        attributes: ['test_id', 'id', 'status'],
        include: [
          { model: Test, attributes: ['name', 'result_unit', 'valid_range'] },
          {
            model: TestResult,
            attributes: ['result', 'is_abnormal', 'comments', 'status'],
          },
        ],
        where: {
          status: TestStatus.APPROVED,
        },
        required: true,
      },
    ],
  });
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
              `DISTINCT CASE WHEN tests.status = '${TestStatus.PENDING}' THEN tests.id END`
            )
          ),
          'pending_tests_count',
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
              `DISTINCT CASE WHEN tests.status = '${TestStatus.VERIFIED}' THEN tests.id END`
            )
          ),
          'pending_approved_count',
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
        attributes: ['firstname', 'lastname', 'fullname', 'hospital_id'],
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
    countRecords(TestPrescription, TestStatus.PENDING, 'date_requested'),
    countRecords(TestPrescription, TestStatus.SAMPLE_COLLECTED, 'date_sample_received'),
    countRecords(PrescribedTest, TestStatus.RESULT_ADDED, 'date_requested'),
    countRecords(TestPrescription, TestStatus.COMPLETED, 'date_requested'),
    countRecords(PrescribedTest, TestStatus.VERIFIED, 'date_requested'),
  ]);
  return {
    samplesToCollect,
    samplesCollected,
    awaitingValidation,
    resultCompleted,
    awaitingApproval,
  };
};

const countRecords = async (model, status: TestStatus, dateField: string) => {
  return model.count({ where: { status, ...todayQuery(dateField) } });
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

const statusToUpdate = test => {
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

/**
 * create a NHIS test
 * @param data
 * @returns {object} NHIS test data
 */
export async function createNhisTest(data) {
  const { name, price, sample_id, code, staff_id, type } = data;

  return NhisTest.create({
    name,
    staff_id,
    price,
    sample_id,
    code,
    type,
  });
}

/**
 * update a NHIS test
 * @param data
 * @returns {object} NHIS test data
 */
export async function updateNhisTest(data) {
  const { test_id } = data;
  const test = await getModelById(NhisTest, test_id);
  return test.update(data);
}

/**
 * search NHIS tests
 *
 * @function
 * @returns {json} json object with NHIS tests data
 * @param currentPage
 * @param pageLimit
 * @param search
 */
export async function searchNhisTests(currentPage = 1, pageLimit = 10, search) {
  return NhisTest.paginate({
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
 * filter NHIS tests
 *
 * @function
 * @returns {json} json object with NHIS tests data
 * @param currentPage
 * @param pageLimit
 * @param filter
 */
export async function filterNhisTests(currentPage = 1, pageLimit = 10, filter) {
  return NhisTest.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
    where: {
      sample_id: filter,
    },
  });
}

/**
 * get NHIS tests
 *
 * @function
 * @returns {json} json object with NHIS tests data
 * @param currentPage
 * @param pageLimit
 */
export async function getNhisTests(currentPage = 1, pageLimit = 10) {
  return NhisTest.paginate({
    page: currentPage,
    paginate: pageLimit,
    order: [['createdAt', 'DESC']],
  });
}
