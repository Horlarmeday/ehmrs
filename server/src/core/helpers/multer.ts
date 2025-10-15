import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { DEVELOPMENT } from '../constants';
import { PathOrFileDescriptor } from 'fs';
import { promises as fs } from 'fs';
import crypto from 'crypto';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let filepath: PathOrFileDescriptor;
    if (process.env.NODE_ENV === DEVELOPMENT) {
      filepath = `src/public/images/`;
    } else filepath = `ehmrs-api/public/images/`;

    cb(null, filepath);
  },
  filename: (req, file, cb) => {
    if (!file) return cb(null, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
  },
});

// Enhanced storage for radiology investigation images with dynamic paths
const radiologyStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Get investigation result ID from request
      const resultId = req.params.resultId || req.body.investigation_result_id;

      let basePath: string;
      if (process.env.NODE_ENV === DEVELOPMENT) {
        basePath = `src/public/radiology-images/investigations`;
      } else {
        basePath = `ehmrs-api/public/radiology-images/investigations`;
      }

      // Create investigation-specific directory if resultId is provided
      const filepath = resultId ? `${basePath}/${resultId}` : basePath;

      // Ensure directory exists
      await fs.mkdir(filepath, { recursive: true });

      cb(null, filepath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    if (!file) return cb(null, '');

    // Generate cryptographically secure random filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const extname = path.extname(file.originalname).toLowerCase();

    // Prevent directory traversal in extension
    const safeExtname = extname.replace(/\.\./g, '').replace(/[\/\\]/g, '');

    // Store original filename separately for display purposes
    const basename = path.basename(file.originalname, extname);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);

    // Final filename: sanitized-timestamp-random.ext
    cb(null, `${sanitizedBasename}-${timestamp}-${randomBytes}${safeExtname}`);
  },
});

const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

// File type checker for radiology images (includes DICOM)
const checkRadiologyFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow DICOM files (.dcm, .dicom) and standard image formats
  const filetypes = /jpeg|jpg|png|gif|tiff|tif|dcm|dicom/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // DICOM files might have application/dicom or application/octet-stream MIME type
  const allowedMimetypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/tiff',
    'application/dicom',
    'application/octet-stream', // DICOM files sometimes have this MIME type
  ];

  const mimetype = allowedMimetypes.includes(file.mimetype);

  if ((mimetype || file.mimetype.startsWith('image/')) && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only medical images and DICOM files are allowed!'));
  }
};

// File size limits
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max file size
  files: 20, // Max 20 files per upload
};

export const upload = multer({
  storage,
  fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    checkFileType(file, cb);
  },
});

// Radiology-specific upload with enhanced configuration
export const radiologyUpload = multer({
  storage: radiologyStorage,
  limits,
  fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    checkRadiologyFileType(file, cb);
  },
});
