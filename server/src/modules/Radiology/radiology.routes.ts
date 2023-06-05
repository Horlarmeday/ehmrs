import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { RadiologyController } from './radiology.controller';

const router = Router();
router.post('/imaging/create', verify, RadiologyController.createImaging);
router.post('/investigations/create', verify, RadiologyController.createInvestigation);
router.post('/investigations/tariff/create', verify, RadiologyController.createInvestigationTariff);
router.patch('/imaging/update', verify, RadiologyController.updateImaging);
router.patch('/investigations/update', verify, RadiologyController.updateInvestigation);
router.get('/imaging/get', verify, RadiologyController.getImaging);
router.get('/investigations/get', verify, RadiologyController.getInvestigations);

export default router;
