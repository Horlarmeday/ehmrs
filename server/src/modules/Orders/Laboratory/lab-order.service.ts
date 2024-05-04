/* eslint-disable camelcase,no-param-reassign */
import {
  deletePrescribedTest,
  getOnePrescribedTest,
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
import { isToday, StatusCodes } from '../../../core/helpers/helper';
import { TestStatus } from '../../../database/models/testPrescription';
import { getVisitById } from '../../Visit/visit.repository';
import { NHISApprovalStatus } from '../../../core/helpers/general';
import { PrescriptionType } from '../../../database/models/prescribedTest';
import { PaymentStatus } from '../../../database/models/prescribedDrug';
import { BadException } from '../../../common/util/api-error';
import { CANNOT_DELETE_TEST } from './messages/response-messages';
import { getPatientInsuranceQuery } from '../../Insurance/insurance.repository';

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
    const [patient, prescription, insurance] = await Promise.all([
      PatientService.getPatientById(visit.patient_id),
      this.getTestPrescription(visit.patient_id, body),
      getPatientInsuranceQuery({
        patient_id: visit.patient_id,
        is_default: true,
      }),
    ]);

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
        patient_insurance_id: insurance?.id,
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

    if (Object.values(body).length) {
      return getPrescribedTests({ currentPage, pageLimit, filter });
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
   * delete prescribed test
   *
   * @static
   * @returns {json} json object with prescribed test data
   * @param body
   * @memberOf LabOrderService
   */
  static async deletePrescribedTest(body) {
    const allowedStatuses = [PaymentStatus.PAID, PaymentStatus.PERMITTED, PaymentStatus.CLEARED];
    const test = await getOnePrescribedTest({ id: body.testId });
    if (test && allowedStatuses.includes(test.payment_status))
      throw new BadException('Error', StatusCodes.BAD_REQUEST, CANNOT_DELETE_TEST);

    return deletePrescribedTest(body.testId);
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
