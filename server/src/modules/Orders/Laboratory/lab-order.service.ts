/* eslint-disable camelcase,no-param-reassign */
import { orderBulkTest, prescribeTest } from './lab-order.repository';
import VisitService from "../../Visit/visit.service";

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
  static async orderBulkTestService(body) {
    const { tests, staff_id, visit_id } = body;
    const visit = await VisitService.getVisitById(visit_id);
    const bulkTests = tests.map(test => ({
      ...test,
      test_id: test.test_id,
      requester: staff_id,
      visit_id,
      patient_id: visit.patient_id,
      date_requested: Date.now(),
    }));
    return orderBulkTest(bulkTests);
  }
}
export default LabOrderService;
