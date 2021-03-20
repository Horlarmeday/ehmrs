import { Router } from 'express';
import AuthController from './auth.controller';
import verify from '../../middleware/verify';

const router = Router();
router.post('/login', AuthController.login);
router.post('/change-password', verify, AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);

export default router;
