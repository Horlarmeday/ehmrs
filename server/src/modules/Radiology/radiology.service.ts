import {
  createImaging,
  createInvestigation,
  createInvestigationTariff,
  filterInvestigations,
  getImaging,
  getInvestigations,
  searchImaging,
  searchInvestigations,
  updateImaging,
  updateInvestigation,
} from './radiology.repository';
import {
  CreateImagingDto,
  CreateInvestigationDto,
  InvestigationQueryDto,
  InvestigationTariffDto,
} from './dto/radiology.dto';
import { TestTariffDto } from '../Laboratory/dto/test-tariff.dto';
import { createTestTariff, updateTest } from '../Laboratory/laboratory.repository';

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
    if (search) {
      return searchInvestigations(+currentPage, +pageLimit, search);
    }

    if (filter) {
      return filterInvestigations(+currentPage, +pageLimit, filter);
    }

    if (Object.values(investigationQueryDto).length) {
      return getInvestigations(+currentPage, +pageLimit);
    }

    return getInvestigations();
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
}
