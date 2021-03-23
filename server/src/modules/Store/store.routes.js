import { Router } from 'express';
import StoreController from './store.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/pharmacy/items/create', verify, StoreController.createPharmacyItem);
router.get('/pharmacy/items/get', verify, StoreController.getPharmacyItems);

export default router;
