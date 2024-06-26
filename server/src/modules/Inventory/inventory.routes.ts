import { Router } from 'express';
import InventoryController from './inventory.controller';
import verify from '../../core/middleware/verify';

const router = Router();
router.post('/create', verify, InventoryController.createInventory);
router.put('/item/update', verify, InventoryController.updateInventoryItem);
router.get('/get', verify, InventoryController.getInventories);
router.get('/get/items/:id', verify, InventoryController.getInventoryItem);
router.get('/get/:id/items', verify, InventoryController.getInventoryItems);
router.get('/get/:id/history', verify, InventoryController.getInventoryItemHistory);

export default router;
