import { Router } from 'express';
import { PaymentProcessingController } from '../controllers/paymentProcessing.controller';
import verify from '../../../core/middleware/verify';

const router = Router();

// ===== PAYMENT PROCESSING ROUTES =====

/**
 * Process payment for selected bill items
 * POST /api/accounting/payments/process
 */
router.post('/process', verify, PaymentProcessingController.processPayment);

/**
 * Get payment processing options
 * GET /api/accounting/payments/processing/options?billId=123&patientId=456
 */
router.get('/processing/options', verify, PaymentProcessingController.getPaymentOptions);

/**
 * Get payment status
 * GET /api/accounting/payments/:paymentId/status
 */
router.get('/:paymentId/status', verify, PaymentProcessingController.getPaymentStatus);

/**
 * Get payment receipt
 * GET /api/accounting/payments/:paymentId/receipt
 */
router.get('/:paymentId/receipt', verify, PaymentProcessingController.getPaymentReceipt);

/**
 * Validate payment data before processing
 * POST /api/accounting/payments/validate
 */
router.post('/validate', verify, PaymentProcessingController.validatePaymentData);

export default router;
