import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import LabOrderController from './lab-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';
import { createEncounter } from '../../../core/middleware/createEncounter';
import { PharmacyOrderController } from '../Pharmacy/pharmacy-order.controller';
import checkPatientNotDeceased from '../../../core/middleware/checkPatientNotDeceased';

const router = Router();
router.post(
  '/create/:id',
  verify,
  patientMustBeDiagnosed,
  checkPatientNotDeceased,
  createEncounter,
  LabOrderController.orderLabTest
);
router.get('/get', verify, LabOrderController.getPrescribedTests);
router.get('/prescribed-tests/:id', verify, LabOrderController.getPrescribedTestsPerVisit);
router.put('/update', verify, LabOrderController.updatePrescribedTest);
router.put('/bulk-update', verify, LabOrderController.updateBulkTests);
router.delete('/delete', verify, LabOrderController.deletePrescribedTest);

export default router;
