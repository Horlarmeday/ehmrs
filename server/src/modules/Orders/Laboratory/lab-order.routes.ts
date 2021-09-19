import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import LabOrderController from './lab-order.controller';

const router = Router();
router.post('/create/:id', verify, LabOrderController.orderLabTest);

export default router;
