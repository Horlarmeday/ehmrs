import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import {
  DATA_DELETED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../../AdminSettings/messages/response-messages';
import { RadiologyOrderService } from './radiology-order.service';
import { validateBulkInvestigationTest, validateDeleteInvestigation } from './validations';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../../core/constants';
import { isEmpty } from 'lodash';
import { EMPTY_REQUEST_BODY } from './messages/response-messages';

export class RadiologyOrderController {
  /**
   * order an investigation test
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, investigation tests data
   */
  static async orderInvestigationTest(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateBulkInvestigationTest(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const investigations = await RadiologyOrderService.orderBulkInvestigationService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        data: investigations,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get prescribed investigations
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with prescribed investigations data
   */
  static async getPrescribedInvestigations(req: Request, res: Response, next: NextFunction) {
    try {
      const investigations = await RadiologyOrderService.getPrescribedInvestigations(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: investigations,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a prescribed investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed investigation data
   */
  static async updatePrescribedInvestigation(
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
      const investigation = await RadiologyOrderService.updatePrecribedInvestigation(req.body);

      return successResponse({
        res,
        data: investigation,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete a prescribed investigation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed investigation data
   */
  static async deletePrescribedInvestigation(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDeleteInvestigation(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const investigation = await RadiologyOrderService.deleteInvestigation(req.body);

      return successResponse({
        res,
        data: investigation,
        message: DATA_DELETED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }
}
