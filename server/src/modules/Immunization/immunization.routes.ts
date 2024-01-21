import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { ImmunizationController } from './immunization.controller';

const router = Router();

router.post('/create', verify, ImmunizationController.createImmunizationAccount);
router.get('/get', verify, ImmunizationController.getImmunizationPatients);
router.get('/get/:id', verify, ImmunizationController.getOneImmunizationAccount);
router.put('/:id', verify, ImmunizationController.updateImmunizationAccount);
export default router;
