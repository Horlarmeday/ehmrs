import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { ServiceOrderController } from './service-order.controller';

const router = Router();
router.post('/create/:id', verify, ServiceOrderController.orderBulkService);
router.get('/get', verify, ServiceOrderController.getPrescribedServices);
router.put('/update', verify, ServiceOrderController.updatePrescribedService);
router.delete('/delete', verify, ServiceOrderController.deletePrescribedService);

export default router;
