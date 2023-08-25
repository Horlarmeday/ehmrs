import {
  createStaff,
  findByPhoneOrUsername,
  getStaffById,
  getStaffs,
  searchStaffs,
  updateStaff,
} from './staff.repository';
import { BadException } from '../../common/util/api-error';
import { processSnappedPhoto } from '../../core/helpers/helper';
import { EXISTING_STAFF, INVALID_STAFF_ID } from './messages/response-messages';
import { Staff, StaffQueryParam } from './interface/staff.interface';

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
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchStaffs(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getStaffs(+currentPage, +pageLimit);
    }

    return getStaffs();
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
