import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { AccountService } from './account.service';
import { validatePaymentHistory } from './validations';
import AdminService from '../AdminSettings/admin.service';
import { SUCCESS } from '../../core/constants';

export class AccountController {
  /**
   * create payment history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, payment history data
   */
  static async createPaymentHistory(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validatePaymentHistory(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const data = await AccountService.createPaymentHistory({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, httpCode: 201, data, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a patient payment history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with payment history data
   */
  static async getPatientPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentHistory = await AccountService.getPaymentHistory({
        ...req.query,
        patient_id: req.params.id,
      });

      return successResponse({ res, message: SUCCESS, data: paymentHistory, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }
}
