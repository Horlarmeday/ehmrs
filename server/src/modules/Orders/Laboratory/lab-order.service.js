/* eslint-disable camelcase,no-param-reassign */
import { prescribeTest } from './lab-order.repository';

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
  static async prescribeBulkTestService(body) {
    const { tests, staff_id, visit_id } = body;
    const createdTests = await Promise.all(
      tests.map(async test => {
        test.requester = staff_id;
        test.visit_id = visit_id;
        await prescribeTest(test);
        return test;
      })
    );

    return createdTests;
  }
}
export default LabOrderService;
