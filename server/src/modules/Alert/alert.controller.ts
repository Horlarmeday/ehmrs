import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { AlertService } from './alert.service';
import { SUCCESS } from '../../core/constants';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from './messages/response.messages';
import { validateAlert } from './validations';

export class AlertController {
  /**
   * create an alert
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, alert data
   */
  static async createAlert(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateAlert(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const alert = await AlertService.createAlert({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: alert, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get alerts
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with alerts data
   */
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await AlertService.getAlerts(req.query);

      return successResponse({ res, message: SUCCESS, data: alerts, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an alert
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, alert data
   */
  static async updateAlert(req: Request, res: Response, next: NextFunction) {
    const error = isEmpty(req.body);
    if (error)
      return errorResponse({
        res,
        message: EMPTY_BODY,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const alert = await AlertService.updateAlert(+req.params.id, req.body);

      return successResponse({ res, httpCode: 200, data: alert, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }
}
