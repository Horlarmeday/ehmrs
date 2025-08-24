import { Router } from 'express';
import { DialysisController } from './dialysis.controller';
import {
  validateCreateDialysisVisit,
  validateUpdateDialysisVisit,
  validateStartTreatment,
  validateCompleteTreatment,
  validateCancelVisit,
} from './validations';
import verify from '../../core/middleware/verify';

const router = Router();

router.use(verify);

/**
 * Dialysis Visits Routes
 */
router.post('/visits', validateCreateDialysisVisit, DialysisController.createDialysisVisit);
router.get('/visits', DialysisController.getDialysisVisits);
router.get('/visits/:id', DialysisController.getDialysisVisit);
router.put('/visits/:id', validateUpdateDialysisVisit, DialysisController.updateDialysisVisit);

/**
 * Dialysis Treatment Routes
 */
router.post('/visits/:id/start', validateStartTreatment, DialysisController.startDialysisTreatment);
router.post(
  '/visits/:id/complete',
  validateCompleteTreatment,
  DialysisController.completeDialysisTreatment
);
router.put('/visits/:id/treatment', DialysisController.updateDialysisTreatment);

/**
 * Dialysis Management Routes
 */
router.post('/visits/:id/cancel', validateCancelVisit, DialysisController.cancelDialysisVisit);

/**
 * Dialysis Assessment Routes
 */
router.post('/visits/:id/assessment', DialysisController.createDialysisAssessment);
router.put('/visits/:id/assessment', DialysisController.updateDialysisAssessment);
router.get('/visits/:id/assessment', DialysisController.getDialysisAssessment);

/**
 * Dialysis Vitals Routes
 */
router.post('/visits/:id/vitals', DialysisController.createDialysisVitals);
router.get('/visits/:id/vitals', DialysisController.getDialysisVitals);

/**
 * Dialysis Notes Routes
 */
router.post('/visits/:id/notes', DialysisController.createDialysisNotes);
router.put('/visits/:id/notes', DialysisController.updateDialysisNotes);
router.get('/visits/:id/notes', DialysisController.getDialysisNotes);

/**
 * Comprehensive Data Routes
 */
router.get('/visits/:id/comprehensive', DialysisController.getComprehensiveDialysisVisit);

/**
 * ICD10 Diagnosis Routes
 */
router.get('/icd10/search', DialysisController.searchICD10Diagnoses);

/**
 * Dialysis Analytics Routes
 */
router.get('/statistics', DialysisController.getDialysisStatistics);
router.get('/patients/:patientId/history', DialysisController.getPatientDialysisHistory);
router.get('/doctors/:doctorId/schedule', DialysisController.getDoctorDialysisSchedule);
router.get('/nurses/:nurseId/schedule', DialysisController.getNurseDialysisSchedule);
router.get('/reports/export/:id', DialysisController.exportDialysisReport);

export default router;
