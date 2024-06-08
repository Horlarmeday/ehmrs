import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/images/');
  },
  filename: (req, file, cb) => {
    if (!file) return cb(null, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
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

export const upload = multer({
  storage,
  fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    checkFileType(file, cb);
  },
});
