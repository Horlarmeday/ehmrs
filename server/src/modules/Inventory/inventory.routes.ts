import { Router } from 'express';
import InventoryController from './inventory.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create', verify, InventoryController.createInventory);
router.get('/get', verify, InventoryController.getInventories);
router.get('/get/items/:id', verify, InventoryController.getInventoryItems);

export default router;
