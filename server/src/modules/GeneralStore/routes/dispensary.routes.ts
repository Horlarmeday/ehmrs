import express from 'express';
import { DispensaryController } from '../controllers/dispensary.controller';
import verify from '../../../core/middleware/verify';

const router = express.Router();

// Dispensary Management Routes
router.post('/', verify, DispensaryController.createDispensary);

router.get(
  '/',
  verify,

  DispensaryController.getAllDispensaries
);

router.get(
  '/:id',
  verify,

  DispensaryController.getDispensaryById
);

router.put(
  '/:id',
  verify,

  DispensaryController.updateDispensary
);

router.get(
  '/:id/stock',
  verify,

  DispensaryController.getDispensaryStock
);

router.get('/:id/summary', verify, DispensaryController.getStockSummary);

router.get('/:id/metrics', verify, DispensaryController.getDispensaryMetrics);

// Inventory Operations Routes
router.post('/transfer', verify, DispensaryController.transferToDispensary);

router.post('/dispense', verify, DispensaryController.dispenseFromDispensary);

// Request Management Routes
router.post('/requests', verify, DispensaryController.createRequest);

router.get('/requests/pending', verify, DispensaryController.getPendingRequests);

router.get('/requests/history', verify, DispensaryController.getRequestHistory);

router.post('/requests/:id/approve', verify, DispensaryController.approveRequest);

// Workflow and Reporting Routes
router.get('/workflow/metrics', verify, DispensaryController.getWorkflowMetrics);

router.post('/workflow/auto-replenish', verify, DispensaryController.autoReplenish);

router.get('/reports/cross-store', verify, DispensaryController.getCrossStoreReport);

export default router;
