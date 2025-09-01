import { Router } from 'express';
import { GeneralStoreController } from './generalStore.controller';
import verify from '../../core/middleware/verify';
import { authorize } from '../../core/middleware/authorize';

const router = Router();

// Apply authorization middleware to all routes
router.use(verify);

// Categories Management
router.get('/categories', GeneralStoreController.getCategories);
router.get('/categories/:id', GeneralStoreController.getCategoryById);
router.post('/categories', GeneralStoreController.createCategory);
router.put('/categories/:id', GeneralStoreController.updateCategory);
router.delete('/categories/:id', authorize(['admin']), GeneralStoreController.deleteCategory);
router.get('/categories/:id/subcategories', GeneralStoreController.getSubcategoriesByCategory);

// Subcategories Management
router.get('/subcategories', GeneralStoreController.getSubcategories);
router.get('/subcategories/:id', GeneralStoreController.getSubcategoryById);
router.post('/subcategories', GeneralStoreController.createSubcategory);
router.put('/subcategories/:id', GeneralStoreController.updateSubcategory);
router.delete('/subcategories/:id', authorize(['admin']), GeneralStoreController.deleteSubcategory);

// Items Management
router.get('/items', GeneralStoreController.getItems);
router.get('/items/search', GeneralStoreController.searchItems);
router.get('/items/low-stock', GeneralStoreController.getLowStockItems);
router.get('/items/expiring', GeneralStoreController.getExpiringItems);
router.get('/items/:id', GeneralStoreController.getItemById);
router.post('/items', GeneralStoreController.createItem);
router.put('/items/:id', GeneralStoreController.updateItem);
router.delete('/items/:id', GeneralStoreController.deleteItem);

// Stock Movements
router.get('/movements', GeneralStoreController.getMovements);
router.post('/movements', GeneralStoreController.createMovement);
router.get('/movements/item/:itemId', GeneralStoreController.getItemMovements);

// Request Management
router.get('/requests', GeneralStoreController.getRequests);
router.get('/requests/my-requests', GeneralStoreController.getMyRequests);
router.get('/requests/pending-approval', GeneralStoreController.getPendingApprovalRequests);
router.get('/requests/:id', GeneralStoreController.getRequestById);
router.post('/requests', GeneralStoreController.createRequest);
// router.put('/requests/:id', GeneralStoreController.updateRequest);
router.put('/requests/:id/approve', GeneralStoreController.approveRequest);
router.put('/requests/:id/reject', GeneralStoreController.rejectRequest);
router.put('/requests/:id/fulfill', GeneralStoreController.fulfillRequest);

// Reports and Analytics
router.get('/reports/stock', GeneralStoreController.getStockReport);
router.get('/reports/movements', GeneralStoreController.getMovementReport);
router.get('/reports/usage', GeneralStoreController.getUsageReport);
router.get('/reports/costs', GeneralStoreController.getCostReport);
router.get('/reports/low-stock', GeneralStoreController.getLowStockReport);
router.get('/reports/expiring', GeneralStoreController.getExpiringReport);

// Export Reports
// router.get('/reports/stock/export', GeneralStoreController.exportStockReport);
// router.get('/reports/movements/export', GeneralStoreController.exportMovementReport);
// router.get('/reports/usage/export', GeneralStoreController.exportUsageReport);
// router.get('/reports/costs/export', GeneralStoreController.exportCostReport);

// Settings
router.get('/settings', GeneralStoreController.getSettings);
router.put('/settings', GeneralStoreController.updateSettings);

// Audit Logs
router.get('/audit-logs', GeneralStoreController.getAuditLogs);

export default router;
