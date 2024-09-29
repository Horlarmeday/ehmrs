import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { RadiologyOrderController } from './radiology-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';
import { createEncounter } from '../../../core/middleware/createEncounter';

const router = Router();
router.post(
  '/create/:id',
  verify,
  patientMustBeDiagnosed,
  createEncounter,
  RadiologyOrderController.orderInvestigationTest
);
router.get('/get', verify, RadiologyOrderController.getPrescribedInvestigations);
router.put('/update', verify, RadiologyOrderController.updatePrescribedInvestigation);
router.delete('/delete', verify, RadiologyOrderController.deletePrescribedInvestigation);

export default router;
