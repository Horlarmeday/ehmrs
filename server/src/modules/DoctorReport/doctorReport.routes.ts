import { Router } from 'express';
import DoctorReportController from './doctorReport.controller';
import verify from '../../core/middleware/verify';

const router = Router();

// Create a new doctor report
router.post('/', verify, DoctorReportController.createDoctorReport);

// Get all doctor report by Patient
router.get('/', verify, DoctorReportController.getDoctorReports);

// Get a doctor report by ID
router.get('/:id', verify, DoctorReportController.getDoctorReport);

// Get all doctor reports for a visit
router.get('/visit/:visitId', verify, DoctorReportController.getVisitDoctorReports);

// Update a doctor report
router.put('/:id', verify, DoctorReportController.updateDoctorReport);

// Delete a doctor report
router.delete('/:id', verify, DoctorReportController.deleteDoctorReport);

export default router;
