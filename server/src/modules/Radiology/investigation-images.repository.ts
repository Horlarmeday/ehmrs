import {
  InvestigationResultImage,
  ImageFileType,
} from '../../database/models/investigationResultImage';
import { InvestigationResult } from '../../database/models/investigationResult';
import { Staff } from '../../database/models/staff';
import { Op } from 'sequelize';

/**
 * Interface for creating investigation image
 */
export interface CreateInvestigationImageDto {
  investigation_result_id: number;
  file_path: string;
  file_type: ImageFileType;
  file_size: number;
  dicom_metadata?: string;
  uploaded_by: number;
  is_primary?: boolean;
  display_order?: number;
  original_filename?: string;
  thumbnail_path?: string;
  description?: string;
}

/**
 * Interface for updating investigation image
 */
export interface UpdateInvestigationImageDto {
  is_primary?: boolean;
  display_order?: number;
  description?: string;
  thumbnail_path?: string;
}

/**
 * Create a new investigation result image
 * @param data Image data
 */
export const createInvestigationImage = async (
  data: CreateInvestigationImageDto
): Promise<InvestigationResultImage> => {
  return InvestigationResultImage.create(data as any);
};

/**
 * Create multiple investigation result images
 * @param images Array of image data
 */
export const createMultipleInvestigationImages = async (
  images: CreateInvestigationImageDto[]
): Promise<InvestigationResultImage[]> => {
  return InvestigationResultImage.bulkCreate(images as any);
};

/**
 * Get all images for a specific investigation result
 * @param resultId Investigation result ID
 * @param includeRelations Include related data
 */
export const getInvestigationImages = async (
  resultId: number,
  includeRelations = false
): Promise<InvestigationResultImage[]> => {
  const include = includeRelations
    ? [
        {
          model: InvestigationResult,
          as: 'investigationResult',
        },
        {
          model: Staff,
          as: 'uploader',
          attributes: ['id', 'firstname', 'lastname', 'username'],
        },
      ]
    : [];

  return InvestigationResultImage.findByResultId(resultId, {
    include,
    order: [
      ['display_order', 'ASC'],
      ['upload_date', 'ASC'],
    ],
  });
};

/**
 * Get a single investigation image by ID
 * @param imageId Image ID
 * @param includeRelations Include related data
 */
export const getImageById = async (
  imageId: number,
  includeRelations = false
): Promise<InvestigationResultImage | null> => {
  const include = includeRelations
    ? [
        {
          model: InvestigationResult,
          as: 'investigationResult',
        },
        {
          model: Staff,
          as: 'uploader',
          attributes: ['id', 'firstname', 'lastname', 'username'],
        },
      ]
    : [];

  return InvestigationResultImage.findByPk(imageId, { include });
};

/**
 * Delete an investigation image
 * @param imageId Image ID
 */
export const deleteInvestigationImage = async (imageId: number): Promise<number> => {
  return InvestigationResultImage.destroy({
    where: { id: imageId },
  });
};

/**
 * Set an image as primary for an investigation result
 * @param imageId Image ID
 */
export const setAsPrimaryImage = async (imageId: number): Promise<InvestigationResultImage> => {
  return InvestigationResultImage.setAsPrimary(imageId);
};

/**
 * Update display order of an image
 * @param imageId Image ID
 * @param order New display order
 */
export const updateDisplayOrder = async (
  imageId: number,
  order: number
): Promise<[number, InvestigationResultImage[]]> => {
  return InvestigationResultImage.update(
    { display_order: order },
    {
      where: { id: imageId },
      returning: true,
    }
  );
};

/**
 * Update investigation image
 * @param imageId Image ID
 * @param data Update data
 */
export const updateInvestigationImage = async (
  imageId: number,
  data: UpdateInvestigationImageDto
): Promise<[number, InvestigationResultImage[]]> => {
  return InvestigationResultImage.update(data, {
    where: { id: imageId },
    returning: true,
  });
};

/**
 * Get primary image for an investigation result
 * @param resultId Investigation result ID
 */
export const getPrimaryImage = async (
  resultId: number
): Promise<InvestigationResultImage | null> => {
  return InvestigationResultImage.findPrimaryImage(resultId);
};

/**
 * Count images for an investigation result
 * @param resultId Investigation result ID
 */
export const countImages = async (resultId: number): Promise<number> => {
  return InvestigationResultImage.countByResultId(resultId);
};

/**
 * Get only DICOM images for an investigation result
 * @param resultId Investigation result ID
 */
export const getDicomImages = async (resultId: number): Promise<InvestigationResultImage[]> => {
  return InvestigationResultImage.findDicomImages(resultId);
};

/**
 * Get non-DICOM images for an investigation result
 * @param resultId Investigation result ID
 */
export const getRegularImages = async (resultId: number): Promise<InvestigationResultImage[]> => {
  return InvestigationResultImage.findAll({
    where: {
      investigation_result_id: resultId,
      file_type: {
        [Op.ne]: ImageFileType.DICOM,
      },
    },
    order: [
      ['display_order', 'ASC'],
      ['upload_date', 'ASC'],
    ],
  });
};

/**
 * Delete all images for an investigation result
 * @param resultId Investigation result ID
 */
export const deleteAllImagesForResult = async (resultId: number): Promise<number> => {
  return InvestigationResultImage.destroy({
    where: { investigation_result_id: resultId },
  });
};

/**
 * Check if an image belongs to a specific investigation result
 * @param imageId Image ID
 * @param resultId Investigation result ID
 */
export const imageExistsForResult = async (imageId: number, resultId: number): Promise<boolean> => {
  const count = await InvestigationResultImage.count({
    where: {
      id: imageId,
      investigation_result_id: resultId,
    },
  });

  return count > 0;
};

/**
 * Get images uploaded by a specific staff member
 * @param staffId Staff ID
 * @param limit Limit number of results
 */
export const getImagesByUploader = async (
  staffId: number,
  limit?: number
): Promise<InvestigationResultImage[]> => {
  return InvestigationResultImage.findAll({
    where: { uploaded_by: staffId },
    order: [['upload_date', 'DESC']],
    limit,
  });
};

/**
 * Get total storage used by images for an investigation result
 * @param resultId Investigation result ID
 */
export const getTotalStorageSize = async (resultId: number): Promise<number> => {
  const images = await InvestigationResultImage.findAll({
    where: { investigation_result_id: resultId },
    attributes: ['file_size'],
  });

  return images.reduce((total, image) => total + Number(image.file_size), 0);
};

/**
 * Reorder images for an investigation result
 * @param imageOrders Array of {imageId, order} pairs
 */
export const reorderImages = async (
  imageOrders: Array<{ imageId: number; order: number }>
): Promise<void> => {
  const promises = imageOrders.map(({ imageId, order }) =>
    InvestigationResultImage.update({ display_order: order }, { where: { id: imageId } })
  );

  await Promise.all(promises);
};

/**
 * Get investigation result ID for an image
 * @param imageId Image ID
 */
export const getResultIdForImage = async (imageId: number): Promise<number | null> => {
  const image = await InvestigationResultImage.findByPk(imageId, {
    attributes: ['investigation_result_id'],
  });

  return image ? image.investigation_result_id : null;
};
