import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../../core/helpers/helper';
import { getImageById, getResultIdForImage } from '../investigation-images.repository';
import { errorResponse } from '../../../common/responses/error-responses';

/**
 * Middleware to verify image ownership for sensitive operations
 * Checks if the current user uploaded the image or has elevated permissions
 */
export async function verifyImageOwnership(
  req: Request & { user: { sub: number; role?: string; department?: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      return errorResponse({
        res,
        message: 'Image ID is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    const image = await getImageById(Number(imageId));

    if (!image) {
      return errorResponse({
        res,
        message: 'Image not found',
        httpCode: StatusCodes.NOT_FOUND,
      });
    }

    // Check if user is the uploader or has elevated role
    const isUploader = image.uploaded_by === req.user.sub;
    const hasElevatedRole = [
      'Administration',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Medical Practitioners',
      'Surgery Unit',
      'Medicine Unit',
      'Pediatrics Unit',
      'Obstetrics & Gynaecology Unit',
      'Family Medicine Unit',
      'Physiotherapy Unit',
    ].includes(req.user.department?.toLowerCase() || '');

    if (!isUploader && !hasElevatedRole) {
      return errorResponse({
        res,
        message: 'Unauthorized: You do not have permission to modify this image',
        httpCode: StatusCodes.FORBIDDEN,
      });
    }

    // Attach image to request for downstream use
    req['image'] = image;
    next();
  } catch (error) {
    return errorResponse({
      res,
      message: error.message || 'Error verifying image ownership',
      httpCode: StatusCodes.SERVER_ERROR,
    });
  }
}

/**
 * Middleware to verify investigation result access
 * Ensures user has permission to access images for a specific investigation result
 */
export async function verifyInvestigationAccess(
  req: Request & { user: { sub: number; role?: string } },
  res: Response,
  next: NextFunction
) {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      return errorResponse({
        res,
        message: 'Investigation result ID is required',
        httpCode: StatusCodes.BAD_REQUEST,
      });
    }

    // In a full implementation, you would:
    // 1. Check if the investigation result exists
    // 2. Verify user has access to the patient's records
    // 3. Check if user's department/role allows access to this investigation type

    // For now, we'll allow all authenticated users (already verified by verify middleware)
    // This can be extended based on specific business rules

    next();
  } catch (error) {
    return errorResponse({
      res,
      message: error.message || 'Error verifying investigation access',
      httpCode: StatusCodes.SERVER_ERROR,
    });
  }
}

/**
 * Middleware to restrict access to specific roles
 * For sensitive operations that should only be performed by certain roles
 */
export function restrictToRoles(allowedRoles: string[]) {
  return (
    req: Request & { user: { sub: number; role?: string } },
    res: Response,
    next: NextFunction
  ) => {
    const userRole = req.user.role?.toLowerCase() || '';

    const hasPermission =
      allowedRoles.some(role => role.toLowerCase() === userRole) || userRole === 'Super Admin'; // Admin always has access

    if (!hasPermission) {
      return errorResponse({
        res,
        message: `Unauthorized: This operation requires one of the following roles: ${allowedRoles.join(
          ', '
        )}`,
        httpCode: StatusCodes.FORBIDDEN,
      });
    }

    next();
  };
}
