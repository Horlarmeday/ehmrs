import { Router } from 'express';
import LaboratoryController from './laboratory.controller';
import verify from '../../core/middleware/verify';

const router = Router();
//samples
router.post('/test/samples/create', verify, LaboratoryController.createTestSample);
router.put('/test/samples/update', verify, LaboratoryController.updateTestSample);
router.get('/test/samples/get', verify, LaboratoryController.getTestSamples);

// tests
router.post('/tests/create', verify, LaboratoryController.createTest);
router.put('/tests/update', verify, LaboratoryController.updateTest);
router.get('/tests/get', verify, LaboratoryController.getTests);

// laboratory result
router.post('/accession-number', verify, LaboratoryController.generateLabAccessionNumber);
router.put('/collect-samples', verify, LaboratoryController.collectTestSample);
router.post('/add-test-result', verify, LaboratoryController.addTestResults);
router.post('/validate-test-result', verify, LaboratoryController.validateTestResults);
router.post('/approve-test-result', verify, LaboratoryController.approveTestResults);
router.post('/download-results/:id', verify, LaboratoryController.downloadTestResult);
router.get('/samples-to-collect/get', verify, LaboratoryController.samplesToCollect);
router.get('/samples-to-collect/get/:id', verify, LaboratoryController.getOneSampleToCollect);
router.get('/samples-collected/get', verify, LaboratoryController.samplesCollected);
router.get('/samples-collected/get/:id', verify, LaboratoryController.getOneCollectedSample);
router.get('/test-results/get', verify, LaboratoryController.getTestResults);
router.get('/test-results/get/:id', verify, LaboratoryController.getTestResult);
router.get('/verified-results/get', verify, LaboratoryController.getVerifiedTestResults);
router.get('/today-stats/get', verify, LaboratoryController.getTestTodayStats);

// NHIS tests deprecated
router.post('/nhis/tests/create', verify, LaboratoryController.createNhisTest);
router.post('/tests/tariff/create', verify, LaboratoryController.createTestTariff);
router.put('/nhis/tests/update', verify, LaboratoryController.updateNhisTest);
router.get('/nhis/tests/get', verify, LaboratoryController.getNhisTests);

export default router;
