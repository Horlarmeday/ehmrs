import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AdmissionController } from './admission.controller';

const router = Router();
router.post('/create', verify, AdmissionController.admitPatient);
router.put('/recommend-discharge', verify, AdmissionController.sendForDischarge);
router.get('/patient/get', verify, AdmissionController.getPatientAdmission);
router.get('/get', verify, AdmissionController.getAdmittedPatients);
export default router;
