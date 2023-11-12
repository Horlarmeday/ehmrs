import { Response } from 'express';
import { ERROR } from '../../core/constants';

export const handleError = (err: any, res: Response) => {
  const { httpCode, message } = err;
  const statusCode = httpCode || 500;
  res.status(statusCode).send({
    status: ERROR,
    httpCode: statusCode,
    message: statusCode === 500 ? 'internal server error' : message,
  });
};

export const errorResponse = ({ res, httpCode, message }) => {
  return res.status(httpCode).json({
    status: ERROR,
    httpCode: httpCode,
    message: httpCode === 500 ? 'internal server error' : message,
  });
};
