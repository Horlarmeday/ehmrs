import {
  createBed,
  createDepartment,
  createUnit,
  createWard,
  getDepartments,
  getUnits,
  getWards,
  searchDepartments,
  searchUnits,
  searchWards,
  updateBed,
  updateDepartment,
  updateUnit,
  updateWard,
} from './admin.repository';

class AdminService {
  /**
   * create a department
   *
   * @static
   * @returns {json} json object with department data
   * @param body
   * @memberOf AdminService
   */
  static async createDepartmentService(body) {
    return createDepartment(body);
  }

  /**
   * update a department
   *
   * @static
   * @returns {json} json object with department data
   * @param body
   * @memberOf AdminService
   */
  static async updateDepartmentService(body) {
    return updateDepartment(body);
  }

  /**
   * get departments
   *
   * @static
   * @returns {json} json object with departments data
   * @param body
   * @memberOf AdminService
   */
  static async getDepartments(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchDepartments(Number(currentPage), Number(pageLimit), search);
    }

    if (Object.values(body).length) {
      return getDepartments(Number(currentPage), Number(pageLimit));
    }

    return getDepartments();
  }

  /**
   * create a unit (S.I unit)
   *
   * @static
   * @returns {json} json object with unit data
   * @param body
   * @memberOf AdminService
   */
  static async createUnitService(body) {
    return createUnit(body);
  }

  /**
   * update a unit
   *
   * @static
   * @returns {json} json object with unit data
   * @param body
   * @memberOf AdminService
   */
  static async updateUnitService(body) {
    return updateUnit(body);
  }

  /**
   * get units
   *
   * @static
   * @returns {json} json object with units data
   * @param body
   * @memberOf AdminService
   */
  static async getUnits(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchUnits(Number(currentPage), Number(pageLimit), search);
    }

    if (Object.values(body).length) {
      return getUnits(Number(currentPage), Number(pageLimit));
    }

    return getUnits();
  }

  /**
   * create a ward
   *
   * @static
   * @returns {json} json object with ward data
   * @param body
   * @memberOf AdminService
   */
  static async createWardService(body) {
    return createWard(body);
  }

  /**
   * update a ward
   *
   * @static
   * @returns {json} json object with ward data
   * @param body
   * @memberOf AdminService
   */
  static async updateWardService(body) {
    return updateWard(body);
  }

  /**
   * get wards
   *
   * @static
   * @returns {json} json object with wards data
   * @param body
   * @memberOf AdminService
   */
  static async getWards(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchWards(Number(currentPage), Number(pageLimit), search);
    }

    if (Object.values(body).length) {
      return getWards(Number(currentPage), Number(pageLimit));
    }

    return getWards();
  }

  /**
   * create a bed
   *
   * @static
   * @returns {json} json object with bed data
   * @param body
   * @memberOf AdminService
   */
  static async createBedService(body) {
    return createBed(body);
  }

  /**
   * update a bed
   *
   * @static
   * @returns {json} json object with bed data
   * @param body
   * @memberOf AdminService
   */
  static async updateBedService(body) {
    return updateBed(body);
  }
}
export default AdminService;
