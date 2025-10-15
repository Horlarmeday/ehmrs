import { Router } from 'express';
import verify from '../../core/middleware/verify';
import { InvestigationImagesController } from './investigation-images.controller';
import { radiologyUpload } from '../../core/helpers/multer';
import {
  verifyImageOwnership,
  verifyInvestigationAccess,
  restrictToRoles,
} from './middleware/image-access-control';
import {
  uploadLimiter,
  modificationLimiter,
  readLimiter,
} from '../../core/middleware/rate-limiter';

const router = Router();

// Upload multiple images for an investigation result
// Restricted to medical staff who can add investigation results
// Rate limited to prevent abuse of resource-intensive operation
router.post(
  '/upload/:resultId',
  uploadLimiter, // Apply rate limiting first
  verify,
  verifyInvestigationAccess,
  restrictToRoles(['Radiologist', 'Radiology', 'Nurse', 'Super Admin', 'Admin']),
  radiologyUpload.array('images', 20), // Max 20 files
  InvestigationImagesController.uploadImages
);

// Get all images for an investigation result
router.get(
  '/:resultId',
  readLimiter, // Rate limit read operations
  verify,
  verifyInvestigationAccess,
  InvestigationImagesController.getImages
);

// Get storage statistics for an investigation result
router.get(
  '/:resultId/stats',
  readLimiter,
  verify,
  verifyInvestigationAccess,
  InvestigationImagesController.getStorageStats
);

// Get DICOM images only for an investigation result
router.get(
  '/:resultId/dicom',
  readLimiter,
  verify,
  verifyInvestigationAccess,
  InvestigationImagesController.getDicomImages
);

// Get single image by ID
router.get('/image/:imageId', readLimiter, verify, InvestigationImagesController.getImage);

// Download/stream an investigation image
router.get('/download/:imageId', readLimiter, verify, InvestigationImagesController.downloadImage);

// Update image metadata
// Only uploader or authorized staff can update
router.patch(
  '/:imageId',
  modificationLimiter, // Rate limit modifications
  verify,
  verifyImageOwnership,
  InvestigationImagesController.updateImage
);

// Set image as primary
// Only uploader or authorized staff can set primary
router.patch(
  '/:imageId/primary',
  modificationLimiter,
  verify,
  verifyImageOwnership,
  InvestigationImagesController.setPrimaryImage
);

// Reorder images for an investigation result
router.patch(
  '/:resultId/reorder',
  modificationLimiter,
  verify,
  verifyInvestigationAccess,
  InvestigationImagesController.reorderImages
);

// Delete an investigation image
// Only uploader or authorized staff can delete
router.delete(
  '/:imageId',
  modificationLimiter, // Rate limit deletions
  verify,
  verifyImageOwnership,
  InvestigationImagesController.deleteImage
);

export default router;
