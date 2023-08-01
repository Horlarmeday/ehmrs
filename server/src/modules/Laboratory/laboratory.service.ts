import {
  appendTestResults,
  approveTestResults,
  createNhisTest,
  createTest,
  createTestSample,
  createTestTariff,
  filterNhisTests,
  filterTests,
  getCollectedSamples,
  getNhisTests,
  getOneCollectedSample,
  getOneSampleToCollect,
  getSamplesToCollect,
  getTestPrescription,
  getTestResults,
  getTests,
  getTestSamples,
  searchNhisTests,
  searchTests,
  searchTestSamples,
  searchTestsInASample,
  updateNhisTest,
  updateTest,
  updateTestPrescription,
  updateTestSample,
  validateTestResults,
} from './laboratory.repository';
import { TestTariffDto } from './dto/test-tariff.dto';
import { TestStatus } from '../../database/models/prescribedTest';
import { generateLabAccessionNumber } from '../../core/helpers/helper';
import { isEmpty } from 'lodash';
import {
  LaboratoryResultApprovalDto,
  LaboratoryResultDto,
  LaboratoryResultValidationDto,
} from './dto/laboratory-result.dto';

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

  /** ***********************
   * TEST TARIFFS
   ********************** */

  /**
   * create a test tariffs
   *
   * @static
   * @returns {json} json object with test tariff data
   * @param body
   * @memberOf LaboratoryService
   */
  static async createTestTariffService(body: TestTariffDto) {
    const { prices, test_id } = body;

    const data = prices.map(price => ({
      ...price,
      test_id,
      insurance_id: price.insurance_id,
    }));
    return createTestTariff(data);
  }

  /***********************
   * LABORATORY RESULTS
   ***********************/

  /**
   * Get samples to collect
   * @param body
   * @memberOf LaboratoryService
   */
  static async samplesToCollect(body) {
    const { search, pageLimit, currentPage, period } = body;
    if (search) {
      return getSamplesToCollect({ currentPage, pageLimit, period, search });
    }

    if (Object.values(body).length) {
      return getSamplesToCollect({ currentPage, pageLimit, period });
    }

    return getSamplesToCollect({ period });
  }

  static async getOneSampleToCollect(prescriptionId: number | string) {
    return getOneSampleToCollect(prescriptionId);
  }

  static async generateLabAccessionNumber() {
    let testPrescription;
    let accessionNumber;
    do {
      accessionNumber = generateLabAccessionNumber();
      testPrescription = await getTestPrescription({ accession_number: accessionNumber });
    } while (testPrescription);
    return accessionNumber;
  }

  static async collectTestSample(body) {
    const { accession_number, id, staff_id } = body;
    return updateTestPrescription(
      { id },
      {
        accession_number,
        date_sample_received: Date.now(),
        sample_received_by: staff_id,
        status: TestStatus.SAMPLE_COLLECTED,
      }
    );
  }

  /**
   * Get samples to collect
   * @param body
   * @memberOf LaboratoryService
   */
  static async samplesCollected(body) {
    const { search, pageLimit, currentPage, period } = body;
    if (search) {
      return getCollectedSamples({ currentPage, pageLimit, period, search });
    }

    if (Object.values(body).length) {
      return getCollectedSamples({ currentPage, pageLimit, period });
    }

    return getCollectedSamples({ period });
  }

  static async getOneCollectedSample(prescriptionId: number | string) {
    return getOneCollectedSample(prescriptionId);
  }

  static async appendTestResults(laboratoryResultDto: LaboratoryResultDto) {
    const { results, staff_id } = laboratoryResultDto;
    const data = results.map(result => ({
      ...result,
      staff_id,
      testStatus: this.getTestStatus(result),
      date_created: Date.now(),
    }));
    return appendTestResults(data);
  }

  static async validateTestResults(laboratoryResultValidationDto: LaboratoryResultValidationDto) {
    const { results, result_notes, staff_id } = laboratoryResultValidationDto;
    const data = results.map(result => ({
      ...result,
      staff_id,
      date_created: Date.now(),
    }));
    return validateTestResults(data, result_notes);
  }

  static async approveTestResults(laboratoryResultApprovalDto: LaboratoryResultApprovalDto) {
    const { results, staff_id } = laboratoryResultApprovalDto;
    const data = results.map(result => ({
      ...result,
      staff_id,
    }));
    return approveTestResults(data);
  }

  /**
   * Get test results
   * @param body
   * @memberOf LaboratoryService
   */
  static async getTestResults(body) {
    const { search, pageLimit, currentPage, start, end } = body;
    if (start && end) {
      return getTestResults({ currentPage, pageLimit, search, end, start });
    }

    if (Object.values(body).length) {
      return getTestResults({ currentPage, pageLimit, search });
    }

    return getTestResults({ search });
  }

  static getTestStatus(result) {
    if (result.referral_reason) return TestStatus.REFERRED;
    if (result.result) return TestStatus.RESULT_ADDED;
    if (isEmpty(result.result)) return TestStatus.PENDING;
  }

  /** ***********************
   * NHIS TEST DEPRECATED
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
}
export default LaboratoryService;
