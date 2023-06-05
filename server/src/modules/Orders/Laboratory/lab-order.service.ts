/* eslint-disable camelcase,no-param-reassign */
import { orderBulkTest, prescribeTest } from './lab-order.repository';
import VisitService from '../../Visit/visit.service';
import { PrescribedTestBody } from './interface/prescribed-test.body';
import { PrescribedTest } from '../../../database/models';
import PatientService from '../../Patient/patient.service';
import { getTestPrice } from '../../Laboratory/laboratory.repository';

class LabOrderService {
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
    const bulkTests = await Promise.all(
      tests.map(async test => ({
        ...test,
        price: (await getTestPrice(patient, test.test_id)) || test.price,
        requester: staff_id,
        visit_id,
        patient_id: visit.patient_id,
        date_requested: Date.now(),
      }))
    );
    return orderBulkTest(bulkTests);
  }
}
export default LabOrderService;
