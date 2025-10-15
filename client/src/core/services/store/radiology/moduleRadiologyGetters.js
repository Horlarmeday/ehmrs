export default {
  /**
   * Get all investigation images
   */
  investigationImages: (state) => state.investigationImages,

  /**
   * Get current investigation images (for active result)
   */
  currentInvestigationImages: (state) => state.currentInvestigationImages,

  /**
   * Get the primary image from current images
   */
  primaryImage: (state) => {
    return state.currentInvestigationImages.find((img) => img.is_primary === true) || null;
  },

  /**
   * Get only DICOM images from current images
   */
  dicomImages: (state) => {
    return state.currentInvestigationImages.filter((img) => img.file_type === 'DICOM');
  },

  /**
   * Get only regular (non-DICOM) images from current images
   */
  regularImages: (state) => {
    return state.currentInvestigationImages.filter((img) => img.file_type !== 'DICOM');
  },

  /**
   * Check if any upload is in progress
   */
  uploadInProgress: (state) => {
    return Object.keys(state.uploadProgress).length > 0;
  },

  /**
   * Get upload progress for all files
   */
  uploadProgress: (state) => state.uploadProgress,

  /**
   * Check if there are any images
   */
  hasImages: (state) => {
    return state.currentInvestigationImages.length > 0;
  },

  /**
   * Get count of current images
   */
  imageCount: (state) => {
    return state.currentInvestigationImages.length;
  },

  /**
   * Get count of DICOM images
   */
  dicomImageCount: (state) => {
    return state.currentInvestigationImages.filter((img) => img.file_type === 'DICOM').length;
  },

  /**
   * Get count of regular images
   */
  regularImageCount: (state) => {
    return state.currentInvestigationImages.filter((img) => img.file_type !== 'DICOM').length;
  },

  /**
   * Get DICOM metadata
   */
  dicomMetadata: (state) => state.dicomMetadata,

  /**
   * Get image upload errors
   */
  imageUploadErrors: (state) => state.imageUploadErrors,

  /**
   * Check if there are any upload errors
   */
  hasUploadErrors: (state) => {
    return state.imageUploadErrors.length > 0;
  },

  /**
   * Get images sorted by display order
   */
  sortedImages: (state) => {
    return [...state.currentInvestigationImages].sort((a, b) => {
      return (a.display_order || 0) - (b.display_order || 0);
    });
  },

  /**
   * Get image by ID
   */
  getImageById: (state) => (imageId) => {
    return state.currentInvestigationImages.find((img) => img.id === imageId) || null;
  },
};
