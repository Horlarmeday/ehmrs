import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import LabOrderController from './lab-order.controller';

const router = Router();
router.post('/create/:id', verify, LabOrderController.orderLabTest);
router.get('/get', verify, LabOrderController.getPrescribedTests);
router.put('/update', verify, LabOrderController.updatePrescribedTest);
router.delete('/delete', verify, LabOrderController.deletePrescribedTest);

export default router;
