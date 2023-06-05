/* eslint-disable camelcase */
import { Op } from 'sequelize';
import { getModelById, getNumberOfRecords } from '../../core/helpers/general';

import { Test, NhisTest, Sample, TestTariff, Patient } from '../../database/models';
import { canUsePriceTariff } from '../../core/helpers/helper';

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
  const { name, price, sample_id, staff_id } = data;
  const count = await getNumberOfRecords(Test);

  return Test.create({
    name,
    staff_id,
    price,
    sample_id,
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

const testPriceTariff = async (patient: Patient, test_id: number) => {
  const { price } =
    (await TestTariff.findOne({
      where: { test_id, hmo_id: patient.hmo_id },
      order: [['createdAt', 'DESC']],
    })) || {};
  return price;
};

export const getTestPrice = (patient: Patient, test_id: number) => {
  if (canUsePriceTariff(patient)) return testPriceTariff(patient, test_id);
  return null;
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
