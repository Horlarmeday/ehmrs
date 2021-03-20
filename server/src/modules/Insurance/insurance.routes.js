import { Router } from 'express';
import InsuranceController from './insurance.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/create', verify, InsuranceController.createInsurance);
router.post('/create/hmo', verify, InsuranceController.createHMO);
router.put('/update', verify, InsuranceController.updateInsurance);
router.put('/update/hmo', verify, InsuranceController.updateHMO);
router.get('/get', verify, InsuranceController.getInsurances);
router.get('/get/hmo', verify, InsuranceController.getHMOs);

export default router;
