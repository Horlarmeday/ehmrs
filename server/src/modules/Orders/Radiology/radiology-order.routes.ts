import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { RadiologyOrderController } from './radiology-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';
import { createEncounter } from '../../../core/middleware/createEncounter';
import checkPatientNotDeceased from '../../../core/middleware/checkPatientNotDeceased';

const router = Router();
router.post(
  '/create/:id',
  verify,
  patientMustBeDiagnosed,
  checkPatientNotDeceased,
  createEncounter,
  RadiologyOrderController.orderInvestigationTest
);
router.get('/get', verify, RadiologyOrderController.getPrescribedInvestigations);
router.get(
  '/prescribed-investigations/:id',
  verify,
  RadiologyOrderController.getPrescribedInvestigationsPerVisit
);
router.put('/update', verify, RadiologyOrderController.updatePrescribedInvestigation);
router.put('/bulk-update', verify, RadiologyOrderController.updateBulkInvestigations);
router.delete('/delete', verify, RadiologyOrderController.deletePrescribedInvestigation);

export default router;
