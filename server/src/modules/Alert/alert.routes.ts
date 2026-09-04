import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AlertController } from './alert.controller';

const router = Router();
router.post('/create', verify, AlertController.createAlert);
router.get('/get', verify, AlertController.getAlerts);
router.get('/patient/:patientId', verify, AlertController.getPatientAlerts);
router.put('/update/:id', verify, AlertController.updateAlert);
export default router;
