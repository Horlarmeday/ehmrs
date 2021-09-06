import {
  createHMO,
  createInsurance,
  getHMOs,
  getInsuranceHMOs,
  getInsurances,
  searchHMOs,
  searchInsurances,
} from './insurance.repository';

class InsuranceService {
  /**
   * create health insurance type
   *
   * @static
   * @returns {json} json object with insurance data
   * @param body
   * @memberOf InsuranceService
   */
  static async createInsuranceService(body) {
    return createInsurance(body);
  }

  /**
   * create hmo
   *
   * @static
   * @returns {json} json object with hmo data
   * @param body
   * @memberOf InsuranceService
   */
  static async createHMOService(body) {
    return createHMO(body);
  }

  /**
   * get health insurances
   *
   * @static
   * @returns {json} json object with health insurances data
   * @param body
   * @memberOf PatientService
   */
  static async getInsurances(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchInsurances(Number(currentPage), Number(pageLimit), search);
    }

    if (Object.values(body).length) {
      return getInsurances(Number(currentPage), Number(pageLimit));
    }

    return getInsurances();
  }

  /**
   * get HMOs
   *
   * @static
   * @returns {json} json object with HMOs data
   * @param body
   * @memberOf PatientService
   */
  static async getHMOs(body) {
    const { search, pageLimit, currentPage, filter } = body;
    if (search) {
      return searchHMOs(Number(currentPage), Number(pageLimit), search);
    }

    if (filter) {
      return getInsuranceHMOs(Number(currentPage), Number(pageLimit), filter);
    }

    if (Object.values(body).length) {
      return getHMOs(Number(currentPage), Number(pageLimit));
    }

    return getHMOs();
  }
}
export default InsuranceService;
