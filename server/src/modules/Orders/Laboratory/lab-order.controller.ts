import { validateBulkLabTest } from './validations';
import LabOrderService from './lab-order.service';
import { successResponse } from '../../../common/responses/success-responses';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';

class LabOrderController {
  /**
   * order a lab test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, lab tests data
   */
  static async orderLabTest(req, res, next) {
    const { error } = validateBulkLabTest(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    try {
      const tests = await LabOrderService.orderBulkTestService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, data: tests, message: DATA_SAVED, httpCode: 201 });
    } catch (e) {
      return next(e);
    }
  }
}

export default LabOrderController;
