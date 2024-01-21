import { validateBulkLabTest } from './validations';
import { LabOrderService } from './lab-order.service';
import { SuccessResponse, successResponse } from '../../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../../AdminSettings/messages/response-messages';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../../core/constants';
import { isEmpty } from 'lodash';
import { EMPTY_REQUEST_BODY } from './messages/response-messages';

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
  static async orderLabTest(req, res: Response, next: NextFunction) {
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

  /**
   * get prescribed tests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with prescribed tests data
   */
  static async getPrescribedTests(req: Request, res: Response, next: NextFunction) {
    try {
      const tests = await LabOrderService.getPrescribedTests(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: tests,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a prescribed test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed test data
   */
  static async updatePrescribedTest(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const empty = isEmpty(req.body);
    if (empty)
      return errorResponse({
        res,
        message: EMPTY_REQUEST_BODY,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const test = await LabOrderService.updatePrescribedTest(req.body);

      return successResponse({
        res,
        data: test,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}

export default LabOrderController;
