import { Router } from 'express';
import LaboratoryController from './laboratory.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/test/samples/create', verify, LaboratoryController.createTestSample);
router.post('/tests/create', verify, LaboratoryController.createTest);
router.post('/nhis/tests/create', verify, LaboratoryController.createNhisTest);
router.put('/test/samples/update', verify, LaboratoryController.updateTestSample);
router.put('/tests/update', verify, LaboratoryController.updateTest);
router.put('/nhis/tests/update', verify, LaboratoryController.updateNhisTest);
router.get('/test/samples/get', verify, LaboratoryController.getTestSamples);
router.get('/tests/get', verify, LaboratoryController.getTests);
router.get('/nhis/tests/get', verify, LaboratoryController.getNhisTests);

export default router;
