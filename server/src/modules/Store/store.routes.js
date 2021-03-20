import { Router } from 'express';
import StoreController from './store.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/pharmacy/generic/create', verify, StoreController.createGenericDrug);
router.post('/pharmacy/items/create', verify, StoreController.createPharmacyItem);
router.put('/pharmacy/generic/update', verify, StoreController.updateGenericDrug);
router.get('/pharmacy/generic/get', verify, StoreController.getGenericDrugs);
router.get('/pharmacy/items/get', verify, StoreController.getPharmacyItems);

export default router;
