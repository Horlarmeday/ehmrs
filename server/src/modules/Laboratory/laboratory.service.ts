import {
  appendTestResults,
  approveTestResults,
  changeTestResultsStatus,
  createTest,
  createTestSample,
  createTestTariff,
  getCollectedSamples,
  getOneCollectedSample,
  getOneSampleToCollect,
  getOneTestPrescription,
  getOneTestResult,
  getSamplesToCollect,
  getTestPrescription,
  getTestResults,
  getTests,
  getTestSamples,
  getVerifiedTestResults,
  searchTestSamples,
  todayTestStats,
  updateTest,
  updateTestPrescription,
  updateTestSample,
  validateTestResults,
  createComboTest,
  getComboTests,
  getOneComboTest,
  updateComboTest,
  deleteComboTest,
} from './laboratory.repository';
import { TestTariffDto } from './dto/test-tariff.dto';
import { ResultStatus, TestStatus } from '../../database/models/prescribedTest';
import {
  generateLabAccessionNumber,
  generateUniqueAccessionNumber,
  StatusCodes,
} from '../../core/helpers/helper';
import { isEmpty } from 'lodash';
import {
  LaboratoryResultApprovalDto,
  LaboratoryResultDto,
  LaboratoryResultValidationDto,
  Result,
} from './dto/laboratory-result.dto';
import dayjs from 'dayjs';
import { TestPrescription } from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { ACCESSION_NUMB_EXIST } from './messages/response-messages';
import forms from '../../core/helpers/testResultForms';
import { PatientInfo, TestResult } from '../../core/helpers/downloadTestResult';
import FormTemplateService from '../FormTemplate/formTemplate.service';
import { FormSchema, FormField } from '../../database/models/labFormTemplate';

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
    const { currentPage, pageLimit, search, filter } = body;

    if (Object.values(body).length) {
      return getTests({ currentPage, pageLimit, search, filter });
    }

    return getTests({});
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
    const { search, pageLimit, currentPage, period, start, end } = body;
    if (Object.values(body).length) {
      return getSamplesToCollect({ currentPage, pageLimit, period, start, end, search });
    }

    return getSamplesToCollect({ period });
  }

  /**
   * Get one sample to collect
   * @memberOf LaboratoryService
   * @param prescriptionId
   */
  static async getOneSampleToCollect(prescriptionId: number | string) {
    return getOneSampleToCollect(prescriptionId);
  }

  /**
   * Generate lab accession number
   * @memberOf LaboratoryService
   */
  static async generateLabAccessionNumber() {
    return generateUniqueAccessionNumber();
    // let testPrescription: TestPrescription;
    // let accessionNumber: string;
    // do {
    //   accessionNumber = await generateLabAccessionNumber();
    //   testPrescription = await getTestPrescription({ accession_number: accessionNumber });
    // } while (testPrescription);
    // return accessionNumber;
  }

  /**
   * Collect test sample
   * @param body
   * @memberOf LaboratoryService
   */
  static async collectTestSample(body) {
    const { accession_number, id, staff_id } = body;
    const testPrescription = await getTestPrescription({ accession_number });
    if (testPrescription)
      throw new BadException('Exists', StatusCodes.BAD_REQUEST, ACCESSION_NUMB_EXIST);

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
    const { search, pageLimit, currentPage, period, start, end } = body;
    if (Object.values(body).length) {
      return getCollectedSamples({ currentPage, pageLimit, period, search, end, start });
    }

    return getCollectedSamples({ period });
  }

  /**
   * Get one sample to collect
   * @memberOf LaboratoryService
   * @param prescriptionId
   */
  static async getOneCollectedSample(prescriptionId: number | string) {
    return getOneCollectedSample(prescriptionId);
  }

  /**
   * Get one test result
   * @memberOf LaboratoryService
   * @param prescriptionId
   */
  static async getTestResult(prescriptionId: number) {
    return getOneTestResult(prescriptionId);
  }

  /**
   * Get today stats about samples
   * @memberOf LaboratoryService
   */
  static async getTodayTestStats() {
    return todayTestStats();
  }

  /**
   * Get one test prescription
   * @memberOf LaboratoryService
   */
  static async getTestPrescription(visitId: number) {
    return getOneTestPrescription({ visit_id: visitId });
  }

  /**
   * Change test results status
   * @memberOf LaboratoryService
   * @param selectedTests
   * @param testPrescriptionId
   */
  static async changeTestResultStatus(selectedTests: number[], testPrescriptionId: number) {
    return changeTestResultsStatus(selectedTests, testPrescriptionId);
  }

  /**
   * Select appropriate reference range based on patient demographics
   * @param field - Form field with reference ranges
   * @param patientAge - Patient age in years
   * @param patientSex - Patient sex
   */
  private static selectReferenceRange(
    field: FormField,
    patientAge: number,
    patientSex: string
  ): string {
    const ranges = field.referenceRanges;
    if (!ranges) return '-';

    // If normal range exists, use it (general range for all ages/sexes)
    if (ranges.normal?.min !== undefined && ranges.normal?.max !== undefined) {
      return `${ranges.normal.min} - ${ranges.normal.max}`;
    }

    // Age-dependent ranges
    const isChild = patientAge < 18;
    const isMale = patientSex?.toLowerCase() === 'male';

    let selectedRange = null;

    if (isChild && ranges.child) {
      selectedRange = ranges.child;
    } else if (!isChild && isMale && ranges.adultMale) {
      selectedRange = ranges.adultMale;
    } else if (!isChild && !isMale && ranges.adultFemale) {
      selectedRange = ranges.adultFemale;
    }

    // Format range if found
    if (selectedRange && selectedRange.min !== undefined && selectedRange.max !== undefined) {
      return `${selectedRange.min} - ${selectedRange.max}`;
    }

    return '-';
  }

  /**
   * Extract fields from template schema for PDF generation
   * @param schema - Form template schema
   * @param result - Test result data
   * @param patientAge - Patient age in years
   * @param patientSex - Patient sex
   */
  private static extractFieldsFromTemplate(
    schema: FormSchema,
    result: any,
    patientAge: number,
    patientSex: string
  ): {
    name: string;
    model: string;
    range: string;
    unit?: string;
    rows: string[];
    headers: string[];
    align: string[];
  }[] {
    const extractedFields: any[] = [];

    // Iterate through all sections and fields
    schema.sections?.forEach(section => {
      section.fields?.forEach((field: FormField) => {
        // Skip if field has no result value
        if (
          !result.result ||
          result.result[field.id] === undefined ||
          result.result[field.id] === null
        ) {
          return;
        }

        const value = result.result[field.id]?.toString() || '-';
        const range = this.selectReferenceRange(field, patientAge, patientSex);
        const unit = field.unit || '';

        // Build the field data structure compatible with PDF generation
        const fieldData = {
          name: field.label,
          model: value,
          range: range !== '-' ? `${range}${unit ? ' ' + unit : ''}` : '-',
          unit,
          headers: ['Test', 'Result', 'Range'],
          align: ['left', 'right', 'left'],
          rows: [field.label, value, range !== '-' ? `${range}${unit ? ' ' + unit : ''}` : '-'],
        };

        extractedFields.push(fieldData);
      });
    });

    return extractedFields;
  }

  /**
   * Download test result using form template
   * @param test - Test with form_template_id
   * @param result - Test result data
   * @param patientAge - Patient age in years
   * @param patientSex - Patient sex
   */
  private static async downloadTestResultFromTemplate(
    test: any,
    result: any,
    patientAge: number,
    patientSex: string
  ) {
    try {
      // Fetch the form template
      const template = await FormTemplateService.getTemplate(test.form_template_id);

      if (!template || !template.schema_json) {
        // Fallback to legacy system if template not found
        console.warn(`Template ${test.form_template_id} not found, falling back to legacy form`);
        return null;
      }

      const schema = template.schema_json as FormSchema;

      // Extract fields from template and return
      return this.extractFieldsFromTemplate(schema, result, patientAge, patientSex);
    } catch (error) {
      console.error('Error processing template-based test result:', error);
      return null;
    }
  }

  /**
   * Download test result
   * @param prescriptionId
   */
  static async downloadTestResult(
    prescriptionId: number
  ): Promise<{ patientInfo: PatientInfo; testResults: TestResult[] }> {
    const testResult = await getOneTestResult(prescriptionId);
    const { patient, date_requested, accession_number, tests, sample_receiver } = testResult;

    const patientInfo = {
      patientName: patient.fullname.toString(),
      patientId: patient.hospital_id,
      sex: patient.gender,
      age: dayjs().diff(patient.date_of_birth, 'years'),
      orderDate: dayjs(date_requested).format('MMM D, YYYY, h:mma'),
      reportDate: dayjs().format('MMM D, YYYY, h:mma'),
      accession_number,
      test_verifier: tests?.[0]?.test_verifier?.fullname,
      test_approver: tests?.[0]?.test_approver?.fullname,
      tester: tests?.[0]?.tester?.fullname,
      sample_receiver: sample_receiver.fullname,
    };

    const testResults = await tests.reduce(async (accPromise, { test, result }) => {
      const acc = await accPromise;
      const testName = test.name;
      let results: any[] = [];

      // Check if test uses new form template system
      if (test.form_template_id) {
        // Use template-based PDF generation
        const templateResults = await this.downloadTestResultFromTemplate(
          test,
          result,
          patientInfo.age,
          patientInfo.sex
        );

        if (templateResults && templateResults.length) {
          results = templateResults;
        } else {
          // Fallback to legacy if template processing fails
          console.warn(
            `Failed to process template for test ${testName}, attempting legacy fallback`
          );
        }
      }

      // If no template results or fallback needed, use legacy system
      if (!results.length && test.result_form && forms[test.result_form]) {
        const form = forms[test.result_form];
        results = form
          .map(item => {
            return this.getTestResultForm(test.result_form, test, item, result, patientInfo.sex);
          })
          .filter(
            item =>
              item?.model ||
              item?.oModel ||
              item?.hModel ||
              item?.totalModel ||
              item?.directModel ||
              item?.glucoseModel ||
              item?.proteinModel
          );
      }

      if (results?.length) {
        acc[testName] = acc[testName] || { test: testName, results: [] };
        acc[testName].results.push(...results);
      }

      return acc;
    }, Promise.resolve({}));

    return { patientInfo, testResults: Object.values(testResults) };
  }

  static getTestResultForm(
    result_form: any,
    test: { result_form: string; name: string },
    item: {
      name: string;
      oModel: string | number;
      hModel: string | number;
      range: string;
      totalModel: string | number;
      directModel: string | number;
      totalRange: string;
      directRange: string;
      adultRangeFemale: string;
      adultRangeMale: string;
      childRange: string;
      unit: string;
      model: string | number;
      ranges: string[];
      glucoseModel: string | number;
      proteinModel: string | number;
    },
    result: { result: { [x: string]: { toString: () => string } } },
    sex: string
  ) {
    switch (result_form) {
      case 'WidalReactionForm': {
        const data = {
          name: item.name,
          oModel: result.result[item.oModel]?.toString(),
          hModel: result.result[item.hModel]?.toString(),
        };
        return {
          ...data,
          headers: ['Test', 'O', 'H'],
          align: ['left', 'right', 'left'],
          rows: [data.name, data.oModel, data.hModel],
        };
      }
      case 'BilirubinForm': {
        const data = {
          name: item.name,
          totalModel: result?.result[item.totalModel]?.toString(),
          directModel: result?.result[item.directModel]?.toString(),
          totalRange: item?.totalRange || '-',
          directRange: item?.directRange || '-',
        };
        return {
          ...data,
          headers: ['Test', 'Total', 'Direct', 'Total Range', 'Direct Range'],
          align: ['left', 'right', 'right', 'left', 'left'],
          rows: [data.name, data.totalModel, data.directModel, data.totalRange, data.directRange],
        };
      }
      case 'FBCForm': {
        const adultRange = sex === 'Female' ? item.adultRangeFemale : item.adultRangeMale;
        const childrenRange =
          !item?.childRange || item?.childRange === '-' ? '-' : `${item?.childRange}${item.unit}`;

        const data = {
          name: item.name,
          model: result?.result[item.model]?.toString(),
          childRange: childrenRange,
          adultRange: !adultRange || adultRange === '-' ? '-' : `${adultRange}${item.unit}`,
        };
        return {
          ...data,
          headers: ['Test', 'Result', 'Children Range', 'Adult Range'],
          align: ['left', 'right', 'left', 'left'],
          rows: [data.name, data.model, data.childRange, data.adultRange],
        };
      }
      case 'HormonalAssayForm': {
        const data = {
          name: item.name,
          model: result?.result[item.model]?.toString(),
          range: item?.ranges?.join('\n') || '-',
        };
        return {
          ...data,
          headers: ['Test', 'Result', 'Ranges'],
          align: ['left', 'right', 'left'],
          rows: [data.name, data.model, data.range],
        };
      }
      case 'OGTTForm': {
        if (item?.model) {
          const data = {
            name: item.name,
            model: result.result[item.model]?.toString(),
            range: item?.range || '-',
          };
          return {
            ...data,
            headers: ['Time', 'Glucose Value', 'Range'],
            align: ['left', 'right', 'left'],
            rows: [data.name, data.model, data.range],
          };
        }
        const data = {
          name: item.name,
          glucoseModel: result.result[item.glucoseModel]?.toString(),
          proteinModel: result.result[item.proteinModel]?.toString(),
        };
        return {
          ...data,
          headers: ['Time', 'Presence of Glucose', 'Presence of Protein'],
          align: ['left', 'right', 'left', 'left'],
          rows: [data.name, data.glucoseModel, data.proteinModel],
        };
      }
      default: {
        const data = {
          name: test.result_form === 'DefaultResultForm' ? test.name : item.name,
          model: result.result[item.model]?.toString(),
          range: item?.range || '-',
        };
        return {
          ...data,
          headers: ['Test', 'Result', 'Range'],
          align: ['left', 'right', 'left'],
          rows: [data.name, data.model, data.range],
        };
      }
    }
  }

  /**
   * Add/Update test results
   * @param laboratoryResultDto
   */
  static async appendTestResults(laboratoryResultDto: LaboratoryResultDto) {
    const { results, staff_id, tester_id } = laboratoryResultDto;
    const data = results
      .filter(({ result }) => Object.values(result)?.length)
      .map(result => ({
        ...result,
        staff_id,
        tester_id,
        form_template_id: result.form_template_id,
        testStatus: this.getTestStatus(result),
        date_created: Date.now(),
        is_abnormal: this.getTestAbnormalState(result.result, result.valid_range),
      }));
    return appendTestResults(data);
  }

  /**
   * Validate and verify test results
   * @param laboratoryResultValidationDto
   */
  static async validateTestResults(laboratoryResultValidationDto: LaboratoryResultValidationDto) {
    const { results, result_notes, staff_id } = laboratoryResultValidationDto;
    const data = results
      .filter(({ result }) => !isEmpty(result))
      .map(result => ({
        ...result,
        staff_id,
        date_created: Date.now(),
      }));
    return validateTestResults(data, result_notes);
  }

  /***
   * Approve test results
   * @param laboratoryResultApprovalDto
   */
  static async approveTestResults(laboratoryResultApprovalDto: LaboratoryResultApprovalDto) {
    const { results, staff_id } = laboratoryResultApprovalDto;
    const data = results.map(result => ({
      ...result,
      staff_id,
    }));
    const rejectedResults = data.filter(({ status }) => status === ResultStatus.REJECTED);
    const acceptedResults = data.filter(
      ({ status, test_status }) => status === ResultStatus.ACCEPTED && test_status
    );
    if (rejectedResults?.length) await validateTestResults(rejectedResults, '');
    if (acceptedResults?.length) await approveTestResults(acceptedResults);

    return data;
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

  /**
   * Get verified test results
   * @param body
   * @memberOf LaboratoryService
   */
  static async getVerifiedResults(body) {
    const { search, pageLimit, currentPage, start, end, period } = body;
    if (start && end) {
      return getVerifiedTestResults({ currentPage, pageLimit, search, end, start, period });
    }

    if (Object.values(body).length) {
      return getVerifiedTestResults({ currentPage, pageLimit, period });
    }

    return getVerifiedTestResults({ period });
  }

  static getTestStatus(result: Result) {
    if (result.referral_reason) return TestStatus.REFERRED;
    if (result.result) return TestStatus.RESULT_ADDED;
    if (isEmpty(result.result)) return TestStatus.PENDING;
  }

  static getTestAbnormalState(result: string, range: string) {
    if (!range) return false;
    // Split the range string into minimum and maximum values
    const [minValue, maxValue] = range?.split('-')?.map(parseFloat);

    // Check if the number is within the range
    return +result >= minValue && +result <= maxValue;
  }

  /** ***********************
   * COMBO TESTS
   ********************** */

  /**
   * Create a combo test
   * @param body
   * @memberOf LaboratoryService
   */
  static async createComboTest(body: { name: string; staff_id: number; test_ids: number[] }) {
    return createComboTest(body);
  }

  /**
   * Get combo tests
   * @param body
   * @memberOf LaboratoryService
   */
  static async getComboTests(body) {
    const { currentPage, pageLimit, search } = body;

    if (Object.values(body).length) {
      return getComboTests({ currentPage, pageLimit, search });
    }

    return getComboTests({});
  }

  /**
   * Get one combo test
   * @param id
   * @memberOf LaboratoryService
   */
  static async getOneComboTest(id: number) {
    return getOneComboTest(id);
  }

  /**
   * Update a combo test
   * @param body
   * @memberOf LaboratoryService
   */
  static async updateComboTest(body: { id: number; name?: string; test_ids?: number[] }) {
    return updateComboTest(body);
  }

  /**
   * Delete a combo test
   * @param id
   * @memberOf LaboratoryService
   */
  static async deleteComboTest(id: number) {
    return deleteComboTest(id);
  }
}
export default LaboratoryService;
