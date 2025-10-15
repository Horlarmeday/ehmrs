import * as dicomParser from 'dicom-parser';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Interface for DICOM metadata
 */
export interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  patientBirthDate?: string;
  patientSex?: string;
  patientAge?: string;
  studyDate?: string;
  studyDescription?: string;
  seriesDescription?: string;
  modality?: string;
  institutionName?: string;
  manufacturer?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  sopInstanceUID?: string;
  rows?: number;
  columns?: number;
  bitsAllocated?: number;
  windowCenter?: number;
  windowWidth?: number;
  sliceThickness?: string;
  pixelSpacing?: string;
  imagePosition?: string;
  imageOrientation?: string;
  referringPhysicianName?: string;
  performingPhysicianName?: string;
  patientAddress?: string;
  patientTelephone?: string;
}

/**
 * Interface for PHI detection result
 */
export interface PhiDetectionResult {
  hasPhiData: boolean;
  phiFields: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Interface for DICOM processing result
 */
export interface DicomProcessingResult {
  isValid: boolean;
  metadata: DicomMetadata | null;
  errors: string[];
  warnings: string[];
}

export class DicomProcessorService {
  /**
   * Parse DICOM file and extract metadata
   * @param filePath Path to DICOM file
   */
  static async parseDicomFile(filePath: string): Promise<DicomProcessingResult> {
    const result: DicomProcessingResult = {
      isValid: false,
      metadata: null,
      errors: [],
      warnings: [],
    };

    try {
      // Read the DICOM file
      const dicomBuffer = await fs.readFile(filePath);

      // Parse the DICOM data
      const dataSet = dicomParser.parseDicom(dicomBuffer);

      // Extract metadata
      result.metadata = this.extractMetadata(dataSet);
      result.isValid = true;

      // Comprehensive PHI detection
      const phiDetection = this.detectPhiInMetadata(result.metadata);

      if (phiDetection.hasPhiData) {
        // Add all PHI warnings and recommendations
        result.warnings.push(...phiDetection.warnings);
        result.warnings.push(...phiDetection.recommendations);
      }

      return result;
    } catch (error) {
      result.errors.push(`Failed to parse DICOM file: ${error.message}`);
      return result;
    }
  }

  /**
   * Extract metadata from parsed DICOM dataset
   * @param dataSet Parsed DICOM dataset
   */
  static extractMetadata(dataSet: dicomParser.DataSet): DicomMetadata {
    const metadata: DicomMetadata = {};

    try {
      // Patient Information (PHI)
      metadata.patientName = this.getStringValue(dataSet, 'x00100010');
      metadata.patientId = this.getStringValue(dataSet, 'x00100020');
      metadata.patientBirthDate = this.getStringValue(dataSet, 'x00100030');
      metadata.patientSex = this.getStringValue(dataSet, 'x00100040');
      metadata.patientAge = this.getStringValue(dataSet, 'x00101010');
      metadata.patientAddress = this.getStringValue(dataSet, 'x00101040');
      metadata.patientTelephone = this.getStringValue(dataSet, 'x00102154');

      // Study Information
      metadata.studyDate = this.getStringValue(dataSet, 'x00080020');
      metadata.studyDescription = this.getStringValue(dataSet, 'x00081030');
      metadata.studyInstanceUID = this.getStringValue(dataSet, 'x0020000d');

      // Series Information
      metadata.seriesDescription = this.getStringValue(dataSet, 'x0008103e');
      metadata.seriesInstanceUID = this.getStringValue(dataSet, 'x0020000e');
      metadata.modality = this.getStringValue(dataSet, 'x00080060');

      // Physician Information (PHI)
      metadata.referringPhysicianName = this.getStringValue(dataSet, 'x00080090');
      metadata.performingPhysicianName = this.getStringValue(dataSet, 'x00081050');

      // Equipment Information
      metadata.institutionName = this.getStringValue(dataSet, 'x00080080');
      metadata.manufacturer = this.getStringValue(dataSet, 'x00080070');

      // Instance Information
      metadata.sopInstanceUID = this.getStringValue(dataSet, 'x00080018');

      // Image Information
      metadata.rows = this.getNumberValue(dataSet, 'x00280010');
      metadata.columns = this.getNumberValue(dataSet, 'x00280011');
      metadata.bitsAllocated = this.getNumberValue(dataSet, 'x00280100');

      // Window Level
      metadata.windowCenter = this.getNumberValue(dataSet, 'x00281050');
      metadata.windowWidth = this.getNumberValue(dataSet, 'x00281051');

      // Spatial Information
      metadata.sliceThickness = this.getStringValue(dataSet, 'x00180050');
      metadata.pixelSpacing = this.getStringValue(dataSet, 'x00280030');
      metadata.imagePosition = this.getStringValue(dataSet, 'x00200032');
      metadata.imageOrientation = this.getStringValue(dataSet, 'x00200037');
    } catch (error) {
      // Continue even if some fields fail
    }

    return metadata;
  }

  /**
   * Detect Protected Health Information (PHI) in DICOM metadata
   * @param metadata DICOM metadata to analyze
   * @returns PHI detection result with warnings and recommendations
   */
  static detectPhiInMetadata(metadata: DicomMetadata): PhiDetectionResult {
    const phiFields: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for patient identifiable information
    if (metadata.patientName) {
      phiFields.push('Patient Name');
    }

    if (metadata.patientId) {
      phiFields.push('Patient ID');
    }

    if (metadata.patientBirthDate) {
      phiFields.push('Patient Birth Date');
    }

    if (metadata.patientAddress) {
      phiFields.push('Patient Address');
    }

    if (metadata.patientTelephone) {
      phiFields.push('Patient Telephone');
    }

    // Check for physician names (also PHI)
    if (metadata.referringPhysicianName) {
      phiFields.push('Referring Physician Name');
    }

    if (metadata.performingPhysicianName) {
      phiFields.push('Performing Physician Name');
    }

    // Check for institution name
    if (metadata.institutionName) {
      phiFields.push('Institution Name');
    }

    const hasPhiData = phiFields.length > 0;

    if (hasPhiData) {
      // Generate specific warnings
      warnings.push(
        `⚠️ HIPAA/PHI Warning: DICOM file contains ${phiFields.length} Protected Health Information field(s)`
      );
      warnings.push(`   PHI Fields Found: ${phiFields.join(', ')}`);

      // Generate recommendations
      recommendations.push('🔒 Security Recommendations:');

      if (metadata.patientName || metadata.patientId) {
        recommendations.push(
          '   • Patient identifiers detected - ensure proper access controls are in place'
        );
      }

      if (metadata.patientBirthDate || metadata.patientAge) {
        recommendations.push('   • Patient demographic data present - consider data minimization');
      }

      if (metadata.patientAddress || metadata.patientTelephone) {
        recommendations.push(
          '   • Patient contact information present - ensure secure storage and transmission'
        );
      }

      if (metadata.referringPhysicianName || metadata.performingPhysicianName) {
        recommendations.push('   • Physician information present - verify appropriate consent');
      }

      recommendations.push('   • Consider DICOM anonymization before sharing or exporting');
      recommendations.push(
        '   • Ensure audit logging is enabled for all access to this image'
      );
      recommendations.push('   • Verify HIPAA compliance for storage and transmission');
    }

    return {
      hasPhiData,
      phiFields,
      warnings,
      recommendations,
    };
  }

  /**
   * Validate DICOM file integrity
   * @param filePath Path to DICOM file
   */
  static async validateDicomIntegrity(
    filePath: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const dicomBuffer = await fs.readFile(filePath);

      // Check file size
      if (dicomBuffer.length < 132) {
        errors.push('File too small to be a valid DICOM file');
        return { isValid: false, errors };
      }

      // Check DICOM preamble and prefix
      const prefix = dicomBuffer.toString('ascii', 128, 132);
      if (prefix !== 'DICM') {
        errors.push('Invalid DICOM file: Missing DICM prefix');
        return { isValid: false, errors };
      }

      // Try to parse
      try {
        dicomParser.parseDicom(dicomBuffer);
      } catch (parseError) {
        errors.push(`DICOM parsing failed: ${parseError.message}`);
        return { isValid: false, errors };
      }

      return { isValid: true, errors: [] };
    } catch (error) {
      errors.push(`File read error: ${error.message}`);
      return { isValid: false, errors };
    }
  }

  /**
   * Generate thumbnail from DICOM file
   * @param dicomFilePath Path to DICOM file
   * @param thumbnailPath Output path for thumbnail
   * @param size Thumbnail size (default 200x200)
   */
  static async generateThumbnail(
    dicomFilePath: string,
    thumbnailPath: string,
    size: { width: number; height: number } = { width: 200, height: 200 }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Read DICOM file
      const dicomBuffer = await fs.readFile(dicomFilePath);
      const dataSet = dicomParser.parseDicom(dicomBuffer);

      // Extract pixel data
      const pixelDataElement = dataSet.elements.x7fe00010;
      if (!pixelDataElement) {
        return { success: false, error: 'No pixel data found in DICOM file' };
      }

      const rows = dataSet.uint16('x00280010');
      const columns = dataSet.uint16('x00280011');
      const pixelData = new Uint8Array(
        dataSet.byteArray.buffer,
        pixelDataElement.dataOffset,
        pixelDataElement.length
      );

      // Ensure output directory exists
      const thumbnailDir = path.dirname(thumbnailPath);
      await fs.mkdir(thumbnailDir, { recursive: true });

      // Create thumbnail using sharp
      await sharp(Buffer.from(pixelData), {
        raw: {
          width: columns,
          height: rows,
          channels: 1,
        },
      })
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat('jpeg')
        .toFile(thumbnailPath);

      return { success: true };
    } catch (error) {
      // If DICOM thumbnail generation fails, try as regular image
      try {
        await sharp(dicomFilePath)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFormat('jpeg')
          .toFile(thumbnailPath);

        return { success: true };
      } catch (fallbackError) {
        return {
          success: false,
          error: `Thumbnail generation failed: ${error.message}`,
        };
      }
    }
  }

  /**
   * Generate thumbnail for regular image files (non-DICOM)
   * @param imagePath Path to image file
   * @param thumbnailPath Output path for thumbnail
   * @param size Thumbnail size
   */
  static async generateImageThumbnail(
    imagePath: string,
    thumbnailPath: string,
    size: { width: number; height: number } = { width: 200, height: 200 }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure output directory exists
      const thumbnailDir = path.dirname(thumbnailPath);
      await fs.mkdir(thumbnailDir, { recursive: true });

      await sharp(imagePath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat('jpeg')
        .toFile(thumbnailPath);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Image thumbnail generation failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if file is a valid DICOM file
   * @param filePath Path to file
   */
  static async isDicomFile(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);

      // Check file size
      if (buffer.length < 132) {
        return false;
      }

      // Check DICOM prefix
      const prefix = buffer.toString('ascii', 128, 132);
      return prefix === 'DICM';
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper to get string value from DICOM dataset
   */
  private static getStringValue(dataSet: dicomParser.DataSet, tag: string): string | undefined {
    try {
      return dataSet.string(tag);
    } catch {
      return undefined;
    }
  }

  /**
   * Helper to get number value from DICOM dataset
   */
  private static getNumberValue(dataSet: dicomParser.DataSet, tag: string): number | undefined {
    try {
      const value = dataSet.intString(tag);
      return value ? parseInt(value.toString(), 10) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Anonymize DICOM file by removing patient identifying information
   * @param filePath Path to DICOM file
   * @param outputPath Output path for anonymized file
   */
  static async anonymizeDicom(
    filePath: string,
    outputPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: Full DICOM anonymization is complex and should use specialized libraries
      // This is a placeholder for future implementation
      // For now, we'll just copy the file and add a warning
      await fs.copyFile(filePath, outputPath);

      return {
        success: false,
        error: 'DICOM anonymization not yet implemented. Please use external tools.',
      };
    } catch (error) {
      return {
        success: false,
        error: `Anonymization failed: ${error.message}`,
      };
    }
  }

  /**
   * Get file size in bytes
   * @param filePath Path to file
   */
  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Format file size for display
   * @param bytes File size in bytes
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (Math.round((bytes / Math.pow(k, i)) * 100) / 100).toString() + ' ' + sizes[i];
  }
}
