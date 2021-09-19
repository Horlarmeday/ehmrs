import {
  createNhisTest,
  createTest,
  createTestSample,
  filterNhisTests,
  filterTests,
  getNhisTests,
  getTests,
  getTestSamples,
  searchNhisTests,
  searchTests,
  searchTestSamples,
  searchTestsInASample,
  updateNhisTest,
  updateTest,
  updateTestSample,
} from './laboratory.repository';

class LaboratoryService {
  /** ***********************
   * TEST SAMPLE
   ********************** */

  /**
   * create a test sample
   *
   * @static
   * @returns {json} json object with test sample data
   * @param body
   * @memberOf LaboratoryService
   */
  static async createSampleService(body) {
    return createTestSample(body);
  }

  /**
   * update test sample
   *
   * @static
   * @returns {json} json object with test sample data
   * @param body
   * @memberOf LaboratoryService
   */
  static async updateSampleService(body) {
    return updateTestSample(body);
  }

  /**
   * get test samples
   *
   * @static
   * @returns {json} json object with test samples data
   * @param body
   * @memberOf LaboratoryService
   */
  static async getTestSamples(body) {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchTestSamples(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getTestSamples(+currentPage, +pageLimit);
    }

    return getTestSamples();
  }

  /** ***********************
   * NHIS TEST
   ********************** */

  /**
   * create a NHIS test
   *
   * @static
   * @returns {json} json object with NHIS test data
   * @param body
   * @memberOf LaboratoryService
   */
  static async createNhisTestService(body) {
    return createNhisTest(body);
  }

  /**
   * update NHIS test
   *
   * @static
   * @returns {json} json object with NHIS test data
   * @param body
   * @memberOf LaboratoryService
   */
  static async updateNhisTestService(body) {
    return updateNhisTest(body);
  }

  /**
   * get NHIS tests
   *
   * @static
   * @returns {json} json object with NHIS tests data
   * @param body
   * @memberOf LaboratoryService
   */
  static async getNhisTests(body) {
    const { currentPage, pageLimit, search, filter } = body;
    if (search) {
      return searchNhisTests(+currentPage, +pageLimit, search);
    }

    if (filter) {
      return filterNhisTests(+currentPage, +pageLimit, filter);
    }

    if (Object.values(body).length) {
      return getNhisTests(+currentPage, +pageLimit);
    }

    return getNhisTests();
  }

  /** ***********************
   * TEST
   ********************** */

  /**
   * create a test
   *
   * @static
   * @returns {json} json object with test data
   * @param body
   * @memberOf LaboratoryService
   */
  static async createTestService(body) {
    return createTest(body);
  }

  /**
   * update test
   *
   * @static
   * @returns {json} json object with test data
   * @param body
   * @memberOf LaboratoryService
   */
  static async updateTestService(body) {
    return updateTest(body);
  }

  /**
   * get tests
   *
   * @static
   * @returns {json} json object with tests data
   * @param body
   * @memberOf LaboratoryService
   */
  static async getTests(body) {
    const { currentPage, pageLimit, search, filter, sampleId } = body;
    if (search) return searchTests(+currentPage, +pageLimit, search);

    if (filter) return filterTests(+currentPage, +pageLimit, filter);

    if (sampleId && search)
      return searchTestsInASample({
        currentPage: +currentPage,
        pageLimit: +pageLimit,
        search,
        sampleId,
      });

    if (Object.values(body).length) {
      return getTests(+currentPage, +pageLimit);
    }

    return getTests();
  }
}
export default LaboratoryService;
