import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AccountController } from './account.controller';

const router = Router();
router.post('/payment/create', verify, AccountController.createPaymentHistory);
router.get('/payment-history/:id', verify, AccountController.getPatientPaymentHistory);

export default router;
