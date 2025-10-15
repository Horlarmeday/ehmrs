import * as cornerstone from 'cornerstone-core';

/**
 * Load regular image file (non-DICOM) with Cornerstone
 * @param {string} url - Image URL
 * @returns {Promise} Promise that resolves to loaded image
 */
export function loadWebImage(url) {
  return cornerstone.loadImage(url);
}

/**
 * Create image ID for regular web image
 * @param {string} url - Image URL
 * @returns {string} Image ID
 */
export function createWebImageId(url) {
  // Ensure the URL doesn't already have a scheme
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }

  // Add base URL if needed
  return url;
}

/**
 * Load image from File object
 * @param {File} file - File object
 * @returns {Promise<string>} Promise that resolves to image ID
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const blob = new Blob([event.target.result], { type: file.type });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Preload images for faster display
 * @param {Array<string>} imageIds - Array of image IDs to preload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export function preloadImages(imageIds, onProgress) {
  const promises = imageIds.map((imageId, index) => {
    return cornerstone.loadAndCacheImage(imageId).then((image) => {
      if (onProgress) {
        onProgress({
          loaded: index + 1,
          total: imageIds.length,
          percentage: ((index + 1) / imageIds.length) * 100,
          imageId,
          image,
        });
      }
      return image;
    });
  });

  return Promise.all(promises);
}

/**
 * Load and cache single image
 * @param {string} imageId - Image ID
 * @returns {Promise} Promise that resolves to loaded image
 */
export function loadAndCacheImage(imageId) {
  return cornerstone.loadAndCacheImage(imageId);
}

/**
 * Check if image is cached
 * @param {string} imageId - Image ID
 * @returns {boolean} True if image is in cache
 */
export function isImageCached(imageId) {
  const cachedImage = cornerstone.imageCache.getCachedImageBasedOnImageURI(imageId);
  return cachedImage !== undefined;
}

/**
 * Get cached image
 * @param {string} imageId - Image ID
 * @returns {object|undefined} Cached image or undefined
 */
export function getCachedImage(imageId) {
  return cornerstone.imageCache.getCachedImageBasedOnImageURI(imageId);
}

/**
 * Remove image from cache
 * @param {string} imageId - Image ID
 */
export function removeFromCache(imageId) {
  cornerstone.imageCache.removeImageLoadObject(imageId);
}

/**
 * Get cache info
 * @returns {object} Cache information
 */
export function getCacheInfo() {
  return cornerstone.imageCache.getCacheInfo();
}

/**
 * Purge cache
 */
export function purgeCache() {
  cornerstone.imageCache.purgeCache();
}

/**
 * Set maximum cache size
 * @param {number} maxCacheSize - Maximum cache size in bytes
 */
export function setMaxCacheSize(maxCacheSize) {
  cornerstone.imageCache.setMaximumSizeBytes(maxCacheSize);
}

/**
 * Load image stack (series of images)
 * @param {Array<string>} imageIds - Array of image IDs
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Promise that resolves to array of loaded images
 */
export function loadImageStack(imageIds, onProgress) {
  return preloadImages(imageIds, onProgress);
}

/**
 * Create blob URL from base64
 * @param {string} base64 - Base64 encoded image
 * @param {string} mimeType - MIME type
 * @returns {string} Blob URL
 */
export function createBlobUrlFromBase64(base64, mimeType = 'image/jpeg') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return URL.createObjectURL(blob);
}

/**
 * Revoke blob URL to free memory
 * @param {string} url - Blob URL
 */
export function revokeBlobUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Get image file type from URL or file
 * @param {string|File} source - Image source
 * @returns {string} File type
 */
export function getImageFileType(source) {
  if (source instanceof File) {
    return source.type;
  }

  const extension = source.split('.').pop().toLowerCase();
  const typeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    dcm: 'application/dicom',
    dicom: 'application/dicom',
  };

  return typeMap[extension] || 'application/octet-stream';
}

export default {
  loadWebImage,
  createWebImageId,
  loadImageFromFile,
  preloadImages,
  loadAndCacheImage,
  isImageCached,
  getCachedImage,
  removeFromCache,
  getCacheInfo,
  purgeCache,
  setMaxCacheSize,
  loadImageStack,
  createBlobUrlFromBase64,
  revokeBlobUrl,
  getImageFileType,
};
