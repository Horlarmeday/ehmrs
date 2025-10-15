import { promises as fs } from 'fs';
import path from 'path';

/**
 * Magic bytes signatures for common file types
 * Used for validating actual file content vs claimed extension
 */
const FILE_SIGNATURES = {
  // DICOM files start with specific preamble
  DICOM: {
    offset: 128,
    signature: [0x44, 0x49, 0x43, 0x4d], // "DICM" at offset 128
  },
  // JPEG files
  JPEG: {
    offset: 0,
    signature: [0xff, 0xd8, 0xff],
  },
  // PNG files
  PNG: {
    offset: 0,
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  // GIF files
  GIF: {
    offset: 0,
    signature: [0x47, 0x49, 0x46], // "GIF"
  },
  // TIFF files (little-endian)
  TIFF_LE: {
    offset: 0,
    signature: [0x49, 0x49, 0x2a, 0x00],
  },
  // TIFF files (big-endian)
  TIFF_BE: {
    offset: 0,
    signature: [0x4d, 0x4d, 0x00, 0x2a],
  },
};

/**
 * Validate file type using magic bytes
 * @param filePath - Path to the file
 * @param expectedExtension - Expected file extension
 * @returns Promise<boolean> - True if file type matches expected extension
 */
export async function validateFileMagicBytes(
  filePath: string,
  expectedExtension: string
): Promise<boolean> {
  try {
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(256); // Read first 256 bytes
    await fileHandle.read(buffer, 0, 256, 0);
    await fileHandle.close();

    const ext = expectedExtension.toLowerCase().replace('.', '');

    switch (ext) {
      case 'dcm':
      case 'dicom':
        return validateSignature(buffer, FILE_SIGNATURES.DICOM);

      case 'jpg':
      case 'jpeg':
        return validateSignature(buffer, FILE_SIGNATURES.JPEG);

      case 'png':
        return validateSignature(buffer, FILE_SIGNATURES.PNG);

      case 'gif':
        return validateSignature(buffer, FILE_SIGNATURES.GIF);

      case 'tif':
      case 'tiff':
        return (
          validateSignature(buffer, FILE_SIGNATURES.TIFF_LE) ||
          validateSignature(buffer, FILE_SIGNATURES.TIFF_BE)
        );

      default:
        // Unknown extension - allow it (will be caught by other validation)
        return true;
    }
  } catch (error) {
    console.error('Error validating file magic bytes:', error);
    return false;
  }
}

/**
 * Check if buffer matches signature at given offset
 */
function validateSignature(buffer: Buffer, sig: { offset: number; signature: number[] }): boolean {
  for (let i = 0; i < sig.signature.length; i++) {
    if (buffer[sig.offset + i] !== sig.signature[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Sanitize file path to prevent directory traversal attacks
 * @param basePath - The allowed base directory
 * @param requestedPath - The requested file path
 * @returns string - Sanitized absolute path
 * @throws Error if path attempts to escape base directory
 */
export function sanitizePath(basePath: string, requestedPath: string): string {
  // Resolve to absolute paths
  const resolvedBase = path.resolve(basePath);
  const resolvedPath = path.resolve(basePath, requestedPath);

  // Check if resolved path is within base directory
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error('Invalid file path: Directory traversal attempt detected');
  }

  return resolvedPath;
}

/**
 * Validate that a file path is safe and within allowed directories
 * @param filePath - Path to validate
 * @param allowedPaths - Array of allowed base paths
 * @returns boolean - True if path is safe
 */
export function isPathSafe(filePath: string, allowedPaths: string[]): boolean {
  const resolvedPath = path.resolve(filePath);

  // Check if path contains directory traversal patterns
  if (filePath.includes('..') || filePath.includes('//')) {
    return false;
  }

  // Check if path is within one of the allowed directories
  return allowedPaths.some(allowedPath => {
    const resolvedAllowed = path.resolve(allowedPath);
    return resolvedPath.startsWith(resolvedAllowed);
  });
}

/**
 * Log file access for audit trail
 * @param operation - Type of operation (upload, download, delete, view)
 * @param filePath - Path to the file
 * @param userId - ID of user performing operation
 * @param metadata - Additional metadata
 */
export async function logFileAccess(
  operation: 'upload' | 'download' | 'delete' | 'view',
  filePath: string,
  userId: number | string,
  metadata?: Record<string, any>
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    filePath: path.basename(filePath), // Only log filename, not full path
    userId,
    ...metadata,
  };

  // Log to console for immediate visibility
  console.log('[FILE_ACCESS]', JSON.stringify(logEntry));

  // Save to database for persistent audit trail
  try {
    // Dynamically import to avoid circular dependencies
    const { AuditLog } = await import('../../database/models/auditLog');

    await AuditLog.create({
      operation: operation as any, // Use any to avoid circular dependency issues
      resource_type: 'investigation_image',
      resource_id: metadata?.imageId || metadata?.investigationResultId,
      user_id: typeof userId === 'number' ? userId : undefined,
      user_type: typeof userId === 'string' ? 'anonymous' : 'staff',
      metadata: {
        fileName: path.basename(filePath),
        ...metadata,
      },
      status: 'success' as any,
    });
  } catch (error) {
    // Don't fail the operation if audit logging fails, just log the error
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}

/**
 * Validate file size
 * @param filePath - Path to the file
 * @param maxSize - Maximum allowed size in bytes
 * @returns Promise<boolean> - True if file size is within limits
 */
export async function validateFileSize(filePath: string, maxSize: number): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= maxSize;
  } catch (error) {
    console.error('Error checking file size:', error);
    return false;
  }
}

/**
 * Generate secure random filename
 * @param originalName - Original filename
 * @param crypto - Crypto module
 * @returns string - Secure random filename
 */
export function generateSecureFilename(originalName: string, crypto: any): string {
  const ext = path.extname(originalName).toLowerCase();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const basename = path.basename(originalName, ext);

  // Sanitize original name
  const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);

  // Prevent directory traversal in extension
  const safeExt = ext.replace(/\.\./g, '').replace(/[\/\\]/g, '');

  return `${sanitized}-${timestamp}-${randomBytes}${safeExt}`;
}

/**
 * Check if file extension is allowed
 * @param filename - Filename to check
 * @param allowedExtensions - Array of allowed extensions (with dots)
 * @returns boolean - True if extension is allowed
 */
export function isExtensionAllowed(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Detect potential malicious patterns in filename
 * @param filename - Filename to check
 * @returns boolean - True if filename appears safe
 */
export function isFilenameSafe(filename: string): boolean {
  // Check for null bytes
  if (filename.includes('\0')) {
    return false;
  }

  // Check for directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for excessively long names
  if (filename.length > 255) {
    return false;
  }

  // Check for control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(filename)) {
    return false;
  }

  return true;
}

/**
 * Security validation result
 */
export interface FileSecurityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive file security validation
 * @param filePath - Path to the file
 * @param options - Validation options
 * @returns Promise<FileSecurityValidation> - Validation result
 */
export async function validateFileSecurity(
  filePath: string,
  options: {
    maxSize?: number;
    allowedExtensions?: string[];
    validateMagicBytes?: boolean;
    allowedBasePaths?: string[];
  }
): Promise<FileSecurityValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filename = path.basename(filePath);

  // Check filename safety
  if (!isFilenameSafe(filename)) {
    errors.push('Filename contains invalid or malicious characters');
  }

  // Check extension
  if (options.allowedExtensions) {
    if (!isExtensionAllowed(filename, options.allowedExtensions)) {
      errors.push(`File extension not allowed. Allowed: ${options.allowedExtensions.join(', ')}`);
    }
  }

  // Check path safety
  if (options.allowedBasePaths) {
    if (!isPathSafe(filePath, options.allowedBasePaths)) {
      errors.push('File path is outside allowed directories');
    }
  }

  // Check file size
  if (options.maxSize) {
    const sizeValid = await validateFileSize(filePath, options.maxSize);
    if (!sizeValid) {
      errors.push(`File size exceeds maximum of ${options.maxSize} bytes`);
    }
  }

  // Validate magic bytes
  if (options.validateMagicBytes) {
    const ext = path.extname(filename);
    const magicBytesValid = await validateFileMagicBytes(filePath, ext);
    if (!magicBytesValid) {
      warnings.push('File content does not match declared file type');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
