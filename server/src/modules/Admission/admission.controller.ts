import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
} from '../AdminSettings/messages/response-messages';
import { NextFunction, Response, Request } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { AdmissionService } from './admission.service';
import {
  validateAdmission,
  validateCarePlan,
  validateChangeWard,
  validateDischargePatient,
  validateIOChart,
  validateNursingNote,
  validateObservation,
  validatePostnatalInfo,
  validateWardRound,
} from './validations';
import { SUCCESS } from '../../core/constants';
import { validateCreateDeliveryInfo } from './validations';

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
        admitted_by: req.user,
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
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const admission = await AdmissionService.updateAdmission(req.body, req.user.sub);

      return successResponse({ res, httpCode: 201, data: admission, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * Change patient ward
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ward data
   */
  static async changeWard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateChangeWard(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const admission = await AdmissionService.changePatientWard(req.body, +req.params.id);

      return successResponse({ res, httpCode: 201, data: admission, message: DATA_UPDATED });
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

  /**
   * create a patient Nursing notes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, Nursing notes data
   */
  static async createNursingNote(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateNursingNote(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const nursingNote = await AdmissionService.createNursingNote(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({ res, httpCode: 201, data: nursingNote, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient Nursing notes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with Nursing notes data
   */
  static async getPatientNursingNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const nursingNotes = await AdmissionService.getNursingNotes(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: nursingNotes, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * discharge patient
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, discharge data
   */
  static async dischargePatient(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDischargePatient(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    try {
      const admission = await AdmissionService.dischargePatient(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({ res, httpCode: 201, data: admission, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get discharge records
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with discharge data
   */
  static async getDischargeRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const discharges = await AdmissionService.getDischargeRecords(req.query);

      return successResponse({ res, message: SUCCESS, data: discharges, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a discharge record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with discharge data
   */
  static async getOneDischargeRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const discharge = await AdmissionService.getOneDischargeRecord(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: discharge, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get doctor prescriptions
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests, drugs, investigations etc.  data
   */
  static async getDoctorPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const summary = await AdmissionService.getDoctorPrescriptions(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: summary, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get admission history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with tests, drugs, investigations etc.  data
   */
  static async getAdmissionHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const summary = await AdmissionService.getAdmissionHistory(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: summary, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a patient Nursing notes
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, Nursing notes data
   */
  static async createWardRound(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateWardRound(req.body);
    if (error)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });

    try {
      const wardRound = await AdmissionService.createWardRound(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({ res, httpCode: 201, data: wardRound, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get patient ward rounds
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with ward rounds data
   */
  static async getWardRounds(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const wardRounds = await AdmissionService.getWardRounds(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: wardRounds, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  static async createDeliveryInfo(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateCreateDeliveryInfo(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const delivery = await AdmissionService.createDeliveryInfo(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: delivery,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getDeliveryInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveries = await AdmissionService.getDeliveryInfo(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: deliveries,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async createPostNatal(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validatePostnatalInfo(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });
    try {
      const postNatal = await AdmissionService.createPostnatal(
        req.body,
        +req.params.id,
        req.user.sub
      );

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: postNatal,
      });
    } catch (e) {
      return next(e);
    }
  }

  static async getPostnatalInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveries = await AdmissionService.getPostnatal(+req.params.id);
      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_RETRIEVED,
        data: deliveries,
      });
    } catch (e) {
      return next(e);
    }
  }
}
