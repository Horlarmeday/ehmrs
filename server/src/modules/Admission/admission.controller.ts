import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Response, Request } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { AdmissionService } from './admission.service';
import { validateAdmission } from './validations';
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
      const admission = await AdmissionService.getPatientAdmission(req.query.visitId);

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
}
