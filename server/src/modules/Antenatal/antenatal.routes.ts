import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AntenatalController } from './antenatal.controller';

const router = Router();

router.post('/create', verify, AntenatalController.createAntenatalAccount);
router.post('/triage/:id', verify, AntenatalController.createAntenatalTriage);
router.post('/clinical-notes/:id', verify, AntenatalController.createClinicalNote);
router.get('/get', verify, AntenatalController.getAntenatalPatients);
router.get('/triage/:id', verify, AntenatalController.getAntenatalTriages);
router.get('/clinical-notes/:id', verify, AntenatalController.getClinicalNotes);
router.get('/get/:id', verify, AntenatalController.getOneAntenatalAccount);
router.put('/update-account/:id', verify, AntenatalController.updateAntenatalAccount);
router.put('/clinical-notes/update/:id', verify, AntenatalController.updateClinicalNote);
export default router;
