/* eslint-disable camelcase */
import {
  validateCashPatient,
  validateDependant,
  validateHealthInsurancePatient,
  validateOrdinaryPatient,
} from './validations';
import PatientService from './patient.service';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import { NextFunction, Request, Response } from 'express';
import { SUCCESS } from '../../core/constants';
import { PATIENT_ID_REQUIRED } from './messages/response-messages';

class PatientController {
  /**
   * create a cash patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createCashPatient(req, res, next): Promise<SuccessResponse> {
    const { error } = validateCashPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createCashPatientService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a health insurance patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createHealthInsurancePatient(req, res, next): Promise<SuccessResponse> {
    const { error } = validateHealthInsurancePatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createInsurancePatientService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a ordinary patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createOrdinaryPatient(
    req,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateOrdinaryPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createOrdinaryPatientService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * create a dependant record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dependant data
   */
  static async createDependant(req, res, next) {
    const { error } = validateDependant(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const dependant = await PatientService.createDependantService({
        ...req.body,
        staff_id: req.user.sub,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: dependant,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patients
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patients data
   */
  static async getPatients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const patients = await PatientService.getPatients(req.query);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patients,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * update a patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async updatePatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { patient_id } = req.body;
    if (!patient_id)
      return errorResponse({
        res,
        message: PATIENT_ID_REQUIRED,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.updatePatientService(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * get a patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getPatientProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.getPatientProfile(id);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }
}
export default PatientController;
