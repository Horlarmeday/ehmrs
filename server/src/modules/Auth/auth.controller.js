import AuthService from './auth.service';
import { validateForgotPassword, validateLogin } from './validations';
import { APIError } from '../../util/apiError';

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
  static async login(req, res, next) {
    const { error } = validateLogin(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const { token, staff } = await AuthService.loginService(req.body);

      return res.status(200).json({
        message: 'Login successful!',
        token,
        data: staff,
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
      const staff = await AuthService.changePasswordService(
        Object.assign(req.body, { user_id: req.user.sub })
      );

      return res.status(200).json({
        message: 'Password changed!',
        data: staff,
      });
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
  static async forgotPassword(req, res, next) {
    const { error } = validateForgotPassword(req.body);
    if (error) throw new APIError('ERROR', 400, error.details[0].message);

    try {
      const staff = await AuthService.forgotPassword(req.body);
      return res.status(200).json({
        message: 'New password has been sent to your phone.',
        data: staff,
      });
    } catch (e) {
      return next(e);
    }
  }
}
export default AuthController;
