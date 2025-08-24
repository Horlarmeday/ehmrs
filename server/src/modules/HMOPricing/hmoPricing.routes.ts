import { Router } from 'express';
import { HMOPricingController } from './hmoPricing.controller';
import {
  validateBulkCreatePricing,
  validateCSVUpload,
  validateCalculateDrugPricing,
  validateCalculateTestPricing,
  validateCalculateServicePricing,
  validateCalculateInvestigationPricing,
  validateCreateDrugPricing,
  validateCreateTestPricing,
  validateCreateServicePricing,
  validateCreateInvestigationPricing,
} from './validations';

const router = Router();

/**
 * HMO Drug Pricing Routes
 */
// GET routes for fetching pricing data
router.get('/drugs', HMOPricingController.getDrugPricing);
router.get('/drugs/:id', HMOPricingController.getDrugPricingById);

// POST routes for creating and calculating
router.post('/drugs', validateCreateDrugPricing, HMOPricingController.createDrugPricing);
router.post(
  '/calculate/drugs',
  validateCalculateDrugPricing,
  HMOPricingController.calculateDrugPricing
);

// PUT and DELETE routes for updating and deleting
router.put('/drugs/:id', validateCreateDrugPricing, HMOPricingController.updateDrugPricing);
router.delete('/drugs/:id', HMOPricingController.deleteDrugPricing);

/**
 * HMO Test Pricing Routes
 */
// GET routes for fetching pricing data
router.get('/tests', HMOPricingController.getTestPricing);
router.get('/tests/:id', HMOPricingController.getTestPricingById);

// POST routes for creating and calculating
router.post('/tests', validateCreateTestPricing, HMOPricingController.createTestPricing);
router.post(
  '/calculate/tests',
  validateCalculateTestPricing,
  HMOPricingController.calculateTestPricing
);

// PUT and DELETE routes for updating and deleting
router.put('/tests/:id', validateCreateTestPricing, HMOPricingController.updateTestPricing);
router.delete('/tests/:id', HMOPricingController.deleteTestPricing);

/**
 * HMO Service Pricing Routes
 */
// GET routes for fetching pricing data
router.get('/services', HMOPricingController.getServicePricing);
router.get('/services/:id', HMOPricingController.getServicePricingById);

// POST routes for creating and calculating
router.post('/services', validateCreateServicePricing, HMOPricingController.createServicePricing);
router.post(
  '/calculate/services',
  validateCalculateServicePricing,
  HMOPricingController.calculateServicePricing
);

// PUT and DELETE routes for updating and deleting
router.put('/services/:id', validateCreateServicePricing, HMOPricingController.updateServicePricing);
router.delete('/services/:id', HMOPricingController.deleteServicePricing);

/**
 * HMO Investigation Pricing Routes
 */
// GET routes for fetching pricing data
router.get('/investigations', HMOPricingController.getInvestigationPricing);
router.get('/investigations/:id', HMOPricingController.getInvestigationPricingById);

// POST routes for creating and calculating
router.post(
  '/investigations',
  validateCreateInvestigationPricing,
  HMOPricingController.createInvestigationPricing
);
router.post(
  '/calculate/investigations',
  validateCalculateInvestigationPricing,
  HMOPricingController.calculateInvestigationPricing
);

// PUT and DELETE routes for updating and deleting
router.put('/investigations/:id', validateCreateInvestigationPricing, HMOPricingController.updateInvestigationPricing);
router.delete('/investigations/:id', HMOPricingController.deleteInvestigationPricing);

/**
 * Bulk Operations Routes
 */
router.post('/bulk', validateBulkCreatePricing, HMOPricingController.bulkCreatePricing);
router.post('/csv-upload', validateCSVUpload, HMOPricingController.processCSVPricing);

/**
 * Query and Export Routes
 */
router.get('/insurance/:insuranceId', HMOPricingController.getInsurancePricing);
router.get('/export', HMOPricingController.exportPricingToCSV);
router.get('/summary', HMOPricingController.getPricingSummary);

export default router;
