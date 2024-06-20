import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { PharmacyOrderController } from './pharmacy-order.controller';

const router = Router();
router.post('/create/:id', verify, PharmacyOrderController.orderDrug);
router.post('/create/bulk/:id', verify, PharmacyOrderController.orderBulkDrugs);
router.post('/additional-items/create/:id', verify, PharmacyOrderController.orderAdditionalItems);
router.post('/treatment/create/:id', verify, PharmacyOrderController.createTreatmentData);
router.post(
  '/additional-treatment/create/:id',
  verify,
  PharmacyOrderController.createAdditionalTreatments
);
router.put('/update', verify, PharmacyOrderController.updatePrescribedDrug);
router.put('/bulk-update', verify, PharmacyOrderController.updateBulkPrescribedDrug);
router.put(
  '/additional-items/bulk-update',
  verify,
  PharmacyOrderController.updateBulkAdditionalItems
);
router.put('/additional-items/update', verify, PharmacyOrderController.updateAdditionalItem);
router.get('/get', verify, PharmacyOrderController.getPrescribedDrugs);
router.get('/additional-items/get', verify, PharmacyOrderController.getPrescribedAdditionalItems);
router.get('/treatment/get', verify, PharmacyOrderController.getPatientTreatmentData);
router.get('/additional-treatment/get', verify, PharmacyOrderController.getAdditionalTreatments);
router.get('/additional-items/:id', verify, PharmacyOrderController.getAdditionalItemsPerVisit);
router.get('/prescribed-drugs/:id', verify, PharmacyOrderController.getPrescribedDrugsPerVisit);
router.delete('/delete', verify, PharmacyOrderController.deletePrescribedDrug);
router.delete('/additional-items/delete', verify, PharmacyOrderController.deleteAdditionalItem);
export default router;
