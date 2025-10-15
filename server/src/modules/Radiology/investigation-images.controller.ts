import { Request, Response, NextFunction } from 'express';
import { InvestigationImagesService } from './investigation-images.service';
import { successResponse } from '../../common/responses/success-responses';
import { errorResponse } from '../../common/responses/error-responses';
import { StatusCodes } from '../../core/helpers/helper';
import {
  DATA_RETRIEVED,
  DATA_SAVED,
  DATA_UPDATED,
  DATA_DELETED,
} from '../AdminSettings/messages/response-messages';
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { logFileAccess } from '../../core/helpers/security';

export class InvestigationImagesController {
  /**
   * Upload multiple investigation images
   * POST /radiology/investigation-images/upload/:resultId
   */
  static async uploadImages(
    req: Request & { user: { sub: number }; files?: Express.Multer.File[] },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { resultId } = req.params;
      const staffId = req.user.sub;

      if (!req.files || req.files.length === 0) {
        return errorResponse({
          res,
          message: 'No files uploaded',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      const result = await InvestigationImagesService.uploadImages(
        req.files,
        Number(resultId),
        staffId
      );

      // If all uploads failed
      if (result.successful.length === 0) {
        return errorResponse({
          res,
          message: `All file uploads failed: ${result.failed.map(f => f.error).join(', ')}`,
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      // Partial success or full success
      return successResponse({
        res,
        message:
          result.failed.length > 0
            ? `${result.successful.length} of ${req.files.length} images uploaded successfully`
            : DATA_SAVED,
        httpCode: StatusCodes.CREATED,
        data: {
          successful: result.successful,
          failed: result.failed,
          warnings: result.warnings,
          totalUploaded: result.successful.length,
          totalFailed: result.failed.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all images for an investigation result
   * GET /radiology/investigation-images/:resultId
   */
  static async getImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { resultId } = req.params;
      const includeRelations = req.query.includeRelations === 'true';

      const images = await InvestigationImagesService.getImages(Number(resultId), includeRelations);

      // Generate URLs for serving images
      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        imageUrl: InvestigationImagesService.generateImageUrl(image.file_path),
        thumbnailUrl: image.thumbnail_path
          ? InvestigationImagesService.generateImageUrl(image.thumbnail_path)
          : null,
      }));

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: imagesWithUrls,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get single image by ID
   * GET /radiology/investigation-images/image/:imageId
   */
  static async getImage(
    req: Request & { user?: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { imageId } = req.params;

      const image = await InvestigationImagesService.getImage(Number(imageId));

      if (!image) {
        return errorResponse({
          res,
          message: 'Image not found',
          httpCode: StatusCodes.NOT_FOUND,
        });
      }

      // Log file access for audit trail
      logFileAccess('view', image.file_path, req.user?.sub || 'anonymous', {
        imageId: Number(imageId),
        originalFilename: image.original_filename,
        investigationResultId: image.investigation_result_id,
      });

      const imageWithUrl = {
        ...image.toJSON(),
        imageUrl: InvestigationImagesService.generateImageUrl(image.file_path),
        thumbnailUrl: image.thumbnail_path
          ? InvestigationImagesService.generateImageUrl(image.thumbnail_path)
          : null,
      };

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: imageWithUrl,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete an investigation image
   * DELETE /radiology/investigation-images/:imageId
   */
  static async deleteImage(
    req: Request & { user: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { imageId } = req.params;
      const staffId = req.user.sub;

      const result = await InvestigationImagesService.deleteImage(Number(imageId), staffId);

      if (!result.success) {
        return errorResponse({
          res,
          message: result.error || 'Failed to delete image',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      return successResponse({
        res,
        message: DATA_DELETED,
        httpCode: StatusCodes.OK,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Download/stream an investigation image
   * GET /radiology/investigation-images/download/:imageId
   */
  static async downloadImage(
    req: Request & { user?: { sub: number } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const { imageId } = req.params;

      const image = await InvestigationImagesService.getImage(Number(imageId));

      if (!image) {
        return errorResponse({
          res,
          message: 'Image not found',
          httpCode: StatusCodes.NOT_FOUND,
        });
      }

      // Check if file exists
      try {
        await fs.access(image.file_path);
      } catch (error) {
        return errorResponse({
          res,
          message: 'Image file not found on server',
          httpCode: StatusCodes.NOT_FOUND,
        });
      }

      // Log file access for audit trail
      logFileAccess('download', image.file_path, req.user?.sub || 'anonymous', {
        imageId: Number(imageId),
        originalFilename: image.original_filename,
        investigationResultId: image.investigation_result_id,
        fileSize: image.file_size,
      });

      // Set appropriate headers
      const filename = image.original_filename || path.basename(image.file_path);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Determine content type
      const ext = path.extname(image.file_path).toLowerCase();
      const contentType = this.getContentType(ext);
      res.setHeader('Content-Type', contentType);

      // Stream the file
      const fileStream = createReadStream(image.file_path);
      fileStream.pipe(res);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Set image as primary
   * PATCH /radiology/investigation-images/:imageId/primary
   */
  static async setPrimaryImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;

      const image = await InvestigationImagesService.setPrimaryImage(Number(imageId));

      return successResponse({
        res,
        message: DATA_UPDATED,
        httpCode: StatusCodes.OK,
        data: image,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update image metadata
   * PATCH /radiology/investigation-images/:imageId
   */
  static async updateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageId } = req.params;
      const { description, display_order } = req.body;

      await InvestigationImagesService.updateImageMetadata(Number(imageId), {
        description,
        display_order,
      });

      const updatedImage = await InvestigationImagesService.getImage(Number(imageId));

      return successResponse({
        res,
        message: DATA_UPDATED,
        httpCode: StatusCodes.OK,
        data: updatedImage,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Reorder images for an investigation result
   * PATCH /radiology/investigation-images/:resultId/reorder
   */
  static async reorderImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { imageOrders } = req.body;

      if (!Array.isArray(imageOrders)) {
        return errorResponse({
          res,
          message: 'imageOrders must be an array of {imageId, order} objects',
          httpCode: StatusCodes.BAD_REQUEST,
        });
      }

      await InvestigationImagesService.reorderImages(imageOrders);

      return successResponse({
        res,
        message: DATA_UPDATED,
        httpCode: StatusCodes.OK,
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get storage statistics for an investigation result
   * GET /radiology/investigation-images/:resultId/stats
   */
  static async getStorageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { resultId } = req.params;

      const stats = await InvestigationImagesService.getStorageStats(Number(resultId));

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get DICOM images only for an investigation result
   * GET /radiology/investigation-images/:resultId/dicom
   */
  static async getDicomImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { resultId } = req.params;

      const images = await InvestigationImagesService.getDicomImages(Number(resultId));

      const imagesWithUrls = images.map(image => ({
        ...image.toJSON(),
        imageUrl: InvestigationImagesService.generateImageUrl(image.file_path),
        thumbnailUrl: image.thumbnail_path
          ? InvestigationImagesService.generateImageUrl(image.thumbnail_path)
          : null,
      }));

      return successResponse({
        res,
        message: DATA_RETRIEVED,
        httpCode: StatusCodes.OK,
        data: imagesWithUrls,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get content type for file extension
   */
  private static getContentType(ext: string): string {
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.dcm': 'application/dicom',
      '.dicom': 'application/dicom',
    };

    return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}
