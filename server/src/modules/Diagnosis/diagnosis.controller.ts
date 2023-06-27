import { validateImaging } from '../Radiology/validations';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { RadiologyService } from '../Radiology/radiology.service';
import { successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { validateICD10Disease, validateICPC2Disease } from './validations';
import { DiagnosisService } from './diagnosis.service';

export class DiagnosisController {
  /**
   * create an ICD10 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICD10 disease data
   */
  static async createICD10Disease(req, res, next) {
    const { error } = validateICD10Disease(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const icd10Disease = await DiagnosisService.createICD10Disease(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: icd10Disease,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create an ICPC2 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICPC2 disease data
   */
  static async createICPC2Disease(req, res, next) {
    const { error } = validateICPC2Disease(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const icpc2Disease = await DiagnosisService.createICPC2Disease(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: icpc2Disease,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get ICD10 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICD10 disease data
   */
  static async getICD10Disease(req, res, next) {
    try {
      const icd10Diseases = await DiagnosisService.getICD10Diseases(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: icd10Diseases,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an ICD10 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICD10 disease data
   */
  static async updateICD10Disease(req, res, next) {
    const { disease_id } = req.body;
    if (!disease_id)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: 'Disease id is required',
      });

    try {
      const icd10Disease = await DiagnosisService.updateICD10Service(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: icd10Disease,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get ICPC2 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICPC2 disease data
   */
  static async getICPC2Disease(req, res, next) {
    try {
      const icpc2Diseases = await DiagnosisService.getICPC2Diseases(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: icpc2Diseases,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update an ICPC2 disease
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ICPC2 disease data
   */
  static async updateICPC2Disease(req, res, next) {
    const { disease_id } = req.body;
    if (!disease_id)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: 'Disease id is required',
      });

    try {
      const icpc2Disease = await DiagnosisService.updateICPC2Service(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: icpc2Disease,
      });
    } catch (e) {
      return next(e);
    }
  }
}
