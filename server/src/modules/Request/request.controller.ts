import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { RequestService } from './request.service';
import { validateCreateRequests, validateUpdateRequestsStatus } from './validations';

export class RequestController {
  /**
   * create bulk requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requests data
   */
  static async createBulkRequest(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCreateRequests(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    try {
      const requests = await RequestService.createBulkRequest(req.body.requests, req.user.sub);
      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: requests,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requests data
   */
  static async getRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const requests = await RequestService.getRequests(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: requests,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create bulk requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requests data
   */
  static async updateRequestStatus(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateUpdateRequestsStatus(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    try {
      const requests = await RequestService.processRequests(req.body.requests, req.user.sub);
      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: requests,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get current user requests
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, requests data
   */
  static async getCurrentUserRequests(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const requests = await RequestService.getCurrentUserRequests(req.query, req.user.sub);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: requests,
      });
    } catch (e) {
      return next(e);
    }
  }
}
