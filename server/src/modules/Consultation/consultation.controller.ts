import { validateDiagnosis, validateObservation } from './validations';
import ConsultationService from './consultation.service';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED } from '../AdminSettings/messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { errorResponse } from '../../common/responses/error-responses';
import { DOSAGE_FORM_REQUIRED } from '../Pharmacy/messages/response-messages';
import { StatusCodes } from '../../core/helpers/helper';

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
  static async getConsultationSummary(req, res, next) {
    try {
      const summary = await ConsultationService.getConsultationSummary(req.params.id);

      return successResponse({ res, message: SUCCESS, data: summary, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }
}

export default ConsultationController;
