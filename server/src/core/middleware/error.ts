import * as winston from 'winston';
import { NextFunction, Request, Response } from 'express';
import { handleError } from '../../common/responses/error-responses';

export default function(error, req: Request, res: Response, next: NextFunction) {
  winston.error(error.message, error);
  handleError(error, res);
}
