import {
  createICD10Disease,
  createICPC2Disease,
  getICD10Diseases,
  getICPC2Diseases,
  searchICD10Diseases,
  searchICPC2Diseases,
  updateICD10Disease,
  updateICPC2Disease,
} from './diagnosis.repository';
import { ICD10Disease, ICPC2Disease } from '../../database/models';

export class DiagnosisService {
  /**
   * create ICD10 disease
   *
   * @static
   * @returns {json} json object with ICD10 disease data
   * @memberOf RadiologyService
   * @param icd10Disease
   */
  static async createICD10Disease(icd10Disease: ICD10Disease) {
    return createICD10Disease(icd10Disease);
  }

  /**
   * create ICPC2 disease
   *
   * @static
   * @returns {json} json object with ICPC2 disease data
   * @memberOf RadiologyService
   * @param icpc2Disease
   */
  static async createICPC2Disease(icpc2Disease: ICPC2Disease) {
    return createICPC2Disease(icpc2Disease);
  }

  /**
   * get ICD10 diseases
   *
   * @static
   * @returns {json} json object with ICD10 diseases data
   * @param body
   * @memberOf DiagnosisService
   */
  static async getICD10Diseases(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchICD10Diseases(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getICD10Diseases(+currentPage, +pageLimit);
    }

    return getICD10Diseases();
  }

  /**
   * update ICD10 diseases
   *
   * @static
   * @returns {json} json object with ICD10 diseases data
   * @param body
   * @memberOf DiagnosisService
   */
  static async updateICD10Service(body: Partial<ICD10Disease>) {
    return updateICD10Disease(body);
  }

  /**
   * get ICPC2 diseases
   *
   * @static
   * @returns {json} json object with ICPC2 diseases data
   * @param body
   * @memberOf DiagnosisService
   */
  static async getICPC2Diseases(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchICPC2Diseases(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getICPC2Diseases(+currentPage, +pageLimit);
    }

    return getICPC2Diseases();
  }

  /**
   * update ICPC2 diseases
   *
   * @static
   * @returns {json} json object with ICPC2 diseases data
   * @param body
   * @memberOf DiagnosisService
   */
  static async updateICPC2Service(body: Partial<ICPC2Disease>) {
    return updateICPC2Disease(body);
  }
}
