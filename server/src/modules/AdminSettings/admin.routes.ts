import { Router } from 'express';
import AdminController from './admin.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/departments/create', verify, AdminController.createDepartment);
router.post('/units/create', verify, AdminController.createUnit);
router.post('/wards/create', verify, AdminController.createWard);
router.post('/beds/create', verify, AdminController.createBed);
router.post('/services/create', verify, AdminController.createService);
router.post('/ward/beds', verify, AdminController.getBedsInAWard);
router.post('/defaults/create', verify, AdminController.createAdminDefault);
router.get('/departments/get', verify, AdminController.getDepartments);
router.get('/units/get', verify, AdminController.getUnits);
router.get('/wards/get', verify, AdminController.getWards);
router.get('/beds/get', verify, AdminController.getBeds);
router.get('/services/get', verify, AdminController.getServices);
router.get('/wards-and-beds/get', verify, AdminController.getWardsAndBeds);
router.get('/defaults/get', verify, AdminController.getDefaults);
router.get('/defaults/:id/get', verify, AdminController.getOneDefault);
router.put('/departments/update', verify, AdminController.updateDepartment);
router.put('/units/update', verify, AdminController.updateUnit);
router.put('/wards/update', verify, AdminController.updateWard);
router.put('/beds/update', verify, AdminController.updateBed);
router.put('/services/update', verify, AdminController.updateService);

export default router;
