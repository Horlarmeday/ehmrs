import StaffService from './staff.service';
import { getStaffById } from './staff.repository';
import { validateStaff } from './validations';

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

      return res.status(201).json({
        message: 'Successful, account created!',
        data: staff,
      });
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
      const staff = await getStaffById(req.user.sub);
      if (!staff) return res.status(400).json({ message: 'invalid staff id' });

      return res.status(200).json({
        message: 'Success',
        data: staff,
      });
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
      const staff = await getStaffById(req.params.id);
      if (!staff) return res.status(400).json({ message: 'invalid staff id' });

      return res.status(200).json({
        message: 'Success',
        data: staff,
      });
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

      return res.status(200).json({
        message: 'Profile updated successfully',
        data: staff,
      });
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

      return res.status(200).json({
        message: 'Data retrieved',
        data: staffs,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default StaffController;
