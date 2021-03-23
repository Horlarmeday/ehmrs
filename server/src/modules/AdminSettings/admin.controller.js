/* eslint-disable camelcase */
import AdminService from './admin.service';
import {
  validateBed,
  validateDepartment,
  validateService,
  validateUnit,
  validateWard,
} from './validations';
import { getBeds, getBedsInAWard } from './admin.repository';
import { APIError } from '../../util/apiError';

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
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const department = await AdminService.createDepartmentService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: department,
      });
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

      return res.status(200).json({
        message: 'Data retrieved!',
        data: departments,
      });
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
    if (!department_id) throw new APIError('ERROR', 400, 'Department id is required');

    try {
      const department = await AdminService.updateDepartmentService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: department,
      });
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
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const unit = await AdminService.createUnitService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: unit,
      });
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

      return res.status(200).json({
        message: 'Data retrieved!',
        data: units,
      });
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
    if (!unit_id) throw new APIError('ERROR', 400, 'Unit id is required');

    try {
      const unit = await AdminService.updateUnitService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: unit,
      });
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
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const ward = await AdminService.createWardService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: ward,
      });
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

      return res.status(200).json({
        message: 'Data retrieved!',
        data: wards,
      });
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
    if (!ward_id) throw new APIError('ERROR', 400, 'Ward id is required');

    try {
      const ward = await AdminService.updateWardService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: ward,
      });
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
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const bed = await AdminService.createBedService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: bed,
      });
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
  static async getBeds(req, res, next) {
    try {
      const beds = await getBeds();

      return res.status(200).json({
        message: 'Data retrieved!',
        data: beds,
      });
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
  static async updateBed(req, res, next) {
    const { bed_id } = req.body;
    if (!bed_id) throw new APIError('ERROR', 400, 'Bed id is required');

    try {
      const bed = await AdminService.updateBedService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: bed,
      });
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
  static async getBedsInAWard(req, res, next) {
    const { ward_id } = req.body;
    if (!ward_id) throw new APIError('ERROR', 400, 'Ward id is required');

    try {
      const beds = await getBedsInAWard(ward_id);

      return res.status(200).json({
        message: 'Successful! Data retrieved',
        data: beds,
      });
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
  static async createService(req, res, next) {
    const { error } = validateService(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const service = await AdminService.createHospitalService(
        Object.assign(req.body, { staff_id: req.user.sub })
      );

      return res.status(201).json({
        message: 'Successful! Data saved',
        data: service,
      });
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
    if (!service_id) throw new APIError('ERROR', 400, 'Service id is required');

    try {
      const service = await AdminService.updateHospitalService(req.body);

      return res.status(200).json({
        message: 'Successful! Data updated',
        data: service,
      });
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

      return res.status(200).json({
        message: 'Data retrieved!',
        data: services,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default AdminController;
