import VisitService from './visit.service';
import { validateVisit } from './validations';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SUCCESS } from '../../core/constants';
import { errorResponse } from '../../common/responses/error-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from './messages/response.messages';

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
  static async createVisit(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
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
   * get a patient last active visit or create new one
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, visit data
   */
  static async getLastActiveVisitOrCreate(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateVisit(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const visit = await VisitService.getLastActiveVisitOrCreate({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: visit.isExist ? StatusCodes.OK : StatusCodes.CREATED,
        message: DATA_SAVED,
        data: visit.visit,
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
  static async getVisits(req: Request, res: Response, next: NextFunction) {
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
   * get category visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getCategoryVisits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const visits = await VisitService.getCategoryVisits(req.query);

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

  /**
   * get professional assigned visits
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visits data
   */
  static async getProfessionalAssignedVisits(
    req: Request & { user: { sub: number; role: string } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const visits = await VisitService.getProfessionalAssignedVisits({
        ...req.query,
        role: req.user.role,
      });

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: visits });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get all prescriptions in a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visit data
   */
  static async getVisitPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const prescriptions = await VisitService.getVisitPrescriptions(+req.params.id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: prescriptions,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * update a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visit data
   */
  static async updateVisit(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const error = isEmpty(req.body);
    if (error)
      return errorResponse({
        res,
        message: EMPTY_BODY,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const visit = await VisitService.updateVisit(+req.params.id, req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: visit,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get all pending prescriptions in a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with visit data
   */
  static async getPendingVisitPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const prescriptions = await VisitService.getPendingVisitPrescriptions(+req.params.id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: prescriptions,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default VisitController;
