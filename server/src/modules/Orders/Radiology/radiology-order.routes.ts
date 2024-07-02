import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { RadiologyOrderController } from './radiology-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';

const router = Router();
router.post(
  '/create/:id',
  verify,
  patientMustBeDiagnosed,
  RadiologyOrderController.orderInvestigationTest
);
router.get('/get', verify, RadiologyOrderController.getPrescribedInvestigations);
router.put('/update', verify, RadiologyOrderController.updatePrescribedInvestigation);
router.delete('/delete', verify, RadiologyOrderController.deletePrescribedInvestigation);

export default router;
