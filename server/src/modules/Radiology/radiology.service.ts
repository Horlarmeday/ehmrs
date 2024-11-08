import {
  appendInvestigationResults,
  approveInvestigationResults,
  createImaging,
  createInvestigation,
  createInvestigationTariff,
  getImaging,
  getInvestigationResult,
  getInvestigations,
  getInvestigationsForApproval,
  getInvestigationsResults,
  getOneInvestigationPrescription,
  getOneRequestedInvestigation,
  getRequestedInvestigations,
  searchImaging,
  updateImaging,
  updateInvestigation,
} from './radiology.repository';
import {
  CreateImagingDto,
  CreateInvestigationDto,
  InvestigationQueryDto,
  InvestigationTariffDto,
  RadiologyApprovalDto,
  RadiologyResultDto,
} from './dto/radiology.dto';
import { TestStatus } from '../../database/models/prescribedTest';
import { isEmpty } from 'lodash';

export class RadiologyService {
  /**
   * create imaging
   *
   * @static
   * @returns {json} json object with imaging data
   * @memberOf RadiologyService
   * @param createImagingDto
   */
  static async createImagingService(createImagingDto: CreateImagingDto) {
    return createImaging(createImagingDto);
  }

  /**
   * get health insurances
   *
   * @static
   * @returns {json} json object with health insurances data
   * @param body
   * @memberOf RadiologyService
   */
  static async getImaging(body) {
    const { search, pageLimit, currentPage } = body;
    if (search) {
      return searchImaging(+currentPage, +pageLimit, search);
    }

    if (Object.values(body).length) {
      return getImaging(+currentPage, +pageLimit);
    }

    return getImaging();
  }

  /**
   * update imaging
   *
   * @static
   * @returns {json} json object with imaging data
   * @param body
   * @memberOf RadiologyService
   */
  static async updateImagingService(body) {
    return updateImaging(body);
  }

  /**
   * create investigation
   *
   * @static
   * @returns {json} json object with investigation data
   * @memberOf RadiologyService
   * @param createInvestigationDto
   */
  static async createInvestigationService(createInvestigationDto: CreateInvestigationDto) {
    return createInvestigation(createInvestigationDto);
  }

  /**
   * get Investigations
   *
   * @static
   * @returns {json} json object with Investigation data
   * @memberOf RadiologyService
   * @param investigationQueryDto
   */
  static async getInvestigations(investigationQueryDto: InvestigationQueryDto) {
    const { search, pageLimit, currentPage, filter } = investigationQueryDto;

    if (Object.values(investigationQueryDto).length) {
      return getInvestigations({ currentPage, pageLimit, search, filter });
    }

    return getInvestigations({});
  }

  /**
   * create a investigation tariff
   *
   * @static
   * @returns {json} json object with investigation tariff data
   * @param body
   * @memberOf RadiologyService
   */
  static async createInvestigationTariffService(body: InvestigationTariffDto) {
    const { prices, investigation_id } = body;

    const data = prices.map(price => ({
      ...price,
      investigation_id,
      insurance_id: price.insurance_id,
    }));
    return createInvestigationTariff(data);
  }

  /**
   * update investigation
   *
   * @static
   * @returns {json} json object with investigation data
   * @param body
   * @memberOf RadiologyService
   */
  static async updateInvestigationService(body) {
    return updateInvestigation(body);
  }

  /***********************
   * RADIOLOGY RESULTS
   ***********************/

  /**
   * Get requested investigations
   * @param body
   * @memberOf LaboratoryService
   */
  static async getRequestedInvestigations(body) {
    const { search, pageLimit, currentPage, period, start, end } = body;
    if (start && end) {
      return getRequestedInvestigations({ currentPage, pageLimit, start, end });
    }

    if (search) {
      return getRequestedInvestigations({ currentPage, pageLimit, period, search });
    }

    if (Object.values(body).length) {
      return getRequestedInvestigations({ currentPage, pageLimit, period });
    }

    return getRequestedInvestigations({ period });
  }

  /***
   * get one requested investigation
   * @param body
   */
  static async getOneRequestedInvestigation(body) {
    const { prescriptionId } = body;
    return getOneRequestedInvestigation(prescriptionId);
  }

  /**
   * Add/Update investigation results
   * @param radiologyResultDto
   */
  static async appendInvestigationResults(radiologyResultDto: RadiologyResultDto) {
    const { results, staff_id } = radiologyResultDto;
    const data = results
      .filter(({ result }) => !isEmpty(result))
      .map(result => ({
        ...result,
        staff_id,
        testStatus: this.getTestStatus(result),
        date_created: Date.now(),
      }));
    return appendInvestigationResults(data);
  }

  /**
   * Get investigations needing approval
   * @param body
   * @memberOf LaboratoryService
   */
  static async getInvestigationsApproval(body) {
    const { search, pageLimit, currentPage, start, end } = body;
    if (start && end) {
      return getInvestigationsForApproval({ currentPage, pageLimit, start, end });
    }

    if (search) {
      return getInvestigationsForApproval({ currentPage, pageLimit, search });
    }

    if (Object.values(body).length) {
      return getInvestigationsForApproval({ currentPage, pageLimit });
    }

    return getInvestigationsForApproval({});
  }

  /**
   * Approve investigation results
   * @param radiologyApprovalDto
   */
  static async approveInvestigationResults(radiologyApprovalDto: RadiologyApprovalDto) {
    const { results, staff_id } = radiologyApprovalDto;
    const data = results.map(result => ({
      ...result,
      staff_id,
    }));
    return approveInvestigationResults(data);
  }

  /**
   * Get investigations results
   * @param body
   * @memberOf LaboratoryService
   */
  static async getInvestigationsResults(body) {
    const { search, pageLimit, currentPage, start, end } = body;
    if (start && end) {
      return getInvestigationsResults({ currentPage, pageLimit, start, end });
    }

    if (search) {
      return getInvestigationsResults({ currentPage, pageLimit, search });
    }

    if (Object.values(body).length) {
      return getInvestigationsResults({ currentPage, pageLimit });
    }

    return getInvestigationsResults({});
  }

  /***
   * get investigation result
   * @param body
   */
  static async getInvestigationResult(body) {
    const { prescriptionId } = body;
    return getInvestigationResult(prescriptionId);
  }

  /***
   * get one investigation prescription
   * @param visitId
   */
  static async getOneInvestigationPrescription(visitId: number) {
    return getOneInvestigationPrescription({ visit_id: visitId });
  }

  static getTestStatus(result) {
    if (result.result) return TestStatus.RESULT_ADDED;
    if (isEmpty(result.result)) return TestStatus.PENDING;
  }
}
