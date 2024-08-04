/* eslint-disable camelcase */
import {
  validateCreatePatientAccount,
  validateDependant,
  validatePatientHealthInsurance,
  validateCreateEmergencyPatient,
  validateFindPatient,
  validateUpdatePatientInsurance,
  validateTogglePatientInsurance,
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
  static async createPatientAccount(req, res, next): Promise<SuccessResponse> {
    const { error } = validateCreatePatientAccount(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createPatientAccount({
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
   * add patient health insurance info
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async addPatientHealthInsurance(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validatePatientHealthInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.addPatientInsurance({
        ...req.body,
        patient_id: req.params.id,
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
   * create an emergency patient record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async createEmergencyPatientAccount(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateCreateEmergencyPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.createEmergencyPatient({
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
  static async createDependant(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
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
    try {
      const patient = await PatientService.updatePatientService({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * update a patient insurance
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async updatePatientInsurance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateUpdatePatientInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const patient = await PatientService.updatePatientInsurance({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * toggle on/off a patient insurance
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async togglePatientInsurance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateTogglePatientInsurance(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const patient = await PatientService.togglePatientInsurance({
        ...req.body,
        patient_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
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

  /**
   * get a patient
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getOnePatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.getPatientById(id);

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

  /**
   * get a patient by name and phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async getPatientByNameAndPhone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { error } = validateFindPatient(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const patient = await PatientService.getPatientByNameAndPhone(req.body);

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

  /**
   * convert dependant account to a patient account
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, patient data
   */
  static async convertDependantToPatient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    const { id } = req.params;
    try {
      const patient = await PatientService.convertDependantToPatient(+id);

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_UPDATED,
        data: patient,
      });
    } catch (e) {
      next(e);
    }
  }
}
export default PatientController;
