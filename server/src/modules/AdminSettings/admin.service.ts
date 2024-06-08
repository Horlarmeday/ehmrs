import {
  createBed,
  createDefault,
  createDepartment,
  createService,
  createUnit,
  createWard,
  deleteDefaultData,
  getBeds,
  getBedsInAWard,
  getDefaults,
  getDepartments,
  getOneDefault,
  getServices,
  getSystemSettings,
  getUnits,
  getWards,
  getWardsAndBeds,
  searchDepartments,
  searchServices,
  searchUnits,
  searchWards,
  updateBed,
  updateDepartment,
  updateService,
  updateSystemSettings,
  updateUnit,
  updateWard,
} from './admin.repository';
import { Default, Department, SystemSettings, Ward } from '../../database/models';

class AdminService {
  /** create a department
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
   * get wards and beds
   *
   * @static
   * @returns {json} json object with wards(beds) data
   * @param body
   * @memberOf AdminService
   */
  static async getWardsAndBeds(body): Promise<Ward[]> {
    const { search } = body;
    return getWardsAndBeds(search);
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

  /**
   * create a default
   *
   * @static
   * @returns {Promise<Default>} json object with default data
   * @param body
   * @memberOf AdminService
   */
  static async createAdminDefault(body): Promise<Default> {
    return createDefault(body);
  }

  /**
   * get a default
   *
   * @static
   * @returns {Promise<Default>} json object with default data
   * @memberOf AdminService
   * @param defaultId
   */
  static async getOneDefault(defaultId: number): Promise<Default> {
    return getOneDefault({ id: defaultId });
  }

  /**
   * get defaults
   *
   * @static
   * @returns {Promise<Default[]>} json object with defaults data
   * @memberOf AdminService
   */
  static async getDefaults(): Promise<Default[]> {
    return getDefaults();
  }

  /**
   * delete a default data
   *
   * @static
   * @returns {Promise<Default>} json object with default data
   * @param body
   * @memberOf AdminService
   */
  static async deleteDefaultData(body): Promise<Default> {
    return deleteDefaultData({ id: body.id }, body.dataId);
  }

  /**
   * update system settings
   *
   * @static
   * @returns {json} json object with system settings data
   * @param body
   * @memberOf AdminService
   */
  static async updateSystemSettings(body) {
    return updateSystemSettings(body);
  }

  /**
   * get system settings
   *
   * @static
   * @returns {Promise<SystemSettings>} json object with system settings data
   * @memberOf AdminService
   */
  static async getSystemSettings(): Promise<SystemSettings> {
    return getSystemSettings();
  }
}
export default AdminService;
