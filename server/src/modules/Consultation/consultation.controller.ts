import { validateDiagnosis, validateObservation } from './validations';
import ConsultationService from './consultation.service';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_RETRIEVED, DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { NextFunction, Request, Response } from 'express';

class ConsultationController {
  /**
   * create a patient observation
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, observation data
   */
  static async createObservation(req, res, next) {
    const { error } = validateObservation(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const observation = await ConsultationService.createObservationService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, message: DATA_SAVED, data: observation, httpCode: 201 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a patient diagnosis - DEPRECATED
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, diagnosis data
   */
  static async createDiagnosis(req, res, next) {
    const { error } = validateDiagnosis(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const diagnosis = await ConsultationService.createDiagnosisService({
        ...req.body,
        staff_id: req.user.sub,
        visit_id: req.params.id,
      });

      return successResponse({ res, httpCode: 201, data: diagnosis, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get consultation summary
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with consultation summary data
   */
  static async getConsultationSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await ConsultationService.getConsultationSummary(req.params.id);

      return successResponse({ res, message: SUCCESS, data: summary, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get consultation history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with consultation history data
   */
  static async getVisitsHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const history = await ConsultationService.getVisitsHistory(req.query);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: history,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get consultation diagnoses and findings
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with consultation diagnoses amd findings data
   */
  static async getDiagnosesAndFindings(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await ConsultationService.getDiagnosesAndFindings(req.params.id);

      return successResponse({ res, message: SUCCESS, data: summary, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }
}

export default ConsultationController;
