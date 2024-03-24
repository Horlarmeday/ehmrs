import { validateFetchTriage, validateTriage } from './validations';
import TriageService from './triage.service';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_RETRIEVED, DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { EMPTY_BODY } from './messages/response.messages';

class TriageController {
  /**
   * create a patient vital signs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, vital signs data
   */
  static async createTriage(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateTriage(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const triage = await TriageService.createTriageService(
        Object.assign(req.body, { staff_id: req.user.sub, visit_id: req.params.id })
      );

      return successResponse({ res, httpCode: 201, data: triage, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all triage done in a visit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with triage data
   */
  static async getVisitTriage(req: Request, res: Response, next: NextFunction) {
    try {
      const triage = await TriageService.getVisitTriage(req.params.id);

      return successResponse({ res, httpCode: 200, data: triage, message: DATA_RETRIEVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one triage
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with triage data
   */
  static async getOneTriage(req: Request, res: Response, next: NextFunction) {
    const error = isEmpty(req.query);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: EMPTY_BODY,
      });

    try {
      const triage = await TriageService.getOneTriage(req.query);

      return successResponse({ res, httpCode: 200, data: triage, message: DATA_RETRIEVED });
    } catch (e) {
      return next(e);
    }
  }
}
export default TriageController;
