/* eslint-disable camelcase */
import {
  validateDispenseDrug,
  validateDosageForm,
  validateGenericDrug,
  validateMeasurement,
  validateReturnDrug,
  validateRouteOfAdministration,
} from './validations';
import PharmacyService from './pharmacy.service';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from '../AdminSettings/messages/response-messages';
import {
  DOSAGE_FORM_REQUIRED,
  DRUG_DISPENSED,
  DRUG_REQUIRED,
  DRUG_RETURNED,
  MEASUREMENT_REQUIRED,
  ROUTE_REQUIRED,
} from './messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { NextFunction, Request, Response } from 'express';

/**
 *
 *
 * @class PharmacyController
 */
class PharmacyController {
  /**
   * create a generic drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, generic drug data
   */
  static async createGenericDrug(req, res, next) {
    const { error } = validateGenericDrug(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const drug = await PharmacyService.createGenericDrugService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a generic drug
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, generic drug data
   */
  static async updateGenericDrug(req, res, next) {
    const { drug_id } = req.body;
    if (!drug_id)
      return errorResponse({ res, message: DRUG_REQUIRED, httpCode: StatusCodes.BAD_REQUEST });

    try {
      const drug = await PharmacyService.updateGenericDrugService(req.body);

      return successResponse({ res, httpCode: StatusCodes.OK, message: DATA_UPDATED, data: drug });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get generic drugs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with generic drugs data
   */
  static async getGenericDrugs(req, res, next) {
    try {
      const drugs = await PharmacyService.getGenericDrugs(req.query);

      return successResponse({ res, httpCode: StatusCodes.OK, message: SUCCESS, data: drugs });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a dosage form
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dosage form data
   */
  static async createDosageForm(req, res, next) {
    const { error } = validateDosageForm(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const dosageForm = await PharmacyService.createDosageFormService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: dosageForm,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a dosage form
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, dosage form data
   */
  static async updateDosageForm(req, res, next) {
    const { dosage_form_id } = req.body;
    if (!dosage_form_id)
      return errorResponse({
        res,
        message: DOSAGE_FORM_REQUIRED,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const dosageForm = await PharmacyService.updateDosageFormService(req.body);

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: DATA_UPDATED,
        data: dosageForm,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get dosage forms
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with dosage forms data
   */
  static async getDosageForms(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse> {
    try {
      const dosageForms = await PharmacyService.getDosageForms();

      return successResponse({
        res,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
        data: dosageForms,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * create a measurement
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, measurement data
   */
  static async createMeasurement(req, res: Response, next: NextFunction): Promise<SuccessResponse> {
    const { error } = validateMeasurement(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const measurement = await PharmacyService.createMeasurementService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: measurement,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   * update a measurement
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, measurement data
   */
  static async updateMeasurement(req: Request, res: Response, next: NextFunction) {
    const { measurement_id } = req.body;
    if (!measurement_id)
      return errorResponse({
        res,
        httpCode: StatusCodes.BAD_REQUEST,
        message: MEASUREMENT_REQUIRED,
      });

    try {
      const measurement = await PharmacyService.updateMeasurementService(req.body);

      return successResponse({
        res,
        message: DATA_UPDATED,
        httpCode: StatusCodes.OK,
        data: measurement,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get measurements
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with measurements data
   */
  static async getMeasurements(req, res, next) {
    try {
      const measurements = await PharmacyService.getMeasurements();

      return successResponse({
        res,
        data: measurements,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a route of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, route of administration data
   */
  static async createRouteOfAdministration(req, res, next) {
    const { error } = validateRouteOfAdministration(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const route = await PharmacyService.createRouteService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DATA_SAVED,
        data: route,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a route of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, route of administration data
   */
  static async updateRouteOfAdministration(req: Request, res: Response, next: NextFunction) {
    const { route_id } = req.body;
    if (!route_id)
      return errorResponse({ res, message: ROUTE_REQUIRED, httpCode: StatusCodes.BAD_REQUEST });

    try {
      const route = await PharmacyService.updateRouteService(req.body);

      return successResponse({ res, httpCode: StatusCodes.OK, message: DATA_UPDATED, data: route });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get routes of administration
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with routes of administration data
   */
  static async getRoutesOfAdministration(req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await PharmacyService.getRoutesOfAdministration();

      return successResponse({ res, data: routes, message: SUCCESS, httpCode: StatusCodes.OK });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get routes of administration & measurements under a dosage form
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with routes of administration & measurements data
   */
  static async getRoutesAndMeasurements(req, res, next) {
    const { dosage_form_id } = req.body;

    try {
      const routes = await PharmacyService.getRoutesAndMeasurements(dosage_form_id);

      return successResponse({ res, data: routes, message: SUCCESS, httpCode: StatusCodes.OK });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * PRESCRIPTIONS
   */
  /**
   * get drugs prescriptions
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with drug prescriptions data
   */
  static async getDrugPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await PharmacyService.getDrugPrescriptions(req.query);

      return successResponse({ res, data: routes, message: SUCCESS, httpCode: StatusCodes.OK });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one prescription
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns json object with drug prescription data
   */
  static async getOnePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const drugPrescription = await PharmacyService.getOneDrugPrescription(req.params.id);

      return successResponse({
        res,
        data: drugPrescription,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * dispense drug from inventory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<SuccessResponse<any>>} json object with status, prescribed drug data
   */
  static async dispenseDrug(
    req: Request & { user: Record<any, string> },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse<any> | void> {
    const { error } = validateDispenseDrug(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const drug = await PharmacyService.dispenseDrug({
        ...req.body,
        staff_id: req.user.sub,
        drug_prescription_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DRUG_DISPENSED,
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * dispense drug from inventory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<SuccessResponse<any>>} json object with status, item inventory history data
   */
  static async returnDrugToInventory(
    req: Request & { user: Record<any, string> },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse<any> | void> {
    const { error } = validateReturnDrug(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const drug = await PharmacyService.returnDrugToInventory({
        ...req.body,
        staff_id: req.user.sub,
        drug_prescription_id: req.params.id,
      });

      return successResponse({
        res,
        httpCode: StatusCodes.CREATED,
        message: DRUG_RETURNED,
        data: drug,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get drugs prescription history
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns json object with drug prescription data
   */
  static async getDrugPrescriptionsHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const drugPrescriptions = await PharmacyService.getDrugsPrescriptionsHistory(req.query);

      return successResponse({
        res,
        data: drugPrescriptions,
        httpCode: StatusCodes.OK,
        message: SUCCESS,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default PharmacyController;
