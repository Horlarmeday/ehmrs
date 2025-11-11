import { Router } from 'express';
import verify from '../../../core/middleware/verify';
import { QuickbooksController } from './quickbooks.controller';
import { QuickbooksExportController } from './quickbooks.export.controller';

const router = Router();

router.get('/callback', QuickbooksController.handleCallback);

router.use(verify);

router.get('/authorize', QuickbooksController.getAuthorizationUrl);
router.get('/status', QuickbooksController.getStatus);
router.post('/disconnect', QuickbooksController.disconnect);
router.get('/credentials', QuickbooksController.getCredentials);
router.post('/credentials', QuickbooksController.updateCredentials);
router.post('/export/summary', QuickbooksExportController.exportSummary);
router.post('/export/detailed', QuickbooksExportController.exportDetailed);

export default router;

