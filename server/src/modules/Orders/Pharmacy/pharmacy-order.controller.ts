import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import { DATA_SAVED } from '../../AdminSettings/messages/response-messages';
import {
  validateCreateTreatmentData,
  validateDrugPrescription,
  validateOrderAdditionalItems,
} from './validations';
import PharmacyOrderService from './pharmacy-order.service';
import { SUCCESS } from '../../../core/constants';
import { NextFunction, Request, Response } from 'express';

export class PharmacyOrderController {
  /**
   * prescribe a drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drug data
   */
  static async orderDrug(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
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

  /**
   * prescribe a drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drug data
   */
  static async orderAdditionalItems(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateOrderAdditionalItems(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const tests = await PharmacyOrderService.prescribeAdditionalItems(
        req.body,
        req.user.sub,
        +req.params.id
      );

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
   * get pharmacy prescribed drugs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with prescribed drugs data
   */
  static async getPrescribedDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await PharmacyOrderService.getPrescribedDrugs(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get pharmacy prescribed additional items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with additional items data
   */
  static async getPrescribedAdditionalItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await PharmacyOrderService.getPrescribedAdditionalItems(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: items,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create treatment data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, patient treatment data
   */
  static async createTreatmentData(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCreateTreatmentData(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const treatments = await PharmacyOrderService.createPatientTreatment(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        data: treatments,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient treatment data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with patient treatment data
   */
  static async getPatientTreatmentData(req: Request, res: Response, next: NextFunction) {
    try {
      const treatments = await PharmacyOrderService.getPatientTreatmentData(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: treatments,
      });
    } catch (e) {
      return next(e);
    }
  }
}
