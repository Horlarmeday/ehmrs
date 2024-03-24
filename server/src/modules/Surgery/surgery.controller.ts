import { NextFunction, Request, Response } from 'express';
import { successResponse, SuccessResponse } from '../../common/responses/success-responses';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { validateOperationNote, validateSurgery } from './validations';
import { SurgeryService } from './surgery.service';
import { SUCCESS } from '../../core/constants';

export class SurgeryController {
  /**
   * request surgery
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, surgery data
   */
  static async requestSurgery(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateSurgery(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const surgeryRequest = await SurgeryService.requestSurgery({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: surgeryRequest, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient surgery
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with surgery data
   */
  static async getPatientSurgery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const surgeryRequest = await SurgeryService.getPatientSurgery(+req.query.visitId);

      return successResponse({ res, message: SUCCESS, data: surgeryRequest, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get surgery requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with surgeryRequests data
   */
  static async getSurgeryRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const surgeryRequests = await SurgeryService.getSurgeryRequests(req.query);

      return successResponse({ res, message: SUCCESS, data: surgeryRequests, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create operation note
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, operation note data
   */
  static async createOperationNote(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateOperationNote(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const operationNote = await SurgeryService.createOperationNote({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, httpCode: 201, data: operationNote, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get operation notes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with operation notes data
   */
  static async getOperationNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const operationNotes = await SurgeryService.getOperationNotes(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: operationNotes, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }
}
