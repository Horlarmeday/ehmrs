import { Router } from 'express';
import FormTemplateController from './formTemplate.controller';
import verify from '../../core/middleware/verify';

const router = Router();

// Create operations
router.post('/create', verify, FormTemplateController.createTemplate);
router.post('/:id/version', verify, FormTemplateController.createVersion);
router.post('/clone', verify, FormTemplateController.cloneTemplate);

// Read operations
router.get('/get', verify, FormTemplateController.getTemplates);
router.get('/get/:id', verify, FormTemplateController.getTemplate);
router.get('/get-by-code/:code', verify, FormTemplateController.getTemplateByCode);
router.get('/active/get', verify, FormTemplateController.getActiveTemplates);
router.get('/category/:category', verify, FormTemplateController.getTemplatesByCategory);
router.get('/:id/versions', verify, FormTemplateController.getVersions);

// Update operations
router.put('/update', verify, FormTemplateController.updateTemplate);

// Delete operations
router.delete('/delete/:id', verify, FormTemplateController.deleteTemplate);

export default router;
