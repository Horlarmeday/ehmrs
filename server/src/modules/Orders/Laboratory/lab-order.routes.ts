import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import LabOrderController from './lab-order.controller';
import { createEncounter } from '../../../core/middleware/createEncounter';
import checkPatientNotDeceased from '../../../core/middleware/checkPatientNotDeceased';

const router = Router();
router.post(
  '/create/:id',
  verify,
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
