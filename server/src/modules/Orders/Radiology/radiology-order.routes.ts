import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { RadiologyOrderController } from './radiology-order.controller';

const router = Router();
router.post('/create/:id', verify, RadiologyOrderController.orderInvestigationTest);
router.get('/get', verify, RadiologyOrderController.getPrescribedInvestigations);
router.put('/update', verify, RadiologyOrderController.updatePrescribedInvestigation);
router.delete('/delete', verify, RadiologyOrderController.deletePrescribedInvestigation);

export default router;
