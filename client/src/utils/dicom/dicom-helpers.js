import * as cornerstone from 'cornerstone-core';

/**
 * Calculate optimal window/level for an image
 * @param {object} image - Cornerstone image
 * @returns {object} Window center and width
 */
export function calculateOptimalWindowLevel(image) {
  if (!image) {
    return { windowCenter: 0, windowWidth: 0 };
  }

  // Use image metadata if available
  if (image.windowCenter && image.windowWidth) {
    return {
      windowCenter: Array.isArray(image.windowCenter) ? image.windowCenter[0] : image.windowCenter,
      windowWidth: Array.isArray(image.windowWidth) ? image.windowWidth[0] : image.windowWidth,
    };
  }

  // Calculate from pixel data
  const pixelData = image.getPixelData();
  let min = pixelData[0];
  let max = pixelData[0];

  for (let i = 1; i < pixelData.length; i++) {
    if (pixelData[i] < min) min = pixelData[i];
    if (pixelData[i] > max) max = pixelData[i];
  }

  const windowWidth = max - min;
  const windowCenter = (max + min) / 2;

  return { windowCenter, windowWidth };
}

/**
 * Reset viewport to default state
 * @param {HTMLElement} element - Viewport element
 */
export function resetViewport(element) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getDefaultViewportForImage(element, enabledElement.image);
  cornerstone.setViewport(element, viewport);
}

/**
 * Fit image to viewport
 * @param {HTMLElement} element - Viewport element
 */
export function fitToWindow(element) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  cornerstone.fitToWindow(element);
}

/**
 * Invert image colors
 * @param {HTMLElement} element - Viewport element
 */
export function invertImage(element) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.invert = !viewport.invert;
  cornerstone.setViewport(element, viewport);
}

/**
 * Rotate image
 * @param {HTMLElement} element - Viewport element
 * @param {number} degrees - Degrees to rotate (90, 180, 270, etc.)
 */
export function rotateImage(element, degrees) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.rotation = (viewport.rotation || 0) + degrees;
  cornerstone.setViewport(element, viewport);
}

/**
 * Flip image horizontally
 * @param {HTMLElement} element - Viewport element
 */
export function flipHorizontal(element) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.hflip = !viewport.hflip;
  cornerstone.setViewport(element, viewport);
}

/**
 * Flip image vertically
 * @param {HTMLElement} element - Viewport element
 */
export function flipVertical(element) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.vflip = !viewport.vflip;
  cornerstone.setViewport(element, viewport);
}

/**
 * Zoom in
 * @param {HTMLElement} element - Viewport element
 * @param {number} factor - Zoom factor (default 1.2)
 */
export function zoomIn(element, factor = 1.2) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.scale *= factor;
  cornerstone.setViewport(element, viewport);
}

/**
 * Zoom out
 * @param {HTMLElement} element - Viewport element
 * @param {number} factor - Zoom factor (default 0.8)
 */
export function zoomOut(element, factor = 0.8) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.scale *= factor;
  cornerstone.setViewport(element, viewport);
}

/**
 * Adjust window level
 * @param {HTMLElement} element - Viewport element
 * @param {number} windowCenter - Window center value
 * @param {number} windowWidth - Window width value
 */
export function setWindowLevel(element, windowCenter, windowWidth) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.voi = {
    windowWidth,
    windowCenter,
  };
  cornerstone.setViewport(element, viewport);
}

/**
 * Pan image
 * @param {HTMLElement} element - Viewport element
 * @param {number} deltaX - X offset
 * @param {number} deltaY - Y offset
 */
export function panImage(element, deltaX, deltaY) {
  const enabledElement = cornerstone.getEnabledElement(element);
  if (!enabledElement) return;

  const viewport = cornerstone.getViewport(element);
  viewport.translation.x += deltaX;
  viewport.translation.y += deltaY;
  cornerstone.setViewport(element, viewport);
}

/**
 * Get pixel value at coordinates
 * @param {HTMLElement} element - Viewport element
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {object} Pixel data
 */
export function getPixelValue(element, x, y) {
  try {
    const enabledElement = cornerstone.getEnabledElement(element);
    if (!enabledElement) return null;

    const image = enabledElement.image;
    const pixelCoords = cornerstone.pageToPixel(element, x, y);

    const pixelIndex = pixelCoords.y * image.width + pixelCoords.x;
    const pixelData = image.getPixelData();
    const pixelValue = pixelData[pixelIndex];

    return {
      x: Math.round(pixelCoords.x),
      y: Math.round(pixelCoords.y),
      value: pixelValue,
      storedValue: pixelValue,
      modalityValue: pixelValue * (image.slope || 1) + (image.intercept || 0),
    };
  } catch (error) {
    console.error('Error getting pixel value:', error);
    return null;
  }
}

/**
 * Calculate distance between two points in mm
 * @param {object} point1 - First point {x, y}
 * @param {object} point2 - Second point {x, y}
 * @param {object} pixelSpacing - Pixel spacing {row, column}
 * @returns {number} Distance in mm
 */
export function calculateDistance(point1, point2, pixelSpacing) {
  const dx = (point2.x - point1.x) * (pixelSpacing?.column || 1);
  const dy = (point2.y - point1.y) * (pixelSpacing?.row || 1);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between three points
 * @param {object} point1 - First point
 * @param {object} vertex - Vertex point
 * @param {object} point2 - Second point
 * @returns {number} Angle in degrees
 */
export function calculateAngle(point1, vertex, point2) {
  const dx1 = point1.x - vertex.x;
  const dy1 = point1.y - vertex.y;
  const dx2 = point2.x - vertex.x;
  const dy2 = point2.y - vertex.y;

  const angle1 = Math.atan2(dy1, dx1);
  const angle2 = Math.atan2(dy2, dx2);

  let angle = (angle2 - angle1) * (180 / Math.PI);

  // Normalize to 0-180 degrees
  if (angle < 0) angle += 360;
  if (angle > 180) angle = 360 - angle;

  return angle;
}

/**
 * Get image statistics
 * @param {object} image - Cornerstone image
 * @returns {object} Image statistics
 */
export function getImageStatistics(image) {
  if (!image) return null;

  const pixelData = image.getPixelData();
  let min = pixelData[0];
  let max = pixelData[0];
  let sum = 0;

  for (let i = 0; i < pixelData.length; i++) {
    const value = pixelData[i];
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
  }

  const mean = sum / pixelData.length;

  // Calculate standard deviation
  let sumSquaredDiff = 0;
  for (let i = 0; i < pixelData.length; i++) {
    const diff = pixelData[i] - mean;
    sumSquaredDiff += diff * diff;
  }
  const stdDev = Math.sqrt(sumSquaredDiff / pixelData.length);

  return {
    min,
    max,
    mean,
    stdDev,
    range: max - min,
  };
}

/**
 * Convert Hounsfield Units to SUV (for PET images)
 * @param {number} hu - Hounsfield unit value
 * @param {object} metadata - DICOM metadata
 * @returns {number} SUV value
 */
// eslint-disable-next-line no-unused-vars
export function convertHUtoSUV(hu, metadata) {
  // This is a simplified conversion
  // Real conversion requires more metadata (patient weight, dose, etc.)
  return hu;
}

/**
 * Window level presets for common imaging modalities
 */
export const WINDOW_LEVEL_PRESETS = {
  CT: {
    ABDOMEN: { windowCenter: 40, windowWidth: 400 },
    BONE: { windowCenter: 400, windowWidth: 1800 },
    BRAIN: { windowCenter: 40, windowWidth: 80 },
    CHEST: { windowCenter: -600, windowWidth: 1500 },
    LIVER: { windowCenter: 80, windowWidth: 150 },
    LUNG: { windowCenter: -500, windowWidth: 1500 },
    MEDIASTINUM: { windowCenter: 50, windowWidth: 350 },
    SPINE: { windowCenter: 40, windowWidth: 400 },
  },
  MR: {
    DEFAULT: { windowCenter: 128, windowWidth: 256 },
  },
  PT: {
    DEFAULT: { windowCenter: 2.5, windowWidth: 5.0 },
  },
};

export default {
  calculateOptimalWindowLevel,
  resetViewport,
  fitToWindow,
  invertImage,
  rotateImage,
  flipHorizontal,
  flipVertical,
  zoomIn,
  zoomOut,
  setWindowLevel,
  panImage,
  getPixelValue,
  calculateDistance,
  calculateAngle,
  getImageStatistics,
  convertHUtoSUV,
  WINDOW_LEVEL_PRESETS,
};
