import { Router } from 'express';
import StoreController from './store.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/pharmacy/items/create', verify, StoreController.createPharmacyItem);
router.post('/laboratory/items/create', verify, StoreController.createLaboratoryItem);
router.get('/pharmacy/items/get', verify, StoreController.getPharmacyItems);
router.get('/laboratory/items/get', verify, StoreController.getLaboratoryItems);

export default router;
