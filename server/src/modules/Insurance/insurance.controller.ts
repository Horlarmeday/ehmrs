/* eslint-disable camelcase */
import InsuranceService from './insurance.service';
import { validateHMO, validateInsurance, validateSetInsuranceDefault } from './validations';
import { updateHMO, updateInsurance } from './insurance.repository';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';

class InsuranceController {
  /**
   * create a health insurance type
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurance data
   */
  static async createInsurance(req, res, next) {
    const { error } = validateInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const insurance = await InsuranceService.createInsuranceService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create an HMO
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMO data
   */
  static async createHMO(req, res, next) {
    const { error } = validateHMO(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const hmo = await InsuranceService.createHMOService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: hmo,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurances data
   */
  static async getInsurances(req, res, next) {
    try {
      const insurances = await InsuranceService.getInsurances(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: insurances,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMOs data
   */
  static async getHMOs(req, res, next) {
    try {
      const hmos = await InsuranceService.getHMOs(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: hmos,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, insurance data
   */
  static async updateInsurance(req, res, next) {
    const { insurance_id } = req.body;
    if (!insurance_id)
      return errorResponse({
        res,
        message: 'insurance id is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const insurance = await updateInsurance(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an HMO
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, HMO data
   */
  static async updateHMO(req, res, next) {
    const { hmo_id } = req.body;
    if (!hmo_id)
      return errorResponse({
        res,
        message: 'hmo id is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const hmo = await updateHMO(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: hmo,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Set insurance as default
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient insurance data
   */
  static async setInsuranceAsDefault(req, res, next) {
    const { error } = validateSetInsuranceDefault(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const insurance = await InsuranceService.setInsuranceAsDefault({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient insurances data
   */
  static async getPatientHealthInsurances(req, res, next) {
    try {
      const insurances = await InsuranceService.getPatientHealthInsurances(req.params.id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: insurances,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient health insurances
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<SuccessResponse | void>} json object with status, patient insurances data
   */
  static async getPatientDefaultInsurance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const insurance = await InsuranceService.getPatientActiveInsurance(+req.query.patientId);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: insurance,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default InsuranceController;
