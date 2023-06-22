import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';
import { RadiologyOrderService } from './radiology-order.service';
import { validateBulkInvestigationTest } from './validations';

export class RadiologyOrderController {
  /**
   * order an investigation test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation tests data
   */
  static async orderInvestigationTest(req, res, next): Promise<SuccessResponse> {
    const { error } = validateBulkInvestigationTest(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const investigations = await RadiologyOrderService.orderBulkInvestigationService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        data: investigations,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}
