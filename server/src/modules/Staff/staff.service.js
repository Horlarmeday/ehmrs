import {
  createStaff,
  findByPhoneOrUsername,
  getStaffs,
  searchStaffs,
  updateStaff,
} from './staff.repository';
import APIError from '../../util/apiError';
import { processSnappedPhoto } from '../../helpers/helper';

class StaffService {
  /**
   * create staff account
   *
   * @static
   * @returns {json} json object with user data
   * @param body
   * @memberOf StaffService
   */
  static async createStaffService(body) {
    const user = await findByPhoneOrUsername({ phone: body.phone, username: body.username });
    if (user) throw new APIError('INVALID', 400, 'Staff already exists');

    // Save photo to disk
    const { fileName } = await processSnappedPhoto(body.photo, body.firstname);

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
  static async getStaffs(body) {
    const { currentPage, pageLimit, search } = body;
    if (search) {
      return searchStaffs(Number(currentPage), Number(pageLimit), search);
    }

    if (Object.values(body).length) {
      return getStaffs(Number(currentPage), Number(pageLimit));
    }

    return getStaffs();
  }
}
export default StaffService;
