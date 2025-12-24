import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { RadiologyController } from './radiology.controller';
import { upload } from '../../core/helpers/multer';
import LaboratoryController from '../Laboratory/laboratory.controller';
import investigationImagesRoutes from './investigation-images.routes';

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
  '/requested-investigations/approve',
  verify,
  RadiologyController.approveInvestigationResults
);
router.patch('/imaging/update', verify, RadiologyController.updateImaging);
router.patch('/investigations/update', verify, RadiologyController.updateInvestigation);
router.patch(
  '/investigation-results/bulk-update/:id',
  verify,
  RadiologyController.updateInvestigationResultStatus
);
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
router.post('/download-results/:id', verify, RadiologyController.downloadRadiologyResult);

// Investigation images routes
router.use('/investigation-images', investigationImagesRoutes);

// combo investigations
router.post('/combo-investigations/create', verify, RadiologyController.createComboInvestigation);
router.get('/combo-investigations/get', verify, RadiologyController.getComboInvestigations);
router.get('/combo-investigations/get/:id', verify, RadiologyController.getOneComboInvestigation);
router.put('/combo-investigations/update', verify, RadiologyController.updateComboInvestigation);
router.delete(
  '/combo-investigations/delete/:id',
  verify,
  RadiologyController.deleteComboInvestigation
);

export default router;
