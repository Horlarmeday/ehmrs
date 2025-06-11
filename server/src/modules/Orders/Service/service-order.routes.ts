import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { ServiceOrderController } from './service-order.controller';
import patientMustBeDiagnosed from '../../../core/middleware/patientMustBeDiagnosed';
import { createEncounter } from '../../../core/middleware/createEncounter';
import { PharmacyOrderController } from '../Pharmacy/pharmacy-order.controller';

const router = Router();
router.post(
  '/create/:id',
  verify,
  patientMustBeDiagnosed,
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
