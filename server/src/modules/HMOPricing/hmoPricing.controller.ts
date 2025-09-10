import { Request, Response } from 'express';
import { HMOPricingService } from './hmoPricing.service';
import { BadException } from '../../common/util/api-error';

export class HMOPricingController {
  /**
   * Create HMO drug pricing
   * POST /api/hmo-pricing/drugs
   */
  static async createDrugPricing(req: Request, res: Response) {
    try {
      const pricing = await HMOPricingService.createDrugPricing(req.body);
      res.status(201).json({
        success: true,
        message: 'HMO drug pricing created successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Create HMO test pricing
   * POST /api/hmo-pricing/tests
   */
  static async createTestPricing(req: Request, res: Response) {
    try {
      const pricing = await HMOPricingService.createTestPricing(req.body);
      res.status(201).json({
        success: true,
        message: 'HMO test pricing created successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Create HMO service pricing
   * POST /api/hmo-pricing/services
   */
  static async createServicePricing(req: Request, res: Response) {
    try {
      const pricing = await HMOPricingService.createServicePricing(req.body);
      res.status(201).json({
        success: true,
        message: 'HMO service pricing created successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Create HMO investigation pricing
   * POST /api/hmo-pricing/investigations
   */
  static async createInvestigationPricing(req: Request, res: Response) {
    try {
      const pricing = await HMOPricingService.createInvestigationPricing(req.body);
      res.status(201).json({
        success: true,
        message: 'HMO investigation pricing created successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get insurance pricing
   * GET /api/hmo-pricing/insurance/:insuranceId
   */
  static async getInsurancePricing(req: Request, res: Response) {
    try {
      const { insuranceId } = req.params;
      const pricing = await HMOPricingService.getInsurancePricing(parseInt(insuranceId));
      res.status(200).json({
        success: true,
        message: 'Insurance pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Calculate drug pricing
   * POST /api/hmo-pricing/calculate/drugs
   */
  static async calculateDrugPricing(req: Request, res: Response) {
    try {
      const { drug_id, insurance_id, quantity = 1 } = req.body;
      const pricing = await HMOPricingService.calculateDrugPricing(drug_id, insurance_id, quantity);
      res.status(200).json({
        success: true,
        message: 'Drug pricing calculated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Calculate test pricing
   * POST /api/hmo-pricing/calculate/tests
   */
  static async calculateTestPricing(req: Request, res: Response) {
    try {
      const { test_id, insurance_id } = req.body;
      const pricing = await HMOPricingService.calculateTestPricing(test_id, insurance_id);
      res.status(200).json({
        success: true,
        message: 'Test pricing calculated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Calculate service pricing
   * POST /api/hmo-pricing/calculate/services
   */
  static async calculateServicePricing(req: Request, res: Response) {
    try {
      const { service_id, insurance_id } = req.body;
      const pricing = await HMOPricingService.calculateServicePricing(service_id, insurance_id);
      res.status(200).json({
        success: true,
        message: 'Service pricing calculated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Calculate investigation pricing
   * POST /api/hmo-pricing/calculate/investigations
   */
  static async calculateInvestigationPricing(req: Request, res: Response) {
    try {
      const { investigation_id, insurance_id } = req.body;
      const pricing = await HMOPricingService.calculateInvestigationPricing(
        investigation_id,
        insurance_id
      );
      res.status(200).json({
        success: true,
        message: 'Investigation pricing calculated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Bulk create pricing
   * POST /api/hmo-pricing/bulk
   */
  static async bulkCreatePricing(req: Request, res: Response) {
    try {
      const result = await HMOPricingService.bulkCreatePricing(req.body);
      res.status(201).json({
        success: true,
        message: 'Bulk pricing created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Process CSV pricing
   * POST /api/hmo-pricing/csv-upload
   */
  static async processCSVPricing(req: Request, res: Response) {
    try {
      const result = await HMOPricingService.processCSVPricing(req.body);
      res.status(200).json({
        success: true,
        message: 'CSV pricing processed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Export pricing to CSV
   * GET /api/hmo-pricing/export
   */
  static async exportPricingToCSV(req: Request, res: Response) {
    try {
      const { insurance_id } = req.query;
      const insuranceId = insurance_id ? parseInt(insurance_id as string) : undefined;
      const result = await HMOPricingService.exportPricingToCSV(insuranceId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

      // Convert data to CSV format
      const csvContent = [result.headers.join(','), ...result.data.map(row => row.join(','))].join(
        '\n'
      );

      res.status(200).send(csvContent);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get pricing summary
   * GET /api/hmo-pricing/summary
   */
  static async getPricingSummary(req: Request, res: Response) {
    try {
      const { insurance_id } = req.query;
      const summary = await HMOPricingService.getPricingSummaryByInsurance(
        parseInt(insurance_id as string) || 0
      );
      res.status(200).json({
        success: true,
        message: 'HMO pricing summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get all HMO drug pricing
   * GET /api/hmo-pricing/drugs
   */
  static async getDrugPricing(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pricing = await HMOPricingService.getAllDrugPricing(filters);
      res.status(200).json({
        success: true,
        message: 'HMO drug pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get HMO drug pricing by ID
   * GET /api/hmo-pricing/drugs/:id
   */
  static async getDrugPricingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.getDrugPricingById(id);

      if (!pricing) {
        res.status(404).json({
          success: false,
          message: 'Drug pricing not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'HMO drug pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Update HMO drug pricing
   * PUT /api/hmo-pricing/drugs/:id
   */
  static async updateDrugPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.updateDrugPricing(id, req.body);
      res.status(200).json({
        success: true,
        message: 'HMO drug pricing updated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Delete HMO drug pricing
   * DELETE /api/hmo-pricing/drugs/:id
   */
  static async deleteDrugPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await HMOPricingService.deleteDrugPricing(id);
      res.status(200).json({
        success: true,
        message: 'HMO drug pricing deleted successfully',
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get all HMO test pricing
   * GET /api/hmo-pricing/tests
   */
  static async getTestPricing(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pricing = await HMOPricingService.getAllTestPricing(filters);
      res.status(200).json({
        success: true,
        message: 'HMO test pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get HMO test pricing by ID
   * GET /api/hmo-pricing/tests/:id
   */
  static async getTestPricingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.getTestPricingById(id);

      if (!pricing) {
        res.status(404).json({
          success: false,
          message: 'Test pricing not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'HMO test pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Update HMO test pricing
   * PUT /api/hmo-pricing/tests/:id
   */
  static async updateTestPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.updateTestPricing(id, req.body);
      res.status(200).json({
        success: true,
        message: 'HMO test pricing updated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Delete HMO test pricing
   * DELETE /api/hmo-pricing/tests/:id
   */
  static async deleteTestPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await HMOPricingService.deleteTestPricing(id);
      res.status(200).json({
        success: true,
        message: 'HMO test pricing deleted successfully',
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get all HMO service pricing
   * GET /api/hmo-pricing/services
   */
  static async getServicePricing(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pricing = await HMOPricingService.getAllServicePricing(filters);
      res.status(200).json({
        success: true,
        message: 'HMO service pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get HMO service pricing by ID
   * GET /api/hmo-pricing/services/:id
   */
  static async getServicePricingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.getServicePricingById(id);

      if (!pricing) {
        res.status(404).json({
          success: false,
          message: 'Service pricing not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'HMO service pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Update HMO service pricing
   * PUT /api/hmo-pricing/services/:id
   */
  static async updateServicePricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.updateServicePricing(id, req.body);
      res.status(200).json({
        success: true,
        message: 'HMO service pricing updated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Delete HMO service pricing
   * DELETE /api/hmo-pricing/services/:id
   */
  static async deleteServicePricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await HMOPricingService.deleteServicePricing(id);
      res.status(200).json({
        success: true,
        message: 'HMO service pricing deleted successfully',
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get all HMO investigation pricing
   * GET /api/hmo-pricing/investigations
   */
  static async getInvestigationPricing(req: Request, res: Response) {
    try {
      const filters = req.query;
      const pricing = await HMOPricingService.getAllInvestigationPricing(filters);
      res.status(200).json({
        success: true,
        message: 'HMO investigation pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Get HMO investigation pricing by ID
   * GET /api/hmo-pricing/investigations/:id
   */
  static async getInvestigationPricingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.getInvestigationPricingById(id);

      if (!pricing) {
        res.status(404).json({
          success: false,
          message: 'Investigation pricing not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'HMO investigation pricing retrieved successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Update HMO investigation pricing
   * PUT /api/hmo-pricing/investigations/:id
   */
  static async updateInvestigationPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pricing = await HMOPricingService.updateInvestigationPricing(id, req.body);
      res.status(200).json({
        success: true,
        message: 'HMO investigation pricing updated successfully',
        data: pricing,
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }

  /**
   * Delete HMO investigation pricing
   * DELETE /api/hmo-pricing/investigations/:id
   */
  static async deleteInvestigationPricing(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await HMOPricingService.deleteInvestigationPricing(id);
      res.status(200).json({
        success: true,
        message: 'HMO investigation pricing deleted successfully',
      });
    } catch (error) {
      if (error instanceof BadException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.error,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    }
  }
}
