import {
  HMODrugPricing,
  HMOTestPricing,
  HMOServicePricing,
  HMOInvestigationPricing,
  HMO,
} from '../../database/models';
import { BadException } from '../../common/util/api-error';
import { Insurance, Drug, Test, Service, Investigation } from '../../database/models';
import { Op } from 'sequelize';
import { Status } from '../../database/models/staff';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export interface HMOPricingData {
  drug_id?: number;
  test_id?: number;
  service_id?: number;
  investigation_id?: number;
  hmo_id: number;
  hmo_price: number;
  patient_percentage: number;
  hmo_percentage: number;
  effective_from: Date;
  effective_to: Date;
  status: string;
  notes?: string;
}

export interface BulkHMOPricingData {
  items: HMOPricingData[];
  insurance_id: number;
  effective_from: Date;
  effective_to: Date;
  status: string;
  notes?: string;
}

export interface CSVHMOPricingData {
  item_code: string; // Drug code, test code, service code, or investigation code
  item_type: 'DRUG' | 'TEST' | 'SERVICE' | 'INVESTIGATION';
  insurance_name: string; // Insurance name instead of code
  hmo_price: number;
  patient_percentage: number;
  hmo_percentage: number;
  effective_from: string; // Date string
  effective_to: string; // Date string
  notes?: string;
}

export interface PricingCalculationResult {
  hmo_price: number;
  patient_amount: number;
  hmo_amount: number;
  patient_percentage: number;
  hmo_percentage: number;
  total_amount: number;
}

export class HMOPricingService {
  /**
   * Create HMO drug pricing
   */
  static async createDrugPricing(data: HMOPricingData): Promise<HMODrugPricing> {
    // Validate that drug exists
    const drug = await Drug.findByPk(data.drug_id);
    if (!drug) {
      throw new BadException('NOT_FOUND', 404, 'Drug not found');
    }

    // Validate that insurance exists
    const hmo = await HMO.findByPk(data.hmo_id);
    if (!hmo) {
      throw new BadException('NOT_FOUND', 404, 'Insurance not found');
    }

    // Check for existing pricing to avoid duplicates
    const existingPricing = await HMODrugPricing.findOne({
      where: {
        drug_id: data.drug_id,
        hmo_id: data.hmo_id,
        status: 'Active',
      },
    });

    if (existingPricing) {
      throw new BadException(
        'DUPLICATE',
        400,
        'Pricing already exists for this drug and insurance combination'
      );
    }

    return await HMODrugPricing.create({ ...data, insurance_id: hmo.insurance_id });
  }

  /**
   * Create HMO test pricing
   */
  static async createTestPricing(data: HMOPricingData): Promise<HMOTestPricing> {
    // Validate that test exists
    const test = await Test.findByPk(data.test_id);
    if (!test) {
      throw new BadException('NOT_FOUND', 404, 'Test not found');
    }

    // Validate that HMO exists
    const hmo = await HMO.findByPk(data.hmo_id);
    if (!hmo) {
      throw new BadException('NOT_FOUND', 404, 'HMO not found');
    }

    // Check for existing pricing
    const existingPricing = await HMOTestPricing.findOne({
      where: {
        test_id: data.test_id,
        insurance_id: hmo.insurance_id,
        status: 'Active',
      },
    });

    if (existingPricing) {
      throw new BadException(
        'DUPLICATE',
        400,
        'Pricing already exists for this test and insurance combination'
      );
    }

    return await HMOTestPricing.create({ ...data, insurance_id: hmo.insurance_id });
  }

  /**
   * Create HMO service pricing
   */
  static async createServicePricing(data: HMOPricingData): Promise<HMOServicePricing> {
    // Validate that service exists
    const service = await Service.findByPk(data.service_id);
    if (!service) {
      throw new BadException('NOT_FOUND', 404, 'Service not found');
    }

    // Validate that HMO exists
    const hmo = await HMO.findByPk(data.hmo_id);
    if (!hmo) {
      throw new BadException('NOT_FOUND', 404, 'HMO not found');
    }

    // Check for existing pricing
    const existingPricing = await HMOServicePricing.findOne({
      where: {
        service_id: data.service_id,
        insurance_id: hmo.insurance_id,
        status: 'Active',
      },
    });

    if (existingPricing) {
      throw new BadException(
        'DUPLICATE',
        400,
        'Pricing already exists for this service and insurance combination'
      );
    }

    return await HMOServicePricing.create({ ...data, insurance_id: hmo.insurance_id });
  }

  /**
   * Create HMO investigation pricing
   */
  static async createInvestigationPricing(data: HMOPricingData): Promise<HMOInvestigationPricing> {
    // Validate that investigation exists
    const investigation = await Investigation.findByPk(data.investigation_id);
    if (!investigation) {
      throw new BadException('NOT_FOUND', 404, 'Investigation not found');
    }

    // Validate that HMO exists
    const hmo = await HMO.findByPk(data.hmo_id);
    if (!hmo) {
      throw new BadException('NOT_FOUND', 404, 'HMO not found');
    }

    // Check for existing pricing
    const existingPricing = await HMOInvestigationPricing.findOne({
      where: {
        investigation_id: data.investigation_id,
        insurance_id: hmo.insurance_id,
        status: 'Active',
      },
    });

    if (existingPricing) {
      throw new BadException(
        'DUPLICATE',
        400,
        'Pricing already exists for this investigation and insurance combination'
      );
    }

    return await HMOInvestigationPricing.create({ ...data, insurance_id: hmo.insurance_id });
  }

  /**
   * Get drug pricing for a specific insurance
   */
  static async getDrugPricing(drugId: number, insuranceId: number): Promise<HMODrugPricing | null> {
    const now = new Date();

    return await HMODrugPricing.findOne({
      where: {
        drug_id: drugId,
        insurance_id: insuranceId,
        status: 'Active',
        effective_from: { [Op.lte]: now },
        effective_to: { [Op.gte]: now },
      },
      include: [
        { model: Drug, attributes: ['code', 'name'] },
        { model: Insurance, attributes: ['name'] },
      ],
    });
  }

  /**
   * Get test pricing for a specific insurance
   */
  static async getTestPricing(testId: number, insuranceId: number): Promise<HMOTestPricing | null> {
    const now = new Date();

    return await HMOTestPricing.findOne({
      where: {
        test_id: testId,
        insurance_id: insuranceId,
        status: 'Active',
        effective_from: { [Op.lte]: now },
        effective_to: { [Op.gte]: now },
      },
      include: [
        { model: Test, attributes: ['name', 'code'] },
        { model: Insurance, attributes: ['name', 'code'] },
      ],
    });
  }

  /**
   * Get service pricing for a specific insurance
   */
  static async getServicePricing(
    serviceId: number,
    insuranceId: number
  ): Promise<HMOServicePricing | null> {
    const now = new Date();

    return await HMOServicePricing.findOne({
      where: {
        service_id: serviceId,
        insurance_id: insuranceId,
        status: 'Active',
        effective_from: { [Op.lte]: now },
        effective_to: { [Op.gte]: now },
      },
      include: [
        { model: Service, attributes: ['name', 'code'] },
        { model: Insurance, attributes: ['name', 'code'] },
      ],
    });
  }

  /**
   * Get investigation pricing for a specific insurance
   */
  static async getInvestigationPricing(
    investigationId: number,
    insuranceId: number
  ): Promise<HMOInvestigationPricing | null> {
    const now = new Date();

    return await HMOInvestigationPricing.findOne({
      where: {
        investigation_id: investigationId,
        insurance_id: insuranceId,
        status: 'Active',
        effective_from: { [Op.lte]: now },
        effective_to: { [Op.gte]: now },
      },
      include: [
        { model: Investigation, attributes: ['name', 'code'] },
        { model: Insurance, attributes: ['name', 'code'] },
      ],
    });
  }

  /**
   * Calculate patient and HMO amounts for drugs
   */
  static async calculateDrugPricing(
    drugId: number,
    insuranceId: number,
    quantity = 1
  ): Promise<PricingCalculationResult> {
    const pricing = await this.getDrugPricing(drugId, insuranceId);

    if (!pricing) {
      return null;
    }

    const totalAmount = pricing.hmo_price * quantity;
    const patientAmount = (totalAmount * pricing.patient_percentage) / 100;
    const hmoAmount = (totalAmount * pricing.hmo_percentage) / 100;

    return {
      hmo_price: pricing.hmo_price,
      patient_amount: patientAmount,
      hmo_amount: hmoAmount,
      patient_percentage: pricing.patient_percentage,
      hmo_percentage: pricing.hmo_percentage,
      total_amount: totalAmount,
    };
  }

  /**
   * Calculate patient and HMO amounts for tests
   */
  static async calculateTestPricing(
    testId: number,
    insuranceId: number
  ): Promise<PricingCalculationResult> {
    const pricing = await this.getTestPricing(testId, insuranceId);

    if (!pricing) {
      return null;
    }

    const totalAmount = pricing.hmo_price;
    const patientAmount = (totalAmount * pricing.patient_percentage) / 100;
    const hmoAmount = (totalAmount * pricing.hmo_percentage) / 100;

    return {
      hmo_price: pricing.hmo_price,
      patient_amount: patientAmount,
      hmo_amount: hmoAmount,
      patient_percentage: pricing.patient_percentage,
      hmo_percentage: pricing.hmo_percentage,
      total_amount: totalAmount,
    };
  }

  /**
   * Calculate patient and HMO amounts for services
   */
  static async calculateServicePricing(
    serviceId: number,
    insuranceId: number
  ): Promise<PricingCalculationResult> {
    const pricing = await this.getServicePricing(serviceId, insuranceId);

    if (!pricing) {
      return null;
    }

    const totalAmount = pricing.hmo_price;
    const patientAmount = (totalAmount * pricing.patient_percentage) / 100;
    const hmoAmount = (totalAmount * pricing.hmo_percentage) / 100;

    return {
      hmo_price: pricing.hmo_price,
      patient_amount: patientAmount,
      hmo_amount: hmoAmount,
      patient_percentage: pricing.patient_percentage,
      hmo_percentage: pricing.hmo_percentage,
      total_amount: totalAmount,
    };
  }

  /**
   * Calculate patient and HMO amounts for investigations
   */
  static async calculateInvestigationPricing(
    investigationId: number,
    insuranceId: number
  ): Promise<PricingCalculationResult> {
    const pricing = await this.getInvestigationPricing(investigationId, insuranceId);

    if (!pricing) {
      return null;
    }

    const totalAmount = pricing.hmo_price;
    const patientAmount = (totalAmount * pricing.patient_percentage) / 100;
    const hmoAmount = (totalAmount * pricing.hmo_percentage) / 100;

    return {
      hmo_price: pricing.hmo_price,
      patient_amount: patientAmount,
      hmo_amount: hmoAmount,
      patient_percentage: pricing.patient_percentage,
      hmo_percentage: pricing.hmo_percentage,
      total_amount: totalAmount,
    };
  }

  /**
   * Update HMO pricing
   */
  static async updatePricing(
    pricingId: number,
    pricingType: 'drug' | 'test' | 'service' | 'investigation',
    data: Partial<HMOPricingData>
  ): Promise<any> {
    let model: any;

    switch (pricingType) {
      case 'drug':
        model = HMODrugPricing;
        break;
      case 'test':
        model = HMOTestPricing;
        break;
      case 'service':
        model = HMOServicePricing;
        break;
      case 'investigation':
        model = HMOInvestigationPricing;
        break;
      default:
        throw new BadException('INVALID_TYPE', 400, 'Invalid pricing type');
    }

    const pricing = await model.findByPk(pricingId);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Pricing not found');
    }

    return await pricing.update(data);
  }

  /**
   * Deactivate HMO pricing
   */
  static async deactivatePricing(
    pricingId: number,
    pricingType: 'drug' | 'test' | 'service' | 'investigation'
  ): Promise<any> {
    let model: any;

    switch (pricingType) {
      case 'drug':
        model = HMODrugPricing;
        break;
      case 'test':
        model = HMOTestPricing;
        break;
      case 'service':
        model = HMOServicePricing;
        break;
      case 'investigation':
        model = HMOInvestigationPricing;
        break;
      default:
        throw new BadException('INVALID_TYPE', 400, 'Invalid pricing type');
    }

    const pricing = await model.findByPk(pricingId);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Pricing not found');
    }

    return await pricing.update({ status: 'Inactive' });
  }

  /**
   * Get all pricing for a specific insurance
   */
  static async getInsurancePricing(
    insuranceId: number
  ): Promise<{
    drugs: HMODrugPricing[];
    tests: HMOTestPricing[];
    services: HMOServicePricing[];
    investigations: HMOInvestigationPricing[];
  }> {
    const [drugs, tests, services, investigations] = await Promise.all([
      HMODrugPricing.findAll({
        where: { insurance_id: insuranceId, status: Status.ACTIVE },
        include: [{ model: Drug, attributes: ['name'] }],
      }),
      HMOTestPricing.findAll({
        where: { insurance_id: insuranceId, status: Status.ACTIVE },
        include: [{ model: Test, attributes: ['name', 'code'] }],
      }),
      HMOServicePricing.findAll({
        where: { insurance_id: insuranceId, status: Status.ACTIVE },
        include: [{ model: Service, attributes: ['name', 'code'] }],
      }),
      HMOInvestigationPricing.findAll({
        where: { insurance_id: insuranceId, status: Status.ACTIVE },
        include: [{ model: Investigation, attributes: ['name'] }],
      }),
    ]);

    return { drugs, tests, services, investigations };
  }

  /**
   * Bulk update pricing for multiple items
   */
  static async bulkUpdatePricing(
    updates: Array<{
      id: number;
      type: 'drug' | 'test' | 'service' | 'investigation';
      data: Partial<HMOPricingData>;
    }>
  ): Promise<any[]> {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.updatePricing(update.id, update.type, update.data);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message, id: update.id });
      }
    }

    return results;
  }

  /**
   * Bulk create HMO pricing for multiple items
   */
  static async bulkCreatePricing(
    bulkData: BulkHMOPricingData
  ): Promise<{
    success: number;
    failed: number;
    results: any[];
  }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const item of bulkData.items) {
      try {
        // Set common fields from bulk data
        const pricingData: HMOPricingData = {
          ...item,
          hmo_id: bulkData.insurance_id, // Map insurance_id to hmo_id for the interface
          effective_from: bulkData.effective_from,
          effective_to: bulkData.effective_to,
          status: bulkData.status,
          notes: item.notes || bulkData.notes,
        };

        let result;
        if (pricingData.drug_id) {
          result = await this.createDrugPricing(pricingData);
        } else if (pricingData.test_id) {
          result = await this.createTestPricing(pricingData);
        } else if (pricingData.service_id) {
          result = await this.createServicePricing(pricingData);
        } else if (pricingData.investigation_id) {
          result = await this.createInvestigationPricing(pricingData);
        } else {
          throw new Error('No valid item ID provided');
        }

        results.push({ success: true, data: result, item });
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          item,
          failed_reason: 'Validation or creation failed',
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * Process CSV data and create HMO pricing
   */
  static async processCSVPricing(
    csvData: CSVHMOPricingData[]
  ): Promise<{
    success: number;
    failed: number;
    results: any[];
    errors: string[];
  }> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // +2 because CSV usually has header row

      try {
        // Validate required fields
        if (!row.item_code || !row.item_type || !row.insurance_name || !row.hmo_price) {
          throw new Error(`Row ${rowNumber}: Missing required fields`);
        }

        // Parse dates
        const effectiveFrom = new Date(row.effective_from);
        const effectiveTo = new Date(row.effective_to);

        if (isNaN(effectiveFrom.getTime()) || isNaN(effectiveTo.getTime())) {
          throw new Error(`Row ${rowNumber}: Invalid date format`);
        }

        // Find insurance by name
        const insurance = await Insurance.findOne({
          where: { name: row.insurance_name },
        });

        if (!insurance) {
          throw new Error(
            `Row ${rowNumber}: Insurance with name '${row.insurance_name}' not found`
          );
        }

        // Find item by code and type
        let itemId: number;
        let itemType: 'drug' | 'test' | 'service' | 'investigation';

        switch (row.item_type.toUpperCase()) {
          case 'DRUG':
            const drug = await Drug.findOne({ where: { code: row.item_code } });
            if (!drug) {
              throw new Error(`Row ${rowNumber}: Drug with code '${row.item_code}' not found`);
            }
            itemId = drug.id;
            itemType = 'drug';
            break;

          case 'TEST':
            const test = await Test.findOne({ where: { code: row.item_code } });
            if (!test) {
              throw new Error(`Row ${rowNumber}: Test with code '${row.item_code}' not found`);
            }
            itemId = test.id;
            itemType = 'test';
            break;

          case 'SERVICE':
            const service = await Service.findOne({ where: { code: row.item_code } });
            if (!service) {
              throw new Error(`Row ${rowNumber}: Service with code '${row.item_code}' not found`);
            }
            itemId = service.id;
            itemType = 'service';
            break;

          case 'INVESTIGATION':
            const investigation = await Investigation.findOne({ where: { code: row.item_code } });
            if (!investigation) {
              throw new Error(
                `Row ${rowNumber}: Investigation with code '${row.item_code}' not found`
              );
            }
            itemId = investigation.id;
            itemType = 'investigation';
            break;

          default:
            throw new Error(`Row ${rowNumber}: Invalid item type '${row.item_type}'`);
        }

        // Create pricing data
        const pricingData: HMOPricingData = {
          hmo_id: insurance.id, // Map insurance.id to hmo_id for the interface
          hmo_price: row.hmo_price,
          patient_percentage: row.patient_percentage,
          hmo_percentage: row.hmo_percentage,
          effective_from: effectiveFrom,
          effective_to: effectiveTo,
          status: 'Active',
          notes: row.notes,
        };

        // Set the appropriate ID field
        switch (itemType) {
          case 'drug':
            pricingData.drug_id = itemId;
            break;
          case 'test':
            pricingData.test_id = itemId;
            break;
          case 'service':
            pricingData.service_id = itemId;
            break;
          case 'investigation':
            pricingData.investigation_id = itemId;
            break;
        }

        // Create the pricing
        let result;
        switch (itemType) {
          case 'drug':
            result = await this.createDrugPricing(pricingData);
            break;
          case 'test':
            result = await this.createTestPricing(pricingData);
            break;
          case 'service':
            result = await this.createServicePricing(pricingData);
            break;
          case 'investigation':
            result = await this.createInvestigationPricing(pricingData);
            break;
        }

        results.push({
          success: true,
          data: result,
          row: rowNumber,
          item_code: row.item_code,
          item_type: row.item_type,
        });
        successCount++;
      } catch (error) {
        const errorMessage = `Row ${rowNumber}: ${error.message}`;
        errors.push(errorMessage);

        results.push({
          success: false,
          error: errorMessage,
          row: rowNumber,
          item_code: row.item_code,
          item_type: row.item_type,
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
      errors,
    };
  }

  /**
   * Get pricing summary by insurance
   */
  static async getPricingSummaryByInsurance(
    insuranceId: number
  ): Promise<{
    insurance: Insurance;
    total_items: number;
    drugs_count: number;
    tests_count: number;
    services_count: number;
    investigations_count: number;
    total_value: number;
    average_patient_percentage: number;
    average_hmo_percentage: number;
  }> {
    const insurance = await Insurance.findByPk(insuranceId);
    if (!insurance) {
      throw new BadException('NOT_FOUND', 404, 'Insurance not found');
    }

    const [drugs, tests, services, investigations] = await Promise.all([
      HMODrugPricing.count({ where: { insurance_id: insuranceId, status: 'Active' } }),
      HMOTestPricing.count({ where: { insurance_id: insuranceId, status: 'Active' } }),
      HMOServicePricing.count({ where: { insurance_id: insuranceId, status: 'Active' } }),
      HMOInvestigationPricing.count({ where: { insurance_id: insuranceId, status: 'Active' } }),
    ]);

    const totalItems = drugs + tests + services + investigations;

    // Calculate averages
    const [drugPricing, testPricing, servicePricing, investigationPricing] = await Promise.all([
      HMODrugPricing.findAll({
        where: { insurance_id: insuranceId, status: 'Active' },
        attributes: ['patient_percentage', 'hmo_percentage', 'hmo_price'],
      }),
      HMOTestPricing.findAll({
        where: { insurance_id: insuranceId, status: 'Active' },
        attributes: ['patient_percentage', 'hmo_percentage', 'hmo_price'],
      }),
      HMOServicePricing.findAll({
        where: { insurance_id: insuranceId, status: 'Active' },
        attributes: ['patient_percentage', 'hmo_percentage', 'hmo_price'],
      }),
      HMOInvestigationPricing.findAll({
        where: { insurance_id: insuranceId, status: 'Active' },
        attributes: ['patient_percentage', 'hmo_percentage', 'hmo_price'],
      }),
    ]);

    const allPricing = [...drugPricing, ...testPricing, ...servicePricing, ...investigationPricing];

    const totalValue = allPricing.reduce((sum, item) => sum + (item.hmo_price || 0), 0);
    const averagePatientPercentage =
      allPricing.length > 0
        ? allPricing.reduce((sum, item) => sum + (item.patient_percentage || 0), 0) /
          allPricing.length
        : 0;
    const averageHmoPercentage =
      allPricing.length > 0
        ? allPricing.reduce((sum, item) => sum + (item.hmo_percentage || 0), 0) / allPricing.length
        : 0;

    return {
      insurance,
      total_items: totalItems,
      drugs_count: drugs,
      tests_count: tests,
      services_count: services,
      investigations_count: investigations,
      total_value: totalValue,
      average_patient_percentage: averagePatientPercentage,
      average_hmo_percentage: averageHmoPercentage,
    };
  }

  /**
   * Export pricing data to CSV format
   */
  static async exportPricingToCSV(
    insuranceId?: number
  ): Promise<{
    headers: string[];
    data: any[];
    filename: string;
  }> {
    const where: any = { status: 'Active' };
    if (insuranceId) {
      where.insurance_id = insuranceId;
    }

    const [drugs, tests, services, investigations] = await Promise.all([
      HMODrugPricing.findAll({
        where,
        include: [
          { model: Drug, attributes: ['name', 'code'] },
          { model: Insurance, attributes: ['name', 'code'] },
        ],
      }),
      HMOTestPricing.findAll({
        where,
        include: [
          { model: Test, attributes: ['name', 'code'] },
          { model: Insurance, attributes: ['name', 'code'] },
        ],
      }),
      HMOServicePricing.findAll({
        where,
        include: [
          { model: Service, attributes: ['name', 'code'] },
          { model: Insurance, attributes: ['name', 'code'] },
        ],
      }),
      HMOInvestigationPricing.findAll({
        where,
        include: [
          { model: Investigation, attributes: ['name', 'code'] },
          { model: Insurance, attributes: ['name', 'code'] },
        ],
      }),
    ]);

    const headers = [
      'Item Type',
      'Item Code',
      'Item Name',
      'Insurance Name',
      'HMO Price',
      'Patient Percentage',
      'HMO Percentage',
      'Effective From',
      'Effective To',
      'Status',
      'Notes',
    ];

    const data = [
      ...drugs.map(item => [
        'DRUG',
        item.drug?.code || '',
        item.drug?.name || '',
        item.insurance?.name || '',
        item.hmo_price,
        item.patient_percentage,
        item.hmo_percentage,
        item.effective_from,
        item.effective_to,
        item.status,
        item.notes || '',
      ]),
      ...tests.map(item => [
        'TEST',
        item.test?.code || '',
        item.test?.name || '',
        item.insurance?.name || '',
        item.hmo_price,
        item.patient_percentage,
        item.hmo_percentage,
        item.effective_from,
        item.effective_to,
        item.status,
        item.notes || '',
      ]),
      ...services.map(item => [
        'SERVICE',
        item.service?.code || '',
        item.service?.name || '',
        item.insurance?.name || '',
        item.hmo_price,
        item.patient_percentage,
        item.hmo_percentage,
        item.effective_from,
        item.effective_to,
        item.status,
        item.notes || '',
      ]),
      ...investigations.map(item => [
        'INVESTIGATION',
        item.investigation?.name || '', // Use name since Investigation doesn't have code
        item.investigation?.name || '',
        item.insurance?.name || '',
        item.hmo_price,
        item.patient_percentage,
        item.hmo_percentage,
        item.effective_from,
        item.effective_to,
        item.status,
        item.notes || '',
      ]),
    ];

    const filename = `hmo_pricing_${insuranceId ? `insurance_${insuranceId}` : 'all'}_${
      new Date().toISOString().split('T')[0]
    }.csv`;

    return {
      headers,
      data,
      filename,
    };
  }

  /**
   * Get all HMO drug pricing with pagination
   */
  static async getAllDrugPricing(
    filters: any = {}
  ): Promise<{
    items: HMODrugPricing[];
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  }> {
    const where: any = {};

    if (filters.insurance_id) where.insurance_id = filters.insurance_id;
    if (filters.status) where.status = filters.status;
    if (filters.drug_id) where.drug_id = filters.drug_id;

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const { limit: queryLimit, offset } = calcLimitAndOffset(page, limit);

    const { count, rows } = await HMODrugPricing.findAndCountAll({
      where,
      include: [
        { model: Drug, as: 'drug', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
        { model: HMO, as: 'hmo', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset,
    });

    const paginatedData = paginate({ rows, count }, page, limit);

    return {
      items: paginatedData.docs,
      total: paginatedData.total,
      pages: paginatedData.pages,
      currentPage: paginatedData.currentPage,
      perPage: paginatedData.perPage,
    };
  }

  /**
   * Get HMO drug pricing by ID
   */
  static async getDrugPricingById(id: number): Promise<HMODrugPricing | null> {
    return await HMODrugPricing.findByPk(id, {
      include: [
        { model: Drug, as: 'drug', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
      ],
    });
  }

  /**
   * Update HMO drug pricing
   */
  static async updateDrugPricing(
    id: number,
    data: Partial<HMOPricingData>
  ): Promise<HMODrugPricing> {
    const pricing = await HMODrugPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Drug pricing not found');
    }

    return await pricing.update(data);
  }

  /**
   * Delete HMO drug pricing
   */
  static async deleteDrugPricing(id: number): Promise<void> {
    const pricing = await HMODrugPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Drug pricing not found');
    }

    await pricing.destroy();
  }

  /**
   * Get all HMO test pricing with pagination
   */
  static async getAllTestPricing(
    filters: any = {}
  ): Promise<{
    items: HMOTestPricing[];
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  }> {
    const where: any = {};

    if (filters.insurance_id) where.insurance_id = filters.insurance_id;
    if (filters.status) where.status = filters.status;
    if (filters.test_id) where.test_id = filters.test_id;

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const { limit: queryLimit, offset } = calcLimitAndOffset(page, limit);

    const { count, rows } = await HMOTestPricing.findAndCountAll({
      where,
      include: [
        { model: Test, as: 'test', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
        { model: HMO, as: 'hmo', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset,
    });

    const paginatedData = paginate({ rows, count }, page, limit);

    return {
      items: paginatedData.docs,
      total: paginatedData.total,
      pages: paginatedData.pages,
      currentPage: paginatedData.currentPage,
      perPage: paginatedData.perPage,
    };
  }

  /**
   * Get HMO test pricing by ID
   */
  static async getTestPricingById(id: number): Promise<HMOTestPricing | null> {
    return await HMOTestPricing.findByPk(id, {
      include: [
        { model: Test, as: 'test', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
      ],
    });
  }

  /**
   * Update HMO test pricing
   */
  static async updateTestPricing(
    id: number,
    data: Partial<HMOPricingData>
  ): Promise<HMOTestPricing> {
    const pricing = await HMOTestPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Test pricing not found');
    }

    return await pricing.update(data);
  }

  /**
   * Delete HMO test pricing
   */
  static async deleteTestPricing(id: number): Promise<void> {
    const pricing = await HMOTestPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Test pricing not found');
    }

    await pricing.destroy();
  }

  /**
   * Get all HMO service pricing with pagination
   */
  static async getAllServicePricing(
    filters: any = {}
  ): Promise<{
    items: HMOServicePricing[];
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  }> {
    const where: any = {};

    if (filters.insurance_id) where.insurance_id = filters.insurance_id;
    if (filters.status) where.status = filters.status;
    if (filters.service_id) where.service_id = filters.service_id;

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const { limit: queryLimit, offset } = calcLimitAndOffset(page, limit);

    const { count, rows } = await HMOServicePricing.findAndCountAll({
      where,
      include: [
        { model: Service, as: 'service', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
        { model: HMO, as: 'hmo', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset,
    });

    const paginatedData = paginate({ rows, count }, page, limit);

    return {
      items: paginatedData.docs,
      total: paginatedData.total,
      pages: paginatedData.pages,
      currentPage: paginatedData.currentPage,
      perPage: paginatedData.perPage,
    };
  }

  /**
   * Get HMO service pricing by ID
   */
  static async getServicePricingById(id: number): Promise<HMOServicePricing | null> {
    return await HMOServicePricing.findByPk(id, {
      include: [
        { model: Service, as: 'service', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
      ],
    });
  }

  /**
   * Update HMO service pricing
   */
  static async updateServicePricing(
    id: number,
    data: Partial<HMOPricingData>
  ): Promise<HMOServicePricing> {
    const pricing = await HMOServicePricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Service pricing not found');
    }

    return await pricing.update(data);
  }

  /**
   * Delete HMO service pricing
   */
  static async deleteServicePricing(id: number): Promise<void> {
    const pricing = await HMOServicePricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Service pricing not found');
    }

    await pricing.destroy();
  }

  /**
   * Get all HMO investigation pricing with pagination
   */
  static async getAllInvestigationPricing(
    filters: any = {}
  ): Promise<{
    items: HMOInvestigationPricing[];
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  }> {
    const where: any = {};

    if (filters.insurance_id) where.insurance_id = filters.insurance_id;
    if (filters.status) where.status = filters.status;
    if (filters.investigation_id) where.investigation_id = filters.investigation_id;

    // Pagination parameters
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const { limit: queryLimit, offset } = calcLimitAndOffset(page, limit);

    const { count, rows } = await HMOInvestigationPricing.findAndCountAll({
      where,
      include: [
        { model: Investigation, as: 'investigation', attributes: ['id', 'name'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
        { model: HMO, as: 'hmo', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset,
    });

    const paginatedData = paginate({ rows, count }, page, limit);

    return {
      items: paginatedData.docs,
      total: paginatedData.total,
      pages: paginatedData.pages,
      currentPage: paginatedData.currentPage,
      perPage: paginatedData.perPage,
    };
  }

  /**
   * Get HMO investigation pricing by ID
   */
  static async getInvestigationPricingById(id: number): Promise<HMOInvestigationPricing | null> {
    return await HMOInvestigationPricing.findByPk(id, {
      include: [
        { model: Investigation, as: 'investigation', attributes: ['id', 'name', 'code'] },
        { model: Insurance, as: 'insurance', attributes: ['id', 'name'] },
      ],
    });
  }

  /**
   * Update HMO investigation pricing
   */
  static async updateInvestigationPricing(
    id: number,
    data: Partial<HMOPricingData>
  ): Promise<HMOInvestigationPricing> {
    const pricing = await HMOInvestigationPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Investigation pricing not found');
    }

    return await pricing.update(data);
  }

  /**
   * Delete HMO investigation pricing
   */
  static async deleteInvestigationPricing(id: number): Promise<void> {
    const pricing = await HMOInvestigationPricing.findByPk(id);
    if (!pricing) {
      throw new BadException('NOT_FOUND', 404, 'Investigation pricing not found');
    }

    await pricing.destroy();
  }
}
