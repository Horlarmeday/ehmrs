import {
  appendInvestigationResults,
  approveInvestigationResults,
  changeInvestigationResultsStatus,
  createComboInvestigation,
  createImaging,
  createInvestigation,
  createInvestigationTariff,
  deleteComboInvestigation,
  getComboInvestigations,
  getImaging,
  getInvestigationResult,
  getInvestigations,
  getInvestigationsForApproval,
  getInvestigationsResults,
  getOneComboInvestigation,
  getOneInvestigationPrescription,
  getOneRequestedInvestigation,
  getRequestedInvestigations,
  searchImaging,
  updateComboInvestigation,
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
import { changeTestResultsStatus } from '../Laboratory/laboratory.repository';

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

  /**
   * Change investigation results status
   * @memberOf LaboratoryService
   * @param selectedInvestigations
   * @param investigationPrescriptionId
   */
  static async updateInvestigationResultStatus(
    selectedInvestigations: number[],
    investigationPrescriptionId: number
  ) {
    return changeInvestigationResultsStatus(selectedInvestigations, investigationPrescriptionId);
  }

  static getTestStatus(result) {
    if (result.result) return TestStatus.RESULT_ADDED;
    if (isEmpty(result.result)) return TestStatus.PENDING;
  }

  /**
   * Download radiology result as PDF
   * @param investigationPrescriptionId
   */
  static async downloadRadiologyResult(investigationPrescriptionId: number) {
    const result = await getInvestigationResult(investigationPrescriptionId);
    
    const { patient, results } = result;
    
    // Format patient info
    const patientInfo = {
      patientName: `${patient.firstname} ${patient.lastname}`,
      patientId: patient.hospital_id,
      age: patient.age || 0,
      sex: patient.gender || 'N/A',
      orderDate: result.results?.[0]?.investigation?.investigation_approved_date 
        ? new Date(result.results[0].investigation.investigation_approved_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      accession_number: `RAD-${investigationPrescriptionId}`,
      reportDate: result.results?.[0]?.createdAt
        ? new Date(result.results[0].createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
      test_verifier: result.results?.[0]?.investigation?.investigation_approver?.fullname || 'N/A',
      test_approver: result.results?.[0]?.investigation?.investigation_approver?.fullname || 'N/A',
      sample_receiver: 'N/A',
      tester: 'N/A',
    };

    // Format radiology results
    const radiologyResults = results.map(result => ({
      investigationName: result.investigation?.investigation?.name || 'Unknown Investigation',
      result: result.result || '',
      approvedDate: result.investigation?.investigation_approved_date
        ? new Date(result.investigation.investigation_approved_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      approvedBy: result.investigation?.investigation_approver?.fullname || '',
    }));

    return { patientInfo, radiologyResults };
  }

  /**
   * Create combo investigation
   * @param body
   * @memberOf RadiologyService
   */
  static async createComboInvestigation(body: {
    name: string;
    staff_id: number;
    investigation_ids: number[];
  }) {
    return createComboInvestigation(body);
  }

  /**
   * Get combo investigations
   * @param body
   * @memberOf RadiologyService
   */
  static async getComboInvestigations(body) {
    const { currentPage, pageLimit, search } = body;

    if (Object.values(body).length) {
      return getComboInvestigations({ currentPage, pageLimit, search });
    }

    return getComboInvestigations({});
  }

  /**
   * Get one combo investigation
   * @param id
   * @memberOf RadiologyService
   */
  static async getOneComboInvestigation(id: number) {
    return getOneComboInvestigation(id);
  }

  /**
   * Update a combo investigation
   * @param body
   * @memberOf RadiologyService
   */
  static async updateComboInvestigation(body: {
    id: number;
    name?: string;
    investigation_ids?: number[];
    is_active?: boolean;
  }) {
    return updateComboInvestigation(body);
  }

  /**
   * Delete a combo investigation
   * @param id
   * @memberOf RadiologyService
   */
  static async deleteComboInvestigation(id: number) {
    return deleteComboInvestigation(id);
  }
}
