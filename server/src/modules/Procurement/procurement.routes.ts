import { Router } from 'express';
import { ProcurementController } from './procurement.controller';
import {
  validateCreateOrder,
  validateUpdateOrder,
  validateApproveOrder,
  validateSendOrder,
  validateReceiveOrderItems,
  validateCancelOrder,
} from './validations';
import verify from '../../core/middleware/verify';

const router = Router();

router.use(verify);

/**
 * Procurement Orders Routes
 */
router.post('/orders', validateCreateOrder, ProcurementController.createProcurementOrder);
router.get('/orders', ProcurementController.getProcurementOrders);
router.get('/orders/:id', ProcurementController.getProcurementOrder);
router.put('/orders/:id', validateUpdateOrder, ProcurementController.updateProcurementOrder);

/**
 * Procurement Workflow Routes
 */
router.post('/orders/:id/approve', ProcurementController.approveProcurementOrder);
router.post('/orders/:id/send', validateSendOrder, ProcurementController.sendProcurementOrder);
router.post(
  '/orders/:id/receive',
  validateReceiveOrderItems,
  ProcurementController.receiveProcurementOrderItems
);
router.post(
  '/orders/:id/cancel',
  validateCancelOrder,
  ProcurementController.cancelProcurementOrder
);

/**
 * Procurement Analytics Routes
 */
router.get('/statistics', ProcurementController.getProcurementStatistics);
router.get('/vendors/:vendorId/performance', ProcurementController.getVendorPerformance);

/**
 * Procurement Reports Routes
 */
router.get('/reports', ProcurementController.getProcurementReports);
router.get('/export', ProcurementController.exportProcurementReport);

export default router;
