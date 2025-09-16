import { Response } from 'express';
import { ERROR } from '../../core/constants';

const getEnvMessage = (message: string, httpCode: number) => {
  if (httpCode === 500) {
    if (process.env.NODE_ENV === 'development') {
      return message;
    }
    return 'internal server error';
  }
  return message;
};

export const handleError = (err: any, res: Response) => {
  const { httpCode, message } = err;
  const statusCode = httpCode || 500;
  res.status(statusCode).send({
    status: ERROR,
    httpCode: statusCode,
    message: getEnvMessage(message, statusCode),
  });
};

export const errorResponse = ({ res, httpCode, message }) => {
  return res.status(httpCode).json({
    status: ERROR,
    httpCode: httpCode,
    message: getEnvMessage(message, httpCode),
  });
};
