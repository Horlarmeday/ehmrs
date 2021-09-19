import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';
import { validateDrugPrescription } from './validations';
import PharmacyOrderService from './pharmacy-order.service';

class PharmacyOrderController {
  /**
   * prescribe a drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, prescribed drug data
   */
  static async prescribeDrug(req, res, next): Promise<SuccessResponse> {
    const { error } = validateDrugPrescription(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const tests = await PharmacyOrderService.prescribeDrug({
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

export default PharmacyOrderController;
