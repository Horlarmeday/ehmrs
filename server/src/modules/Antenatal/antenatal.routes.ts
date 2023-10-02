import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { AntenatalController } from './antenatal.controller';

const router = Router();

router.post('/create', verify, AntenatalController.createAntenatalAccount);
router.post('/triage/:id', verify, AntenatalController.createAntenatalTriage);
router.post('/clinical-notes/:id', verify, AntenatalController.createClinicalNote);
router.post('/observations/:id', verify, AntenatalController.createObservation);
router.get('/get', verify, AntenatalController.getAntenatalPatients);
router.get('/triage', verify, AntenatalController.getAntenatalTriages);
router.get('/clinical-notes', verify, AntenatalController.getClinicalNotes);
router.get('/observations', verify, AntenatalController.getObservations);
router.get('/get/:id', verify, AntenatalController.getOneAntenatalAccount);
router.get('/visits-summary/:id', verify, AntenatalController.getVisitsSummary);
router.put('/update-account/:id', verify, AntenatalController.updateAntenatalAccount);
router.put('/clinical-notes/:id', verify, AntenatalController.updateClinicalNote);
router.put('/observations/:id', verify, AntenatalController.updateObservation);
export default router;
