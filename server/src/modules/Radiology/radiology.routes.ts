import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { RadiologyController } from './radiology.controller';
import { upload } from '../../core/helpers/multer';

const router = Router();
router.post('/imaging/create', verify, RadiologyController.createImaging);
router.post('/investigations/create', verify, RadiologyController.createInvestigation);
router.post('/investigations/tariff/create', verify, RadiologyController.createInvestigationTariff);
router.post(
  '/upload-images',
  verify,
  upload.single('image'),
  RadiologyController.uploadResultImages
);
router.post(
  '/requested-investigations/add-result',
  verify,
  RadiologyController.addInvestigationResults
);
router.post(
  '/requested-investigations/approve/:id',
  verify,
  RadiologyController.approveInvestigationResults
);
router.patch('/imaging/update', verify, RadiologyController.updateImaging);
router.patch('/investigations/update', verify, RadiologyController.updateInvestigation);
router.get('/imaging/get', verify, RadiologyController.getImaging);
router.get('/investigations/get', verify, RadiologyController.getInvestigations);
router.get('/requested-investigations/get', verify, RadiologyController.getRequestedInvestigations);
router.get(
  '/requested-investigations/get/:id',
  verify,
  RadiologyController.getOneRequestedInvestigation
);
router.get('/investigations-approval/get', verify, RadiologyController.getInvestigationsApproval);
router.get('/investigations-results/get', verify, RadiologyController.getInvestigationsResults);
router.get('/investigations-results/get/:id', verify, RadiologyController.getInvestigationResult);
router.get(
  '/investigation-prescription/get/:id',
  verify,
  RadiologyController.getOneInvestigationPrescription
);

export default router;
