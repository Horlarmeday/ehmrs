import {
  createHMO,
  createInsurance,
  getHMOs,
  getInsuranceHMOs,
  getInsurances,
  getPatientHealthInsurances, getPatientInsuranceQuery,
  searchHMOs,
  searchInsurances,
  setInsuranceAsDefault,
} from './insurance.repository';
import { PatientInsurance } from '../../database/models';

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

  /**
   * get a patient health insurances
   *
   * @static
   * @returns {json} json object with patient insurances data
   * @memberOf InsuranceService
   * @param patientId
   */
  static async getPatientHealthInsurances(patientId: number) {
    return getPatientHealthInsurances(patientId);
  }

  /**
   * set insurance as default
   *
   * @static
   * @returns {json} json object with patient insurance data
   * @param body
   * @memberOf InsuranceService
   */
  static async setInsuranceAsDefault(body) {
    const { insurance_id, patient_id } = body;
    return setInsuranceAsDefault(insurance_id, patient_id);
  }

  /**
   * get a patient default health insurance
   *
   * @static
   * @returns {Promise<PatientInsurance[]>} json object with patient insurance data
   * @memberOf InsuranceService
   * @param patientId
   */
  static async getPatientActiveInsurance(patientId: number): Promise<PatientInsurance | null> {
    return getPatientInsuranceQuery({ patient_id: patientId, is_default: true });
  }
}
export default InsuranceService;
