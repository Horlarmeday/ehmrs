/* eslint-disable camelcase,no-param-reassign */
import { orderBulkTest, prescribeTest } from './lab-order.repository';
import VisitService from '../../Visit/visit.service';
import { PrescribedTestBody } from './interface/prescribed-test.body';
import { PrescribedTest } from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import {
  createTestPrescription,
  getLastTestPrescription,
  getTestPrice,
} from '../../Laboratory/laboratory.repository';
import { isToday } from '../../../core/helpers/helper';
import { TestStatus } from '../../../database/models/testPrescriptions';

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
    const visit = await VisitService.getVisitById(visit_id);
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
      }))
    );
    return orderBulkTest(bulkTests);
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
  static async getTestPrescription(patient_id: number, data: PrescribedTestBody) {
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

  static testPrescriptionData(body: PrescribedTestBody, patient_id: number) {
    return {
      source: body.source,
      requester: body.staff_id,
      visit_id: body.visit_id,
      patient_id,
      date_requested: Date.now(),
    };
  }
}
