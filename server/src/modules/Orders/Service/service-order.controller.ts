import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import {
  DATA_DELETED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../../AdminSettings/messages/response-messages';
import { ServiceOrderService } from './service-order.service';
import { validateBulkService, validateDeleteService } from './validations';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../../core/constants';
import { isEmpty } from 'lodash';
import { EMPTY_REQUEST_BODY } from './messages/response-messages';
import { PrescribedBulkServiceBody } from './types/service-order.types';

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
  static async orderBulkService(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
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

  /**
   * get prescribed services
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with prescribed services data
   */
  static async getPrescribedServices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const services = await ServiceOrderService.getPrescribedServices(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: services,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a prescribed service
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed service data
   */
  static async updatePrescribedService(
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
      const service = await ServiceOrderService.updatePrescribedService(req.body);

      return successResponse({
        res,
        data: service,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete services
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, prescribed services data
   */
  static async deletePrescribedService(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDeleteService(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const services = await ServiceOrderService.deletePrescribedService(req.body);

      return successResponse({
        res,
        data: services,
        message: DATA_DELETED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}
