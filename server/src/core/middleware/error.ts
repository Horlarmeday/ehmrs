import * as winston from 'winston';
import { NextFunction, Request, Response } from 'express';
import { handleError } from '../../common/responses/error-responses';
import { logger } from '../helpers/logger';

export default function(error, req: Request, res: Response, next: NextFunction) {
  logger.error(error.message, error);
  winston.error(error.message, error);
  handleError(error, res);
}
