import { Router } from 'express';
import StoreController from './store.controller';
import { ReportsController } from './reports.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/pharmacy/items/create', verify, StoreController.createPharmacyItem);
router.post('/pharmacy/items/dispense', verify, StoreController.dispenseStoreItems);
router.post('/pharmacy/items/reorder', verify, StoreController.reorderStoreItems);
router.post('/pharmacy/items/export', verify, StoreController.exportData);
router.post('/laboratory/items/create', verify, StoreController.createLaboratoryItem);
router.post('/pharmacy/vendors/create', verify, StoreController.createVendor);
router.get('/pharmacy/selected-items', verify, StoreController.getSelectedPharmacyStoreItems);
router.get('/pharmacy/items/get', verify, StoreController.getPharmacyStoreItems);
router.get('/pharmacy/vendors/get', verify, StoreController.getVendors);
router.get('/pharmacy/items/:id', verify, StoreController.getPharmacyStoreItem);
router.get('/pharmacy/items/history/:id', verify, StoreController.getPharmacyStoreItemHistory);
router.get('/pharmacy/items/logs/:id', verify, StoreController.getPharmacyStoreItemLogs);
router.get('/laboratory/items/get', verify, StoreController.getLaboratoryItems);
router.put('/pharmacy/items/deactivate', verify, StoreController.deactivatePharmacyItems);
router.put('/pharmacy/items/update', verify, StoreController.updatePharmacyItems);
router.put('/pharmacy/items/reset', verify, StoreController.resetPharmacyStoreItemsQuantity);
router.put('/pharmacy/vendors/update/:id', verify, StoreController.updateVendor);

// Reports routes
router.get('/reports/dashboard', verify, ReportsController.getDashboardOverview);
router.get('/reports/inventory-movements', verify, ReportsController.getInventoryMovements);
router.get('/reports/sales-performance', verify, ReportsController.getSalesPerformance);
router.get('/reports/expiry-tracking', verify, ReportsController.getExpiryTracking);
router.get('/reports/stock-levels', verify, ReportsController.getStockLevels);
router.get('/reports/trends-analysis', verify, ReportsController.getTrendsAnalysis);
router.get('/reports/movement-history', verify, ReportsController.getMovementHistory);
router.get('/reports/pharmacy-analytics', verify, ReportsController.getPharmacyAnalytics);
router.get('/reports/revenue-analysis', verify, ReportsController.getRevenueAnalysis);
router.get('/reports/config', verify, ReportsController.getReportConfig);
router.get('/reports/cached/:reportType/:cacheKey', verify, ReportsController.getCachedReport);
router.get('/reports/export/csv', verify, ReportsController.exportToCSV);
router.get('/reports/export/pdf', verify, ReportsController.exportToPDF);
router.post('/reports/schedule', verify, ReportsController.scheduleReport);

// New pharmacy reports endpoints
router.get('/reports/inventory', verify, StoreController.getInventoryReports);
router.get('/reports/dispense', verify, StoreController.getDispenseReports);
router.get('/reports/expiry', verify, StoreController.getExpiryReports);
router.get('/reports/stock-levels-analysis', verify, StoreController.getStockLevelReports);
router.get('/reports/vendor-performance', verify, StoreController.getVendorPerformanceReports);

export default router;
