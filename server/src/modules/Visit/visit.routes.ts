import { Router } from 'express';
import VisitController from './visit.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create', verify, VisitController.createVisit);
router.get('/active/get', verify, VisitController.getActiveVisits);
router.get('/all/get', verify, VisitController.getVisits);
router.get('/type/get', verify, VisitController.getTypeVisits);
router.get('/:id', verify, VisitController.getVisitById);

export default router;
