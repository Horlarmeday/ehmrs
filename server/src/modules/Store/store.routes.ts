import { Router } from 'express';
import StoreController from './store.controller';
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

export default router;
