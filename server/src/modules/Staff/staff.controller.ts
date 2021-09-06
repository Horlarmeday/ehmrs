import StaffService from './staff.service';
import { validateStaff } from './validations';
import { successResponse } from '../../common/responses/success-responses';
import { ACCOUNT_CREATED, SUCCESS, UPDATED_PROFILE } from './messages/response-messages';

/**
 *
 *
 * @class StaffController
 */
class StaffController {
  /**
   * create a staff record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, staff data and access token
   */
  static async createStaffAccount(req, res, next) {
    const { error } = validateStaff(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const staff = await StaffService.createStaffService(req.body);

      return successResponse({ res, message: ACCOUNT_CREATED, data: staff, httpCode: 201 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * show staff profile
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staff profile data
   */
  static async getStaffProfile(req, res, next) {
    try {
      const staff = await StaffService.getStaffById(req.user.sub);

      return successResponse({ res, httpCode: 200, data: staff, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get one staff profile
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staff profile data
   */
  static async getOneStaff(req, res, next) {
    try {
      const staff = await StaffService.getStaffById(req.params.id);

      return successResponse({ res, httpCode: 200, data: staff, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * update staff profile data such as name, email, phone, etc
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staff profile data
   */
  static async updateStaffProfile(req, res, next) {
    try {
      const staff = await StaffService.updateStaffService(req.body);

      return successResponse({ res, message: UPDATED_PROFILE, data: staff, httpCode: 200 });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * get all staffs
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staffs data
   */
  static async getStaffs(req, res, next) {
    try {
      const staffs = await StaffService.getStaffs(req.query);

      return successResponse({ res, httpCode: 200, data: staffs, message: SUCCESS });
    } catch (e) {
      return next(e);
    }
  }
}
export default StaffController;
