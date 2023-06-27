import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { DiagnosisController } from './diagnosis.controller';

const router = Router();
router.post('/icd10/create', verify, DiagnosisController.createICD10Disease);
router.post('/icpc2/create', verify, DiagnosisController.createICPC2Disease);
router.get('/icd10/get', verify, DiagnosisController.getICD10Disease);
router.get('/icpc2/get', verify, DiagnosisController.getICPC2Disease);
router.put('/icd10/update', verify, DiagnosisController.updateICD10Disease);
router.put('/icpc2/update', verify, DiagnosisController.updateICPC2Disease);

export default router;
