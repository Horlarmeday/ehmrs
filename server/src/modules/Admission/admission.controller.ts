import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Response, Request } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { AdmissionService } from './admission.service';
import {
  validateAdmission,
  validateCarePlan,
  validateIOChart,
  validateObservation,
} from './validations';
import { SUCCESS } from '../../core/constants';

export class AdmissionController {
  /**
   * admit a patient into a ward
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, admission data
   */
  static async admitPatient(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateAdmission(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const admission = await AdmissionService.admitPatient({
        ...req.body,
        admitted_by: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: admission, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient admission data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with admission data
   */
  static async getPatientAdmission(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const admission = await AdmissionService.getPatientAdmission(req.query);

      return successResponse({ res, message: SUCCESS, data: admission, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Recommend patient for discharge
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, admission data
   */
  static async sendForDischarge(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const admission = await AdmissionService.updateAdmission(req.body);

      return successResponse({ res, httpCode: 200, data: admission, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get admitted patients
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with admission data
   */
  static async getAdmittedPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const admissions = await AdmissionService.getAdmittedPatients(req.query);

      return successResponse({ res, message: SUCCESS, data: admissions, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a patient observation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, observation data
   */
  static async createObservation(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateObservation(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const observation = await AdmissionService.createObservation(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({ res, httpCode: 201, data: observation, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient observations
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with observations data
   */
  static async getPatientObservations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const observations = await AdmissionService.getObservations(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: observations, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a patient care plan
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, care plan data
   */
  static async createCarePlan(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCarePlan(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const carePlan = await AdmissionService.createCarePlan(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({ res, httpCode: 201, data: carePlan, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient care plans
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with care plans data
   */
  static async getPatientCarePlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const carePlans = await AdmissionService.getCarePlans(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: carePlans, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a patient IO Chart
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, IO Chart data
   */
  static async createIOChart(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateIOChart(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const ioChart = await AdmissionService.createIOChart(req.body, +req.params.id, req.user.sub);

      return successResponse({ res, httpCode: 201, data: ioChart, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient IO Charts
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with IO Charts data
   */
  static async getPatientIOCharts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const ioCharts = await AdmissionService.getIOCharts(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: ioCharts, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }
}
