import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
import dicomParser from 'dicom-parser';

let isInitialized = false;

/**
 * Initialize Cornerstone loaders
 * This should be called once when the application starts
 */
export function initializeCornerstoneLoaders() {
  if (isInitialized) {
    return;
  }

  // Configure WADO Image Loader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  // Configure Web Image Loader
  cornerstoneWebImageLoader.external.cornerstone = cornerstone;

  // Configure WADO Image Loader codec
  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  };

  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

  isInitialized = true;
}

/**
 * Load image using Cornerstone
 * @param {string} imageId - Cornerstone image ID
 * @returns {Promise} Promise that resolves to loaded image
 */
export function loadImage(imageId) {
  return cornerstone.loadImage(imageId);
}

/**
 * Create image ID from file
 * @param {File|Blob} file - File or Blob object
 * @returns {Promise<string>} Promise that resolves to image ID
 */
export function createImageIdFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;

      // Check if it's a DICOM file
      const byteArray = new Uint8Array(arrayBuffer);
      const prefix = String.fromCharCode.apply(null, byteArray.slice(128, 132));

      if (prefix === 'DICM') {
        // It's a DICOM file
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        resolve(imageId);
      } else {
        // It's a regular image file
        const blob = new Blob([arrayBuffer]);
        const url = URL.createObjectURL(blob);
        resolve(url);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create image ID from URL
 * @param {string} url - Image URL
 * @param {boolean} isDicom - Whether the image is DICOM
 * @returns {string} Cornerstone image ID
 */
export function createImageIdFromUrl(url, isDicom = false) {
  if (isDicom) {
    return `wadouri:${url}`;
  }
  return url;
}

/**
 * Invalidate image cache
 * @param {string} imageId - Image ID to invalidate
 */
export function invalidateImageCache(imageId) {
  cornerstone.imageCache.removeImageLoadObject(imageId);
}

/**
 * Clear entire image cache
 */
export function clearImageCache() {
  cornerstone.imageCache.purgeCache();
}

/**
 * Get cornerstone instance
 * @returns {object} Cornerstone instance
 */
export function getCornerstone() {
  return cornerstone;
}

export default {
  initializeCornerstoneLoaders,
  loadImage,
  createImageIdFromFile,
  createImageIdFromUrl,
  invalidateImageCache,
  clearImageCache,
  getCornerstone,
};
