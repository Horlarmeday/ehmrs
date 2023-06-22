import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { RadiologyOrderController } from './radiology-order.controller';

const router = Router();
router.post('/create/:id', verify, RadiologyOrderController.orderInvestigationTest);

export default router;
