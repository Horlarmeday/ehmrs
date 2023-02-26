import {
  createBed,
  createDepartment,
  createService,
  createUnit,
  createWard,
  getBeds,
  getBedsInAWard,
  getDepartments,
  getServices,
  getUnits,
  getWards,
  searchDepartments,
  searchServices,
  searchUnits,
  searchWards,
  updateBed,
  updateDepartment,
  updateService,
  updateUnit,
  updateWard,
} from './admin.repository';
import { Department } from '../../database/models';

class AdminService {
  /**
   * create a department
   *
   * @static
   * @returns {json} json object with department data
   * @param body
   * @memberOf AdminService
   */
  static async createDepartmentService(body: Department) {
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
      return searchDepartments(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getDepartments(+currentPage, +pageLimit);
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
   * get beds
   *
   * @static
   * @returns {json} json object with beds data
   * @memberOf AdminService
   */
  static async getBeds() {
    return getBeds();
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

  /**
   * get all beds in a ward
   *
   * @static
   * @returns {json} json object with bed data
   * @param body
   * @memberOf AdminService
   */
  static async getBedsInAWard(body) {
    return getBedsInAWard(body);
  }

  /**
   * create a service
   *
   * @static
   * @returns {json} json object with service data
   * @param body
   * @memberOf AdminService
   */
  static async createHospitalService(body) {
    return createService(body);
  }

  /**
   * update a service
   *
   * @static
   * @returns {json} json object with service data
   * @param body
   * @memberOf AdminService
   */
  static async updateHospitalService(body) {
    return updateService(body);
  }

  /**
   * get services
   *
   * @static
   * @returns {json} json object with services data
   * @param body
   * @memberOf AdminService
   */
  static async getServices(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchServices(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getServices(+currentPage, +pageLimit);
    }

    return getServices();
  }
}
export default AdminService;
