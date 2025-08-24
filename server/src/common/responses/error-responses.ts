import { Response } from 'express';
import { ERROR } from '../../core/constants';

console.log(process.env.NODE_ENV);

export const handleError = (err: any, res: Response) => {
  const { httpCode, message } = err;
  const statusCode = httpCode || 500;
  console.error(err);
  res.status(statusCode).send({
    status: ERROR,
    httpCode: statusCode,
    message,
  });
};

export const errorResponse = ({ res, httpCode, message }) => {
  console.error(message);
  return res.status(httpCode).json({
    status: ERROR,
    httpCode: httpCode,
    message,
  });
};
