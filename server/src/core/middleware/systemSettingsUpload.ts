import { upload } from '../helpers/multer';
import { NextFunction, Response, Request } from 'express';

export const systemSettingsUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('logo');
  upload.single('stamp');

  next();
};
