import { Router } from 'express';
import VisitController from './visit.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create', verify, VisitController.createVisit);
router.post('/last-active', verify, VisitController.getLastActiveVisitOrCreate);
router.put('/update/:id', verify, VisitController.updateVisit);
router.get('/active/get', verify, VisitController.getActiveVisits);
router.get('/all/get', verify, VisitController.getVisits);
router.get('/category/get', verify, VisitController.getCategoryVisits);
router.get('/professional-assigned/get', verify, VisitController.getProfessionalAssignedVisits);
router.get('/prescriptions/:id', verify, VisitController.getVisitPrescriptions);
router.get('/:id', verify, VisitController.getVisitById);
router.get('/pending-prescriptions/:id', verify, VisitController.getPendingVisitPrescriptions);

export default router;
