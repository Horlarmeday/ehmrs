/* eslint-disable camelcase */
import AdminService from './admin.service';
import {
  validateBed,
  validateCreateDefault,
  validateDeleteDefaultData,
  validateDepartment,
  validateService,
  validateUnit,
  validateWard,
} from './validations';
import { SuccessResponse, successResponse } from '../../common/responses/success-responses';
import { DATA_DELETED, DATA_SAVED, DATA_UPDATED } from './messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import { Default } from '../../database/models';
import { isEmpty } from 'lodash';
import { upload } from '../../core/helpers/multer';
import fileUpload from 'express-fileupload';
import { string } from 'joi';

/**
 *
 *
 * @class AdminController
 */
class AdminController {
  /**
   * create a department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, department data
   */
  static async createDepartment(req, res, next) {
    const { error } = validateDepartment(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const department = await AdminService.createDepartmentService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: department, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with departments data
   */
  static async getDepartments(req, res, next) {
    try {
      const departments = await AdminService.getDepartments(req.query);

      return successResponse({ res, message: SUCCESS, data: departments, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, department data
   */
  static async updateDepartment(req, res, next) {
    const { department_id } = req.body;
    if (!department_id)
      return errorResponse({
        res,
        message: 'department id is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const department = await AdminService.updateDepartmentService(req.body);

      return successResponse({ res, httpCode: 200, data: department, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a unit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, unit data
   */
  static async createUnit(req, res, next) {
    const { error } = validateUnit(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const unit = await AdminService.createUnitService({ ...req.body, staff_id: req.user.sub });

      return successResponse({ res, httpCode: 201, data: unit, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get units
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with units data
   */
  static async getUnits(req, res, next) {
    try {
      const units = await AdminService.getUnits(req.query);

      return successResponse({ res, message: SUCCESS, data: units, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a unit
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, unit data
   */
  static async updateUnit(req, res, next) {
    const { unit_id } = req.body;
    if (!unit_id) return res.status(400).json({ message: 'unit id is required' });

    try {
      const unit = await AdminService.updateUnitService(req.body);

      return successResponse({ res, httpCode: 200, data: unit, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a ward
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ward data
   */
  static async createWard(req, res, next) {
    const { error } = validateWard(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const ward = await AdminService.createWardService({ ...req.body, staff_id: req.user.sub });

      return successResponse({ res, httpCode: 201, data: ward, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get wards
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with wards data
   */
  static async getWards(req, res, next) {
    try {
      const wards = await AdminService.getWards(req.query);

      return successResponse({ res, message: SUCCESS, data: wards, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get wards and beds
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with wards(beds) data
   */
  static async getWardsAndBeds(req, res, next) {
    try {
      const wards = await AdminService.getWardsAndBeds(req.query);

      return successResponse({ res, message: SUCCESS, data: wards, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a ward
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, ward data
   */
  static async updateWard(req, res, next) {
    const { ward_id } = req.body;
    if (!ward_id) return res.status(400).json({ message: 'ward id is required' });

    try {
      const ward = await AdminService.updateWardService(req.body);

      return successResponse({ res, httpCode: 201, data: ward, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a bed
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, bed data
   */
  static async createBed(req, res, next) {
    const { error } = validateBed(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const bed = await AdminService.createBedService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: bed, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get beds
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with beds data
   */
  static async getBeds(req: Request, res: Response, next: NextFunction) {
    try {
      const beds = await AdminService.getBeds();

      return successResponse({ res, httpCode: 200, data: beds, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a bed
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, bed data
   */
  static async updateBed(req: Request, res: Response, next: NextFunction) {
    const { bed_id } = req.body;
    if (!bed_id) return res.status(400).json({ message: 'bed id is required' });

    try {
      const bed = await AdminService.updateBedService(req.body);

      return successResponse({ res, httpCode: 200, data: bed, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all beds in a ward
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, beds data
   */
  static async getBedsInAWard(req: Request, res: Response, next: NextFunction) {
    const { ward_id } = req.body;
    if (!ward_id) return res.status(400).json({ message: 'ward id is required' });

    try {
      const beds = await AdminService.getBedsInAWard(ward_id);

      return successResponse({ res, httpCode: 200, data: beds, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a service
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, service data
   */
  static async createService(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    const { error } = validateService(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const service = await AdminService.createHospitalService({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: service, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update a service
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, service data
   */
  static async updateService(req: Request, res: Response, next: NextFunction) {
    const { service_id } = req.body;
    if (!service_id) return res.status(400).json({ message: 'Service id is required' });

    try {
      const service = await AdminService.updateHospitalService(req.body);

      return successResponse({ res, httpCode: 200, data: service, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get services
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with services data
   */
  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await AdminService.getServices(req.query);

      return successResponse({ res, httpCode: 200, data: services, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * create a default
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<Default>} json object with status, default data
   */
  static async createAdminDefault(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateCreateDefault(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const adminDefault = await AdminService.createAdminDefault({
        ...req.body,
        staff_id: req.user.sub,
      });

      return successResponse({ res, httpCode: 201, data: adminDefault, message: DATA_SAVED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get defaults
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with defaults data
   */
  static async getDefaults(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const defaults = await AdminService.getDefaults();

      return successResponse({ res, message: SUCCESS, data: defaults, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get a default
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with default data
   */
  static async getOneDefault(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const adminDefault = await AdminService.getOneDefault(+req.params.id);

      return successResponse({ res, message: SUCCESS, data: adminDefault, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete a default data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<Default>} json object with status, default data
   */
  static async deleteDefaultData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const { error } = validateDeleteDefaultData(req.body);
    if (error)
      return errorResponse({
        res,
        message: error.details[0].message,
        httpCode: StatusCodes.BAD_REQUEST,
      });

    try {
      const adminDefault = await AdminService.deleteDefaultData({
        ...req.body,
      });

      return successResponse({ res, httpCode: 201, data: adminDefault, message: DATA_DELETED });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get system settings
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with default data
   */
  static async getSystemSettings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    try {
      const systemSettings = await AdminService.getSystemSettings();

      return successResponse({ res, message: SUCCESS, data: systemSettings, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * delete a default data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {Promise<Default>} json object with status, default data
   */
  static async updateSystemSettings(
    req,
    res: Response,
    next: NextFunction
  ): Promise<SuccessResponse | void> {
    const error = isEmpty(req.body);

    if (error)
      return errorResponse({
        res,
        message: 'Body cannot be empty',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    let logo: string;
    let stamp: string;
    const files = req.files;

    try {
      if (files?.logo) {
        logo = files?.logo?.[0]?.fieldname === 'logo' ? files?.logo?.[0]?.filename : null;
      }
      if (files?.stamp) {
        stamp = files?.stamp?.[0]?.fieldname === 'stamp' ? files?.stamp?.[0]?.filename : null;
      }

      const response = await AdminService.updateSystemSettings({
        ...req.body,
        organization_logo: logo,
        stamp_image: stamp,
      });

      return successResponse({ res, httpCode: 201, data: response, message: DATA_UPDATED });
    } catch (e) {
      return next(e);
    }
  }
}
export default AdminController;
