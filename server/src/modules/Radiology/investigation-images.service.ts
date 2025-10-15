import path from 'path';
import { promises as fs } from 'fs';
import {
  InvestigationResultImage,
  ImageFileType,
} from '../../database/models/investigationResultImage';
import {
  createInvestigationImage,
  createMultipleInvestigationImages,
  getInvestigationImages,
  getImageById,
  deleteInvestigationImage,
  setAsPrimaryImage,
  updateDisplayOrder,
  updateInvestigationImage,
  getPrimaryImage,
  countImages,
  getDicomImages,
  getRegularImages,
  deleteAllImagesForResult,
  imageExistsForResult,
  getImagesByUploader,
  getTotalStorageSize,
  reorderImages,
  getResultIdForImage,
  CreateInvestigationImageDto,
  UpdateInvestigationImageDto,
} from './investigation-images.repository';
import { DicomProcessorService } from './services/dicom-processor.service';
import { DEVELOPMENT } from '../../core/constants';
import { validateFileSecurity, logFileAccess } from '../../core/helpers/security';

/**
 * Interface for upload result
 */
export interface UploadImageResult {
  success: boolean;
  image?: InvestigationResultImage;
  error?: string;
  warnings?: string[];
}

/**
 * Interface for multiple upload result
 */
export interface UploadImagesResult {
  successful: InvestigationResultImage[];
  failed: Array<{ filename: string; error: string }>;
  warnings: string[];
}

export class InvestigationImagesService {
  /**
   * Upload single investigation image
   * @param file Uploaded file
   * @param resultId Investigation result ID
   * @param staffId Staff ID
   */
  static async uploadImage(
    file: Express.Multer.File,
    resultId: number,
    staffId: number
  ): Promise<UploadImageResult> {
    const warnings: string[] = [];

    try {
      // Define allowed base paths for security
      const allowedBasePaths = [
        process.env.NODE_ENV === DEVELOPMENT
          ? 'src/public/radiology-images'
          : 'ehmrs-api/public/radiology-images',
      ];

      // Comprehensive security validation
      const securityValidation = await validateFileSecurity(file.path, {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedExtensions: ['.dcm', '.dicom', '.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif'],
        validateMagicBytes: true,
        allowedBasePaths,
      });

      // Handle security validation errors
      if (!securityValidation.isValid) {
        // Clean up invalid file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          // Ignore cleanup errors
        }

        return {
          success: false,
          error: `Security validation failed: ${securityValidation.errors.join(', ')}`,
        };
      }

      // Add security warnings if any
      if (securityValidation.warnings.length > 0) {
        warnings.push(...securityValidation.warnings);
      }

      // Log file access for audit trail
      logFileAccess('upload', file.path, staffId, {
        originalFilename: file.originalname,
        fileSize: file.size,
        investigationResultId: resultId,
      });

      // Determine file type
      const fileExt = path.extname(file.originalname).toLowerCase();
      const isDicom = fileExt === '.dcm' || fileExt === '.dicom';

      let fileType: ImageFileType;
      let dicomMetadata: string | undefined;

      if (isDicom) {
        fileType = ImageFileType.DICOM;

        // Process DICOM file
        const dicomResult = await DicomProcessorService.parseDicomFile(file.path);

        if (!dicomResult.isValid) {
          return {
            success: false,
            error: `Invalid DICOM file: ${dicomResult.errors.join(', ')}`,
          };
        }

        dicomMetadata = JSON.stringify(dicomResult.metadata);
        warnings.push(...dicomResult.warnings);
      } else {
        // Determine file type from extension
        fileType = this.getFileTypeFromExtension(fileExt);
      }

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnailPath(file.path, resultId);
      const thumbnailResult = isDicom
        ? await DicomProcessorService.generateThumbnail(file.path, thumbnailPath)
        : await DicomProcessorService.generateImageThumbnail(file.path, thumbnailPath);

      if (!thumbnailResult.success) {
        warnings.push(`Thumbnail generation failed: ${thumbnailResult.error}`);
      }

      // Get file size
      const fileSize = await DicomProcessorService.getFileSize(file.path);

      // Determine if this should be the primary image (first image uploaded)
      const existingCount = await countImages(resultId);
      const isPrimary = existingCount === 0;

      // Create image record
      const imageData: CreateInvestigationImageDto = {
        investigation_result_id: resultId,
        file_path: file.path,
        file_type: fileType,
        file_size: fileSize,
        dicom_metadata: dicomMetadata,
        uploaded_by: staffId,
        is_primary: isPrimary,
        display_order: existingCount,
        original_filename: file.originalname,
        thumbnail_path: thumbnailResult.success ? thumbnailPath : undefined,
      };

      const image = await createInvestigationImage(imageData);

      return {
        success: true,
        image,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  }

  /**
   * Upload multiple investigation images
   * @param files Uploaded files array
   * @param resultId Investigation result ID
   * @param staffId Staff ID
   */
  static async uploadImages(
    files: Express.Multer.File[],
    resultId: number,
    staffId: number
  ): Promise<UploadImagesResult> {
    const successful: InvestigationResultImage[] = [];
    const failed: Array<{ filename: string; error: string }> = [];
    const allWarnings: string[] = [];

    const existingCount = await countImages(resultId);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadImage(file, resultId, staffId);

      if (result.success && result.image) {
        successful.push(result.image);
        if (result.warnings) {
          allWarnings.push(...result.warnings);
        }
      } else {
        failed.push({
          filename: file.originalname,
          error: result.error || 'Unknown error',
        });

        // Clean up failed file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          // Ignore cleanup errors
        }
      }
    }

    return {
      successful,
      failed,
      warnings: Array.from(new Set(allWarnings)), // Remove duplicates
    };
  }

  /**
   * Get images for investigation result
   * @param resultId Investigation result ID
   * @param includeRelations Include related data
   */
  static async getImages(
    resultId: number,
    includeRelations = false
  ): Promise<InvestigationResultImage[]> {
    return getInvestigationImages(resultId, includeRelations);
  }

  /**
   * Get single image by ID
   * @param imageId Image ID
   */
  static async getImage(imageId: number): Promise<InvestigationResultImage | null> {
    return getImageById(imageId, true);
  }

  /**
   * Delete investigation image
   * @param imageId Image ID
   * @param staffId Staff ID (for audit)
   */
  static async deleteImage(
    imageId: number,
    staffId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get image details
      const image = await getImageById(imageId);

      if (!image) {
        return { success: false, error: 'Image not found' };
      }

      // Log file access for audit trail
      logFileAccess('delete', image.file_path, staffId, {
        imageId,
        originalFilename: image.original_filename,
        investigationResultId: image.investigation_result_id,
        isPrimary: image.is_primary,
      });

      // Delete file from filesystem
      try {
        await fs.unlink(image.file_path);
      } catch (fileError) {
        // Continue even if file deletion fails
      }

      // Delete thumbnail if exists
      if (image.thumbnail_path) {
        try {
          await fs.unlink(image.thumbnail_path);
        } catch (thumbError) {
          // Continue even if thumbnail deletion fails
        }
      }

      // Delete database record
      await deleteInvestigationImage(imageId);

      // If this was the primary image, set another image as primary
      if (image.is_primary) {
        const images = await getInvestigationImages(image.investigation_result_id);
        if (images.length > 0) {
          await setAsPrimaryImage(images[0].id);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Set image as primary
   * @param imageId Image ID
   */
  static async setPrimaryImage(imageId: number): Promise<InvestigationResultImage> {
    return setAsPrimaryImage(imageId);
  }

  /**
   * Update image display order
   * @param imageId Image ID
   * @param order New order
   */
  static async updateImageOrder(imageId: number, order: number): Promise<void> {
    await updateDisplayOrder(imageId, order);
  }

  /**
   * Update image metadata
   * @param imageId Image ID
   * @param data Update data
   */
  static async updateImageMetadata(
    imageId: number,
    data: UpdateInvestigationImageDto
  ): Promise<void> {
    await updateInvestigationImage(imageId, data);
  }

  /**
   * Get primary image for investigation result
   * @param resultId Investigation result ID
   */
  static async getPrimaryImage(resultId: number): Promise<InvestigationResultImage | null> {
    return getPrimaryImage(resultId);
  }

  /**
   * Get image count for investigation result
   * @param resultId Investigation result ID
   */
  static async getImageCount(resultId: number): Promise<number> {
    return countImages(resultId);
  }

  /**
   * Get DICOM images for investigation result
   * @param resultId Investigation result ID
   */
  static async getDicomImages(resultId: number): Promise<InvestigationResultImage[]> {
    return getDicomImages(resultId);
  }

  /**
   * Get non-DICOM images for investigation result
   * @param resultId Investigation result ID
   */
  static async getRegularImages(resultId: number): Promise<InvestigationResultImage[]> {
    return getRegularImages(resultId);
  }

  /**
   * Get storage statistics for investigation result
   * @param resultId Investigation result ID
   */
  static async getStorageStats(
    resultId: number
  ): Promise<{
    totalImages: number;
    totalSize: number;
    formattedSize: string;
    dicomCount: number;
    regularCount: number;
  }> {
    const [totalImages, totalSize, dicomImages, regularImages] = await Promise.all([
      countImages(resultId),
      getTotalStorageSize(resultId),
      getDicomImages(resultId),
      getRegularImages(resultId),
    ]);

    return {
      totalImages,
      totalSize,
      formattedSize: DicomProcessorService.formatFileSize(totalSize),
      dicomCount: dicomImages.length,
      regularCount: regularImages.length,
    };
  }

  /**
   * Generate image URL for serving
   * @param imagePath File path
   */
  static generateImageUrl(imagePath: string): string {
    // Convert file system path to URL path
    const basePath = process.env.NODE_ENV === DEVELOPMENT ? 'src/public' : 'ehmrs-api/public';

    const relativePath = imagePath.replace(basePath, '');
    return `/static${relativePath}`;
  }

  /**
   * Reorder multiple images
   * @param imageOrders Array of {imageId, order} pairs
   */
  static async reorderImages(
    imageOrders: Array<{ imageId: number; order: number }>
  ): Promise<void> {
    await reorderImages(imageOrders);
  }

  /**
   * Verify image belongs to investigation result
   * @param imageId Image ID
   * @param resultId Investigation result ID
   */
  static async verifyImageOwnership(imageId: number, resultId: number): Promise<boolean> {
    return imageExistsForResult(imageId, resultId);
  }

  /**
   * Get file type from extension
   * @param extension File extension
   */
  private static getFileTypeFromExtension(extension: string): ImageFileType {
    const ext = extension.toLowerCase().replace('.', '');

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return ImageFileType.JPEG;
      case 'png':
        return ImageFileType.PNG;
      case 'gif':
        return ImageFileType.GIF;
      case 'tif':
      case 'tiff':
        return ImageFileType.TIFF;
      case 'dcm':
      case 'dicom':
        return ImageFileType.DICOM;
      default:
        return ImageFileType.JPEG;
    }
  }

  /**
   * Generate thumbnail path
   * @param originalPath Original file path
   * @param resultId Investigation result ID
   */
  private static async generateThumbnailPath(
    originalPath: string,
    resultId: number
  ): Promise<string> {
    const basePath =
      process.env.NODE_ENV === DEVELOPMENT
        ? `src/public/radiology-images/investigations/${resultId}/thumbnails`
        : `ehmrs-api/public/radiology-images/investigations/${resultId}/thumbnails`;

    // Ensure directory exists
    await fs.mkdir(basePath, { recursive: true });

    const filename = path.basename(originalPath, path.extname(originalPath));
    return path.join(basePath, `${filename}-thumb.jpg`);
  }
}
