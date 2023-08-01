/* eslint-disable camelcase */
import AdminService from './admin.service';
import {
  validateBed,
  validateDepartment,
  validateService,
  validateUnit,
  validateWard,
} from './validations';
import { successResponse } from '../../common/responses/success-responses';
import { DATA_SAVED, DATA_UPDATED } from './messages/response-messages';
import { SUCCESS } from '../../core/constants';
import { NextFunction, Request, Response } from 'express';

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
    if (error) return res.status(400).json({ message: error.details[0].message });

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
    if (!department_id) return res.status(400).json({ message: 'department id is required' });

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
    if (error) return res.status(400).json({ message: error.details[0].message });

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
    if (error) return res.status(400).json({ message: error.details[0].message });

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

      return successResponse({ res, httpCode: 200, data: ward, message: DATA_UPDATED });
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
    if (error) return res.status(400).json({ message: error.details[0].message });

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
  static async createService(req, res: Response, next: NextFunction) {
    const { error } = validateService(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

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
  static async updateService(req, res, next) {
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
  static async getServices(req, res, next) {
    try {
      const services = await AdminService.getServices(req.query);

      return successResponse({ res, httpCode: 200, data: services, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }
}
export default AdminController;
