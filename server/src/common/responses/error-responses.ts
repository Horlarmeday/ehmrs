import { Response } from 'express';
import { ERROR } from '../../core/constants';

export const handleError = (err, res: Response) => {
  const { httpCode, message } = err;
  const statusCode = httpCode || 500;
  return res.status(statusCode).json({
    status: ERROR,
    httpCode: statusCode,
    message: statusCode === 500 ? 'internal server error' : message,
  });
};
