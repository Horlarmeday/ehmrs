import { Router } from 'express';
import PatientController from './patient.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create', verify, PatientController.createPatientAccount);
router.post('/health-insurance/:id', verify, PatientController.addPatientHealthInsurance);
router.post('/create/emergency', verify, PatientController.createEmergencyPatientAccount);
router.post('/create/dependant/:id', verify, PatientController.createDependant);
router.post('/find-patient', verify, PatientController.getPatientByNameAndPhone);
router.post('/merge-patient-accounts', verify, PatientController.mergePatientAccounts);
router.put('/update/:id', verify, PatientController.updatePatient);
router.put('/update-insurance/:id', verify, PatientController.updatePatientInsurance);
router.put('/toggle-insurance/:id', verify, PatientController.togglePatientInsurance);
router.put('/convert-dependant/:id', verify, PatientController.convertDependantToPatient);
router.get('/get', verify, PatientController.getPatients);
router.get('/profile/get/:id', verify, PatientController.getPatientProfile);
router.get('/get/:id', verify, PatientController.getOnePatient);

export default router;
