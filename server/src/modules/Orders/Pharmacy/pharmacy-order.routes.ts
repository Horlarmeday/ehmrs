import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { PharmacyOrderController } from './pharmacy-order.controller';

const router = Router();
router.post('/create/:id', verify, PharmacyOrderController.prescribeDrug);
export default router;
