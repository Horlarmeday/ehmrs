import { Router } from 'express';
import PharmacyController from './pharmacy.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/generic/create', verify, PharmacyController.createGenericDrug);
router.put('/generic/update', verify, PharmacyController.updateGenericDrug);
router.get('/generic/get', verify, PharmacyController.getGenericDrugs);

export default router;
