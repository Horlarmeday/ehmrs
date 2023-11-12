import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { SurgeryController } from './surgery.controller';

const router = Router();
router.post('/create', verify, SurgeryController.requestSurgery);
router.get('/get', verify, SurgeryController.getPatientSurgery);
export default router;
