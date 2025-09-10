import { Router } from 'express';
import PatientController from './patient.controller';
import CertificateVerificationController from './certificateVerification.controller';
import AuditController from './audit.controller';
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
router.get('/download-hospital-card/:id', verify, PatientController.getHospitalCard);

// Deceased patient management routes
router.put('/mark-deceased/:id', verify, PatientController.markPatientAsDeceased);
router.put('/revive/:id', verify, PatientController.revivePatient);
router.post('/generate-missing-certificates', verify, PatientController.generateMissingDeathCertificateNumbers);
router.get('/deceased', verify, PatientController.getDeceasedPatients);
router.get('/death-certificate/:id', verify, PatientController.generateDeathCertificate);
router.get('/death-certificate-pdf/:id', verify, PatientController.generateDeathCertificatePDF);
router.get('/death-statistics', verify, PatientController.getDeathStatistics);
router.get('/mortality-reports', verify, PatientController.getMortalityReports);
router.get('/death-certificate-tracking', verify, PatientController.getDeathCertificateTracking);
router.post('/transfer-dependants', verify, PatientController.transferDependants);

// Certificate verification routes
router.get('/verify-certificate/:certificateId', CertificateVerificationController.verifyCertificate);
router.get('/certificate-status/:certificateId', CertificateVerificationController.getVerificationStatus);
router.get('/all-signatures', verify, CertificateVerificationController.getAllSignatures);

// Audit trail routes
router.get('/audit/patient/:patientId', verify, AuditController.getPatientAuditTrail);
router.get('/audit/staff/:staffId', verify, AuditController.getStaffAuditTrail);
router.get('/audit/statistics', verify, AuditController.getAuditStatistics);
router.get('/audit/dashboard', verify, AuditController.getDashboardAuditData);
router.post('/audit/cleanup', verify, AuditController.cleanupOldAuditRecords);

export default router;
