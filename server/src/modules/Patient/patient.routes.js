import { Router } from 'express';
import PatientController from './patient.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/create/cash', verify, PatientController.createCashPatient);
router.post('/create/health-insurance', verify, PatientController.createHealthInsurancePatient);
router.post('/create/ordinary', verify, PatientController.createOrdinaryPatient);
router.post('/create/dependant/:id', verify, PatientController.createDependant);
router.put('/update/patient', verify, PatientController.updatePatient);
router.put('/update/dependant', verify, PatientController.updateDependant);
router.get('/get', verify, PatientController.getPatients);
router.get('/dependant/get', verify, PatientController.getDependants);
router.get('/get/:id', verify, PatientController.getPatientProfile);
router.get('/dependant/get/:id', verify, PatientController.getDependantProfile);

export default router;
