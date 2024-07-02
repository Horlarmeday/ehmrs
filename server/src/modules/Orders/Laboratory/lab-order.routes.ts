import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import LabOrderController from './lab-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';

const router = Router();
router.post('/create/:id', verify, patientMustBeDiagnosed, LabOrderController.orderLabTest);
router.get('/get', verify, LabOrderController.getPrescribedTests);
router.put('/update', verify, LabOrderController.updatePrescribedTest);
router.delete('/delete', verify, LabOrderController.deletePrescribedTest);

export default router;
