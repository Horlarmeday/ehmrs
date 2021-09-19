import VisitService from './visit.service';
import { validateVisit } from './validations';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import { errorResponse } from '../../common/responses/error-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';

class VisitController {
  /**
   * create a patient visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, visit data
   */
  static async createVisit(req, res, next): Promise<SuccessResponse> {
    const { error } = validateVisit(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const visit = await VisitService.createVisitService({ ...req.body, staff_id: req.user.sub });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: visit,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getVisits(req, res, next) {
    try {
      const visits = await VisitService.getAllVisits(req.query);

      return successResponse({ res, data: visits, message: SUCCESS, httpCode: StatusCodes.OK });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get active visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getActiveVisits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const visits = await VisitService.getActiveVisits(req.query);

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: visits });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get type visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getTypeVisits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const visits = await VisitService.getTypeVisits(req.query);

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: visits });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visit data
   */
  static async getVisitById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const visit = await VisitService.getOneVisit(+req.params.id);

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: visit });
    } catch (e) {
      next(e);
    }
  }
}

export default VisitController;
