import { Router } from 'express';
import { ReportsController } from './reports.controller';
import verify from '../../core/middleware/verify';

const router = Router();

// Medical Records Reports Routes
router.get('/medical-records/stats/:reportType', verify, ReportsController.getMedicalRecordsStats);

router.get(
  '/medical-records/details/:reportType',
  verify,
  ReportsController.getMedicalRecordsDetails
);

// Export Routes
router.post('/export', verify, ReportsController.exportReport);

// Report Storage Routes
router.post('/save', verify, ReportsController.saveReport);
router.get('/saved', verify, ReportsController.getSavedReports);
router.get('/:id', verify, ReportsController.getReportById);
router.delete('/:id', verify, ReportsController.deleteReport);

export default router;
