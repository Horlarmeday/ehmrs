import { successResponse, SuccessResponse } from '../../../common/responses/success-responses';
import { errorResponse } from '../../../common/responses/error-responses';
import { StatusCodes } from '../../../core/helpers/helper';
import {
  DATA_DELETED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../../AdminSettings/messages/response-messages';
import {
  validateAdditionalCreateTreatment,
  validateBulkDrugsPrescription,
  validateCreateTreatmentData,
  validateDeleteAdditionalItem,
  validateDeleteDrug,
  validateDrugPrescription,
  validateOrderAdditionalItems,
} from './validations';
import PharmacyOrderService from './pharmacy-order.service';
import { SUCCESS } from '../../../core/constants';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { EMPTY_REQUEST_BODY } from './messages/response-messages';

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
      const drug = await PharmacyOrderService.prescribeDrug({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({
        res,
        data: drug,
        message: DATA_SAVED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * prescribe bulk drugs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drugs data
   */
  static async orderBulkDrugs(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateBulkDrugsPrescription(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const drugs = await PharmacyOrderService.prescribedBulkDrugs(
        req.body,
        req.user.sub,
        +req.params.id
      );

      return successResponse({
        res,
        data: drugs,
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
   * update a prescribed drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drug data
   */
  static async updatePrescribedDrug(
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
      const drug = await PharmacyOrderService.updatePrescribedDrug(req.body);

      return successResponse({
        res,
        data: drug,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update bulk prescribed drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drug data
   */
  static async updateBulkPrescribedDrug(
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
      const drugs = await PharmacyOrderService.updateBulkPrescribedDrug(req.body);

      return successResponse({
        res,
        data: drugs,
        message: DATA_UPDATED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update bulk additional items
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, additional items data
   */
  static async updateBulkAdditionalItems(
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
      const items = await PharmacyOrderService.updateBulkAdditionalItems(req.body);

      return successResponse({
        res,
        data: items,
        message: DATA_UPDATED,
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

  /**
   * delete prescribed drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, prescribed drug data
   */
  static async deletePrescribedDrug(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDeleteDrug(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const drug = await PharmacyOrderService.deletePrescribedDrug(req.body);

      return successResponse({
        res,
        data: drug,
        message: DATA_DELETED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete additional item
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, additional item data
   */
  static async deleteAdditionalItem(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDeleteAdditionalItem(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const item = await PharmacyOrderService.deleteAdditionalItem(req.body);

      return successResponse({
        res,
        data: item,
        message: DATA_DELETED,
        httpCode: StatusCodes.CREATED,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create additional treatment data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {SuccessResponse} json object with status, patient additional treatment data
   */
  static async createAdditionalTreatments(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateAdditionalCreateTreatment(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const treatments = await PharmacyOrderService.createAdditionalTreatment(
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
   * get patient additional treatment data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with patient treatment data
   */
  static async getAdditionalTreatments(req: Request, res: Response, next: NextFunction) {
    try {
      const treatments = await PharmacyOrderService.getAdditionalTreatments(req.query);

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

  /**
   * get additional items per visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with additional items data
   */
  static async getAdditionalItemsPerVisit(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const items = await PharmacyOrderService.getAdditionalItems(+id);

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
   * get drugs prescribed per visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with prescribed drugs data
   */
  static async getPrescribedDrugsPerVisit(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const drugs = await PharmacyOrderService.getDrugsPrescribed(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: drugs,
      });
    } catch (e) {
      return next(e);
    }
  }
}
