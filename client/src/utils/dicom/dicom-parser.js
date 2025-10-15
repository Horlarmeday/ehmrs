import dicomParser from 'dicom-parser';

/**
 * Parse DICOM file and extract metadata
 * @param {ArrayBuffer} arrayBuffer - DICOM file as array buffer
 * @returns {Object} Parsed DICOM metadata
 */
export function parseDicomFile(arrayBuffer) {
  try {
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = dicomParser.parseDicom(byteArray);

    return {
      success: true,
      dataSet,
      metadata: extractMetadata(dataSet),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Extract common DICOM metadata
 * @param {object} dataSet - Parsed DICOM dataset
 * @returns {object} Extracted metadata
 */
export function extractMetadata(dataSet) {
  const metadata = {};

  try {
    // Patient Information
    metadata.patientName = getString(dataSet, 'x00100010');
    metadata.patientId = getString(dataSet, 'x00100020');
    metadata.patientBirthDate = getString(dataSet, 'x00100030');
    metadata.patientSex = getString(dataSet, 'x00100040');

    // Study Information
    metadata.studyDate = getString(dataSet, 'x00080020');
    metadata.studyTime = getString(dataSet, 'x00080030');
    metadata.studyDescription = getString(dataSet, 'x00081030');
    metadata.studyInstanceUID = getString(dataSet, 'x0020000d');
    metadata.accessionNumber = getString(dataSet, 'x00080050');

    // Series Information
    metadata.seriesNumber = getString(dataSet, 'x00200011');
    metadata.seriesDescription = getString(dataSet, 'x0008103e');
    metadata.seriesInstanceUID = getString(dataSet, 'x0020000e');
    metadata.modality = getString(dataSet, 'x00080060');

    // Equipment Information
    metadata.manufacturer = getString(dataSet, 'x00080070');
    metadata.manufacturerModelName = getString(dataSet, 'x00081090');
    metadata.institutionName = getString(dataSet, 'x00080080');
    metadata.stationName = getString(dataSet, 'x00081010');

    // Instance Information
    metadata.instanceNumber = getString(dataSet, 'x00200013');
    metadata.sopInstanceUID = getString(dataSet, 'x00080018');
    metadata.sopClassUID = getString(dataSet, 'x00080016');

    // Image Information
    metadata.rows = getNumber(dataSet, 'x00280010');
    metadata.columns = getNumber(dataSet, 'x00280011');
    metadata.bitsAllocated = getNumber(dataSet, 'x00280100');
    metadata.bitsStored = getNumber(dataSet, 'x00280101');
    metadata.samplesPerPixel = getNumber(dataSet, 'x00280002');
    metadata.photometricInterpretation = getString(dataSet, 'x00280004');

    // Window Level
    metadata.windowCenter = getNumber(dataSet, 'x00281050');
    metadata.windowWidth = getNumber(dataSet, 'x00281051');

    // Spatial Information
    metadata.sliceThickness = getString(dataSet, 'x00180050');
    metadata.sliceLocation = getString(dataSet, 'x00201041');
    metadata.pixelSpacing = getString(dataSet, 'x00280030');
    metadata.imagePosition = getString(dataSet, 'x00200032');
    metadata.imageOrientation = getString(dataSet, 'x00200037');

    // Acquisition Information
    metadata.kvp = getString(dataSet, 'x00180060');
    metadata.exposureTime = getString(dataSet, 'x00181150');
    metadata.xRayTubeCurrent = getString(dataSet, 'x00181151');

    return metadata;
  } catch (error) {
    console.error('Error extracting DICOM metadata:', error);
    return metadata;
  }
}

/**
 * Get string value from DICOM tag
 * @param {object} dataSet - DICOM dataset
 * @param {string} tag - DICOM tag
 * @returns {string|undefined} Tag value
 */
function getString(dataSet, tag) {
  try {
    return dataSet.string(tag);
  } catch {
    return undefined;
  }
}

/**
 * Get number value from DICOM tag
 * @param {object} dataSet - DICOM dataset
 * @param {string} tag - DICOM tag
 * @returns {number|undefined} Tag value
 */
function getNumber(dataSet, tag) {
  try {
    const value = dataSet.intString(tag);
    return value ? parseInt(value, 10) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Format DICOM date (YYYYMMDD) to readable format
 * @param {string} dicomDate - DICOM date string
 * @returns {string} Formatted date
 */
export function formatDicomDate(dicomDate) {
  if (!dicomDate || dicomDate.length !== 8) {
    return dicomDate;
  }

  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);

  return `${day}/${month}/${year}`;
}

/**
 * Format DICOM time (HHMMSS) to readable format
 * @param {string} dicomTime - DICOM time string
 * @returns {string} Formatted time
 */
export function formatDicomTime(dicomTime) {
  if (!dicomTime || dicomTime.length < 6) {
    return dicomTime;
  }

  const hours = dicomTime.substring(0, 2);
  const minutes = dicomTime.substring(2, 4);
  const seconds = dicomTime.substring(4, 6);

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format patient name (Last^First^Middle) to readable format
 * @param {string} patientName - DICOM patient name
 * @returns {string} Formatted name
 */
export function formatPatientName(patientName) {
  if (!patientName) {
    return patientName;
  }

  const parts = patientName.split('^');
  if (parts.length === 1) {
    return patientName;
  }

  // Last, First Middle
  return `${parts[0]}, ${parts.slice(1).join(' ')}`.trim();
}

/**
 * Check if buffer is a DICOM file
 * @param {ArrayBuffer} arrayBuffer - File as array buffer
 * @returns {boolean} True if DICOM file
 */
export function isDicomFile(arrayBuffer) {
  try {
    const byteArray = new Uint8Array(arrayBuffer);

    // Check file size
    if (byteArray.length < 132) {
      return false;
    }

    // Check DICOM prefix at byte 128-131
    const prefix = String.fromCharCode.apply(null, byteArray.slice(128, 132));
    return prefix === 'DICM';
  } catch {
    return false;
  }
}

export default {
  parseDicomFile,
  extractMetadata,
  formatDicomDate,
  formatDicomTime,
  formatPatientName,
  isDicomFile,
};
