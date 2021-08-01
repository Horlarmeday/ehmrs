/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { findStaffByPhone, findStaffByUsername, getStaffById } from '../Staff/staff.repository';
import { APIError } from '../../util/apiError';
import { sendGeneratedPassword } from '../../command/schedule';

const uuidv1 = require('uuid/v4');

class AuthService {
  /**
   * login user account
   *
   * @static
   * @returns {json} json object with user data
   * @param body
   * @memberOf AuthService
   */
  static async loginService(body) {
    const staff = await findStaffByUsername(body);
    if (!staff) throw new APIError('INVALID', 400, 'Invalid username or password');

    const validPassword = await bcrypt.compare(body.password, staff.password);
    if (!validPassword) throw new APIError('INVALID', 400, 'Invalid username or password');

    this.checkStaffStatus(staff);

    const token = staff.generateAuthToken();

    return {
      token,
      staff,
    };
  }

  static checkStaffStatus(staff) {
    if (staff.status === 'Inactive')
      throw new APIError(
        'INVALID',
        401,
        'This account has been deactivated, please contact support'
      );
    return true;
  }

  /**
   * change user password
   *
   * @static
   * @returns {json} json object with user data
   * @param body
   * @memberOf AuthService
   */
  static async changePasswordService(body) {
    const { newPassword, oldPassword, confirmPassword, user_id } = body;

    const user = await getStaffById(user_id);
    if (!user) throw new APIError('NOT FOUND', 400, 'Invalid user id');

    if (newPassword !== confirmPassword)
      throw new APIError('INVALID', 400, 'Your new password must be equal with confirm password');

    const isSamePassword = await bcrypt.compare(oldPassword, user.password);
    if (!isSamePassword) throw new APIError('INVALID', 400, 'Old password not correct');

    const salt = await bcrypt.genSalt(16);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return user;
  }

  /**
   * forgot password
   *
   * @static
   * @returns {json} json object with staff data
   * @param data
   * @memberOf AuthService
   */
  static async forgotPassword(data) {
    const { phone } = data;

    const staff = await findStaffByPhone(phone);
    if (!staff) throw new APIError('INVALID', 400, 'Invalid phone number');
    // get random letters
    const uniq = uuidv1();
    const tempPassword = uniq.substr(uniq.length - 7).toUpperCase();
    // save new password
    const salt = await bcrypt.genSalt(12);
    staff.password = await bcrypt.hash(tempPassword, salt);
    await staff.save();

    // send staff sms
    const message = `Your new password is ${tempPassword}. Change as soon as you login`;
    await sendGeneratedPassword(message, staff.phone);

    return staff;
  }
}

export default AuthService;
