import { NextFunction, Request, Response } from 'express';
import { handleError } from '../../common/responses/error-responses';
import { logger } from '../helpers/logger';

const ErrorCodesNotToLog = [404];

export default function(error: any, req: Request, res: Response, next: NextFunction) {
  if (error?.statusCode && !ErrorCodesNotToLog.includes(error?.statusCode)) {
    logger.error(error.message, error);
  }
  handleError(error, res);
}
