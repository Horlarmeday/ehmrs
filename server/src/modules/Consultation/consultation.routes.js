import { Router } from 'express';
import ConsultationController from './consultation.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/observation/create/:id', verify, ConsultationController.createObservation);
router.post('/diagnosis/create/:id', verify, ConsultationController.createDiagnosis);
router.get('/summary/get/:id', verify, ConsultationController.getConsultationSummary);

export default router;
