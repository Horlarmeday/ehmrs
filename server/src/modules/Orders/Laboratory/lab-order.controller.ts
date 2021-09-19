import { validateBulkLabTest } from './validations';
import LabOrderService from './lab-order.service';
import { SuccessResponse, successResponse } from '../../../common/responses/success-responses';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';

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
  static async orderLabTest(req, res, next): Promise<SuccessResponse> {
    const { error } = validateBulkLabTest(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const tests = await LabOrderService.orderBulkTestService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        data: tests,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default LabOrderController;
