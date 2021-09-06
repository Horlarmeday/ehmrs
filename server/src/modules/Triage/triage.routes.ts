import { Router } from 'express';
import TriageController from './triage.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create/:id', verify, TriageController.createTriage);
router.get('/visit/get/:id', verify, TriageController.getTriageVisit);

export default router;
