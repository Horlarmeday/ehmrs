import { Router } from 'express';
import InventoryController from './inventory.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.get('/get/:inventoryType', verify, InventoryController.getInventoryItems);

export default router;
