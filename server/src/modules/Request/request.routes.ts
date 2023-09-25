import { Router } from 'express';
import { RequestController } from './request.controller';
import verify from '../../core/middleware/verify';

const router = Router();

router.post('/create', verify, RequestController.createBulkRequest);
router.put('/update', verify, RequestController.updateRequestStatus);
router.get('/get', verify, RequestController.getRequests);
router.get('/get/me', verify, RequestController.getCurrentUserRequests);
export default router;
