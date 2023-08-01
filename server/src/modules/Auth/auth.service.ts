/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { getStaffById, getStaffByPhone, getStaffByUsername } from '../Staff/staff.repository';
import { BadException } from '../../common/util/api-error';
import { sendGeneratedPassword } from '../../core/command/schedule';
import uuidv1 from 'uuid/v4';
import { Status } from '../Staff/interface/staff.interface';
import { ChangePasswordParam, LoginParams } from './interface/auth.interface';
import {
  DEACTIVATED_ACCOUNT,
  INCORRECT_PASSWORD,
  INVALID_CONFIRM_PASSWORD,
  INVALID_CREDENTIALS,
  INVALID_PHONE,
  INVALID_USER,
} from './messages/response-messages';
import { Staff } from '../../database/models';

class AuthService {
  /**
   * login user account
   *
   * @static
   * @returns {json} json object with user data
   * @param body
   * @memberOf AuthService
   */
  static async loginService(body: LoginParams) {
    const { username, password } = body;
    const staff = await getStaffByUsername(username);
    if (!staff) throw new BadException('INVALID', 400, INVALID_CREDENTIALS);

    const validPassword = await bcrypt.compare(password, staff.password);
    if (!validPassword) throw new BadException('INVALID', 400, INVALID_CREDENTIALS);

    this.checkStaffStatus(staff);

    return staff.generateAuthToken();
  }

  static checkStaffStatus(staff: Staff) {
    if (staff.status === Status.INACTIVE)
      throw new BadException('INVALID', 401, DEACTIVATED_ACCOUNT);
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
  static async changePasswordService(body: ChangePasswordParam): Promise<Staff> {
    const { newPassword, oldPassword, confirmPassword, user_id } = body;

    const staff = await getStaffById(user_id);
    if (!staff) throw new BadException('NOT_FOUND', 400, INVALID_USER);

    if (newPassword !== confirmPassword)
      throw new BadException('INVALID', 400, INVALID_CONFIRM_PASSWORD);

    const isSamePassword = await bcrypt.compare(oldPassword, staff.password);
    if (!isSamePassword) throw new BadException('INVALID', 400, INCORRECT_PASSWORD);

    const salt = await bcrypt.genSalt(16);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();

    return staff;
  }

  /**
   * forgot password
   *
   * @static
   * @returns {json} json object with staff data
   * @param data
   * @memberOf AuthService
   */
  static async forgotPassword(data: { phone: string }): Promise<Staff> {
    const { phone } = data;

    const staff = await getStaffByPhone(phone);
    if (!staff) throw new BadException('INVALID', 400, INVALID_PHONE);
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
