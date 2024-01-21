/* eslint-disable camelcase,no-param-reassign */
import {
  getPrescribedTests,
  orderBulkTest,
  prescribeTest,
  updatePrescribedTest,
} from './lab-order.repository';
import { PrescribedTestBody } from './interface/prescribed-test.body';
import { PrescribedDrug, PrescribedTest } from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import {
  createTestPrescription,
  getLastTestPrescription,
  getTestPrice,
} from '../../Laboratory/laboratory.repository';
import { isToday } from '../../../core/helpers/helper';
import { TestStatus } from '../../../database/models/testPrescription';
import { getVisitById } from '../../Visit/visit.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PrescriptionType } from '../../../database/models/prescribedTest';

export class LabOrderService {
  /**
   * prescribe a test for patient
   *
   * @static
   * @returns {json} json object with prescribed test data
   * @param body
   * @memberOf LabOrderService
   */
  static async prescribeTestService(body) {
    return prescribeTest(body);
  }

  /**
   * prescribe bulk test for patient
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @param body
   * @memberOf LabOrderService
   */
  static async orderBulkTestService(body: PrescribedTestBody): Promise<PrescribedTest[]> {
    const { tests, staff_id, visit_id } = body;
    const visit = await getVisitById(visit_id);
    const patient = await PatientService.getPatientById(visit.patient_id);
    const prescription = await this.getTestPrescription(visit.patient_id, body);
    const bulkTests = await Promise.all(
      tests.map(async test => ({
        ...test,
        price: (await getTestPrice(patient, test.test_id)) || test.price,
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
        test_prescription_id: prescription.id,
        ...(test.test_type === PrescriptionType.NHIS && {
          nhis_status: NHISApprovalStatus.PENDING,
        }),
      }))
    );
    return orderBulkTest(bulkTests);
  }

  /**
   * get prescribed tests
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @param body
   * @memberOf LabOrderService
   */
  static async getPrescribedTests(body) {
    const { currentPage, pageLimit, filter } = body;

    if (filter) {
      return getPrescribedTests({ currentPage, pageLimit, filter });
    }

    if (Object.values(body).length) {
      return getPrescribedTests({ currentPage, pageLimit });
    }

    return getPrescribedTests({});
  }

  /**
   * update prescribed test
   *
   * @static
   * @returns {Promise<PrescribedTest>} json object with prescribed test data
   * @param body
   * @memberOf LabOrderService
   */
  static async updatePrescribedTest(body: Partial<PrescribedTest>): Promise<PrescribedTest> {
    return updatePrescribedTest(body);
  }

  /**
   * get the test prescription
   *
   * @static
   * @returns {json} json object with prescribed tests data
   * @memberOf LabOrderService
   * @param patient_id
   * @param data
   */
  private static async getTestPrescription(patient_id: number, data: PrescribedTestBody) {
    const lastPrescription = await getLastTestPrescription(patient_id);

    if (lastPrescription && !isToday(lastPrescription?.date_requested))
      return createTestPrescription(this.testPrescriptionData(data, patient_id));

    // if today and sample has not been collected - pick the id and use it in the test samples and prescribed test
    if (lastPrescription?.status === TestStatus.PENDING) return lastPrescription;

    // if today and sample has been collected - create new one
    if (lastPrescription?.status === TestStatus.SAMPLE_COLLECTED)
      return createTestPrescription(this.testPrescriptionData(data, patient_id));

    return createTestPrescription(this.testPrescriptionData(data, patient_id));
  }

  private static testPrescriptionData(body: PrescribedTestBody, patient_id: number) {
    return {
      source: body.tests[0].source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_requested: Date.now(),
      ...(body.tests[0]?.ante_natal_id && { ante_natal_id: body.tests[0]?.ante_natal_id }),
    };
  }
}
