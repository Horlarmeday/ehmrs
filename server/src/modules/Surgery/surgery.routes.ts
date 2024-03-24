import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { SurgeryController } from './surgery.controller';

const router = Router();
router.post('/create', verify, SurgeryController.requestSurgery);
router.post('/operation-notes/:id', verify, SurgeryController.createOperationNote);
router.get('/get', verify, SurgeryController.getPatientSurgery);
router.get('/requests/get', verify, SurgeryController.getSurgeryRequests);
router.get('/operation-notes/:id', verify, SurgeryController.getOperationNotes);
export default router;
