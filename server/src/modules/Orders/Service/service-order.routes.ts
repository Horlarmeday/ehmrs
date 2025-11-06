import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { ServiceOrderController } from './service-order.controller';
import { createEncounter } from '../../../core/middleware/createEncounter';
import checkPatientNotDeceased from '../../../core/middleware/checkPatientNotDeceased';

const router = Router();
router.post(
  '/create/:id',
  verify,
  checkPatientNotDeceased,
  createEncounter,
  ServiceOrderController.orderBulkService
);
router.get('/get', verify, ServiceOrderController.getPrescribedServices);
router.get(
  '/prescribed-services/:id',
  verify,
  ServiceOrderController.getPrescribedServicesPerVisit
);
router.put('/update', verify, ServiceOrderController.updatePrescribedService);
router.put('/bulk-update', verify, ServiceOrderController.updateBulkServices);
router.delete('/delete', verify, ServiceOrderController.deletePrescribedService);

export default router;
