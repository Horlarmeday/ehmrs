import { Router } from 'express';
import { StockAuditController } from './stockAudit.controller';
import {
  validateCreateAudit,
  validateUpdateAudit,
  validateStartAudit,
  validateCompleteAudit,
  validateApproveAudit,
} from './validations';

const router = Router();

/**
 * Stock Audit CRUD Routes
 */
router.post('/', validateCreateAudit, StockAuditController.createStockAudit);
router.get('/', StockAuditController.getStockAudits);
router.get('/:id', StockAuditController.getStockAudit);
router.put('/:id', validateUpdateAudit, StockAuditController.updateStockAudit);

/**
 * Stock Audit Workflow Routes
 */
router.post('/:id/start', validateStartAudit, StockAuditController.startStockAudit);
router.post('/:id/complete', validateCompleteAudit, StockAuditController.completeStockAudit);
router.post('/:id/approve', validateApproveAudit, StockAuditController.approveStockAudit);

/**
 * Stock Audit Analysis Routes
 */
router.get('/:id/variance', StockAuditController.getVarianceAnalysis);
router.get('/statistics', StockAuditController.getStockAuditStatistics);
router.get('/performance', StockAuditController.getStoreTypePerformance);

/**
 * Stock Audit Export Routes
 */
router.get('/:id/export', StockAuditController.exportAuditReport);

export default router;
