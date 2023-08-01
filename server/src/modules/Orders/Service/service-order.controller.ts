import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';
import { ServiceOrderService } from './service-order.service';
import { validateBulkService } from './validations';

export class ServiceOrderController {
  /**
   * order bulk services
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, prescribed services data
   */
  static async orderBulkService(req, res, next): Promise<SuccessResponse> {
    const { error } = validateBulkService(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const services = await ServiceOrderService.orderBulkService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        data: services,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}
