import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { PharmacyOrderController } from './pharmacy-order.controller';

const router = Router();
router.post('/create/:id', verify, PharmacyOrderController.orderDrug);
router.post('/additional-items/create/:id', verify, PharmacyOrderController.orderAdditionalItems);
router.post('/treatment/create/:id', verify, PharmacyOrderController.createTreatmentData);
router.get('/get', verify, PharmacyOrderController.getPrescribedDrugs);
router.get('/additional-items/get', verify, PharmacyOrderController.getPrescribedAdditionalItems);
router.get('/treatment/get', verify, PharmacyOrderController.getPatientTreatmentData);
router.put('/update', verify, PharmacyOrderController.updatePrescribedDrug);
export default router;
