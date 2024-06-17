import {
  createStaff,
  findByPhoneOrUsername,
  getStaffById,
  getStaffs,
  searchStaffs,
  updateStaff,
  updateStaffAccount,
} from './staff.repository';
import { BadException } from '../../common/util/api-error';
import { processSnappedPhoto } from '../../core/helpers/helper';
import { EXISTING_STAFF, INVALID_STAFF_ID, STAFF_NOT_FOUND } from './messages/response-messages';
import { Staff, StaffQueryParam } from './interface/staff.interface';
import bcrypt from 'bcryptjs';
import { logger } from '../../core/helpers/logger';

class StaffService {
  /**
   * create staff account
   *
   * @static
   * @returns {json} json object with user data
   * @param body
   * @memberOf StaffService
   */
  static async createStaffService(body: Staff) {
    const user = await findByPhoneOrUsername({ phone: body.phone, username: body.username });
    if (user) throw new BadException('INVALID', 400, EXISTING_STAFF);

    // Save photo to disk
    const fileName = await processSnappedPhoto(body.photo, body.firstname);

    return createStaff({ ...body, fileName });
  }

  /**
   * reset staff password
   *
   * @static
   * @returns {json} json object with user data
   * @memberOf StaffService
   * @param staffId
   */
  static async resetStaffPassword(staffId: number) {
    const staff = await getStaffById(staffId);
    if (!staff) throw new BadException('INVALID', 404, STAFF_NOT_FOUND);

    const salt = await bcrypt.genSalt(12);
    const newPassword = await bcrypt.hash('123456', salt);

    return updateStaffAccount({ password: newPassword }, staffId);
  }

  /**
   * update staff account
   *
   * @static
   * @returns {json} json object with staff data
   * @param body
   * @memberOf StaffService
   */
  static async updateStaffService(body) {
    return updateStaff(body);
  }

  /**
   * get staffs
   *
   * @static
   * @returns {json} json object with staffs data
   * @param body
   * @memberOf StaffService
   */
  static async getStaffs(body: StaffQueryParam) {
    const { currentPage, pageLimit, search, filter } = body;
    if (search) {
      return searchStaffs({ currentPage, pageLimit, search, filter });
    }

    if (Object.values(body).length) {
      return getStaffs({ currentPage, pageLimit, filter });
    }

    return getStaffs({ filter });
  }

  /**
   * get staff by Id
   *
   * @static
   * @returns {json} json object with staff data
   * @param body
   * @memberOf StaffService
   */
  static async getStaffById(body: number) {
    const staff = getStaffById(body);
    if (!staff) throw new BadException('INVALID', 400, INVALID_STAFF_ID);
    return staff;
  }
}
export default StaffService;
