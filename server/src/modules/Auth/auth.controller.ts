import AuthService from './auth.service';
import { validateForgotPassword, validateLogin } from './validations';
import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../../common/responses/success-responses';
import {
  FORGOT_PASSWORD_MESSAGE,
  LOGIN_MESSAGE,
  PASSWORD_CHANGE_MESSAGE,
} from './messages/response-messages';

/**
 *
 *
 * @class AuthController
 */
class AuthController {
  /**
   * login a staff
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, staff data and access token
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const token = await AuthService.loginService(req.body);

      return successResponse({
        res,
        data: token,
        httpCode: 200,
        message: LOGIN_MESSAGE,
      });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * change staff password
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staff data
   */
  static async changePassword(req, res, next) {
    try {
      const staff = await AuthService.changePasswordService({ ...req.body, user_id: req.user.sub });

      return successResponse({ res, httpCode: 200, message: PASSWORD_CHANGE_MESSAGE, data: staff });
    } catch (e) {
      return next(e);
    }
  }

  /**
   * forgot password
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with staff data
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { error } = validateForgotPassword(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
      const staff = await AuthService.forgotPassword(req.body);
      return successResponse({ res, httpCode: 200, data: staff, message: FORGOT_PASSWORD_MESSAGE });
    } catch (e) {
      return next(e);
    }
  }
}
export default AuthController;
