import { Router } from 'express';
import PharmacyController from './pharmacy.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/generic-drugs/create', verify, PharmacyController.createGenericDrug);
router.post('/dosage-forms/create', verify, PharmacyController.createDosageForm);
router.post('/measurements/create', verify, PharmacyController.createMeasurement);
router.post(
  '/routes-of-administration/create',
  verify,
  PharmacyController.createRouteOfAdministration
);
router.post('/dispense-drug/:id', verify, PharmacyController.dispenseDrug);
router.post('/return-drug/:id', verify, PharmacyController.returnDrugToInventory);
router.post('/routes-and-measurement', verify, PharmacyController.getRoutesAndMeasurements);
router.put('/generic-drugs/update', verify, PharmacyController.updateGenericDrug);
router.put('/dosage-forms/update', verify, PharmacyController.updateDosageForm);
router.put('/measurements/update', verify, PharmacyController.updateMeasurement);
router.put(
  '/routes-of-administration/update',
  verify,
  PharmacyController.updateRouteOfAdministration
);
router.get('/generic-drugs/get', verify, PharmacyController.getGenericDrugs);
router.get('/dosage-forms/get', verify, PharmacyController.getDosageForms);
router.get('/measurements/get', verify, PharmacyController.getMeasurements);
router.get('/routes-of-administration/get', verify, PharmacyController.getRoutesOfAdministration);
router.get('/prescriptions/get', verify, PharmacyController.getDrugPrescriptions);
router.get('/prescriptions/get/:id', verify, PharmacyController.getOnePrescription);

export default router;
