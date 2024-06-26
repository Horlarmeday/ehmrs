import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AdmissionController } from './admission.controller';

const router = Router();
router.post('/create', verify, AdmissionController.admitPatient);
router.post('/observations/:id', verify, AdmissionController.createObservation);
router.post('/care-plans/:id', verify, AdmissionController.createCarePlan);
router.post('/iocharts/:id', verify, AdmissionController.createIOChart);
router.post('/nursing-notes/:id', verify, AdmissionController.createNursingNote);
router.post('/discharge/:id', verify, AdmissionController.dischargePatient);
router.post('/ward-round/:id', verify, AdmissionController.createWardRound);
router.post('/delivery-info/:id', verify, AdmissionController.createDeliveryInfo);
router.post('/postnatal-info/:id', verify, AdmissionController.createPostNatal);

router.put('/recommend-discharge', verify, AdmissionController.sendForDischarge);
router.put('/change-ward/:id', verify, AdmissionController.changeWard);
router.get('/patient/get', verify, AdmissionController.getPatientAdmission);
router.get('/get', verify, AdmissionController.getAdmittedPatients);
router.get('/discharge', verify, AdmissionController.getDischargeRecords);
router.get('/observations/:id', verify, AdmissionController.getPatientObservations);
router.get('/care-plans/:id', verify, AdmissionController.getPatientCarePlans);
router.get('/iocharts/:id', verify, AdmissionController.getPatientIOCharts);
router.get('/nursing-notes/:id', verify, AdmissionController.getPatientNursingNotes);
router.get('/discharge/:id', verify, AdmissionController.getOneDischargeRecord);
router.get('/summary/:id', verify, AdmissionController.getDoctorPrescriptions);
router.get('/history/:id', verify, AdmissionController.getAdmissionHistory);
router.get('/ward-round/:id', verify, AdmissionController.getWardRounds);
router.get('/delivery-info/:id', verify, AdmissionController.getDeliveryInfo);
router.get('/postnatal-info/:id', verify, AdmissionController.getPostnatalInfo);
router.get(
  '/discharge-recommended-patients',
  verify,
  AdmissionController.getDischargeRecommendedPatients
);

export default router;
