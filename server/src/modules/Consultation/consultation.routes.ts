import { Router } from 'express';
import ConsultationController from './consultation.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/observation/create/:id', verify, ConsultationController.createObservation);
router.post('/diagnosis/create/:id', verify, ConsultationController.createDiagnosis);
router.get('/summary/get/:id', verify, ConsultationController.getConsultationSummary);
router.get('/diagnoses/get', verify, ConsultationController.getDiagnoses);
router.get('/diagnoses/get/:id', verify, ConsultationController.getDiagnosesAndFindings);
router.get('/history/get', verify, ConsultationController.getVisitsHistory);
router.get('/histories/get', verify, ConsultationController.getConsultationHistories);

export default router;
