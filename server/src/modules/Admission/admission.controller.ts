import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Response } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { AdmissionService } from './admission.service';
import { validateAdmission } from './validations';
import AdminService from '../AdminSettings/admin.service';
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
  static async admitPatient(req, res: Response, next: NextFunction) {
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
  static async getPatientAdmission(req, res, next) {
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
  static async sendForDischarge(req, res: Response, next: NextFunction) {
    try {
      const admission = await AdmissionService.updateAdmission(req.body);

      return successResponse({ res, httpCode: 200, data: admission, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }
}
