import { Router } from 'express';
import StaffController from './staff.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/create', verify, StaffController.createStaffAccount);
router.put('/', verify, StaffController.updateStaffProfile);
router.get('/sub', verify, StaffController.getStaffProfile);
router.get('/get', verify, StaffController.getStaffs);
router.get('/:id', verify, StaffController.getOneStaff);

export default router;
