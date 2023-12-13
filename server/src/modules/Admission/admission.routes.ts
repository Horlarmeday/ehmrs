import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AdmissionController } from './admission.controller';

const router = Router();
router.post('/create', verify, AdmissionController.admitPatient);
router.post('/observations/:id', verify, AdmissionController.createObservation);
router.post('/care-plans/:id', verify, AdmissionController.createCarePlan);
router.post('/iocharts/:id', verify, AdmissionController.createIOChart);
router.post('/nursing-notes/:id', verify, AdmissionController.createNursingNote);
router.put('/recommend-discharge', verify, AdmissionController.sendForDischarge);
router.get('/patient/get', verify, AdmissionController.getPatientAdmission);
router.get('/get', verify, AdmissionController.getAdmittedPatients);
router.get('/observations/:id', verify, AdmissionController.getPatientObservations);
router.get('/care-plans/:id', verify, AdmissionController.getPatientCarePlans);
router.get('/iocharts/:id', verify, AdmissionController.getPatientIOCharts);
router.get('/nursing-notes/:id', verify, AdmissionController.getPatientNursingNotes);
export default router;
