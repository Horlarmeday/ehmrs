import { Router } from 'express';
import AdminController from './admin.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/department/create', verify, AdminController.createDepartment);
router.post('/unit/create', verify, AdminController.createUnit);
router.post('/ward/create', verify, AdminController.createWard);
router.post('/bed/create', verify, AdminController.createBed);
router.post('/ward/one', verify, AdminController.getBedsInAWard);
router.get('/department/get', verify, AdminController.getDepartments);
router.get('/unit/get', verify, AdminController.getUnits);
router.get('/ward/get', verify, AdminController.getWards);
router.get('/bed/get', verify, AdminController.getBeds);
router.put('/department/update', verify, AdminController.updateDepartment);
router.put('/unit/update', verify, AdminController.updateUnit);
router.put('/ward/update', verify, AdminController.updateWard);
router.put('/bed/update', verify, AdminController.updateBed);

export default router;
