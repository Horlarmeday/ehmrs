import BaseError from './baseError';

class APIError extends BaseError {
  constructor(name, httpCode, message = 'internal server error') {
    super(name, httpCode, message);
  }
}

const handleError = (err, res) => {
  const { httpCode, message } = err;
  const statusCode = httpCode || 500;
  res.status(statusCode).json({
    status: 'error',
    httpCode: statusCode,
    message: statusCode === 500 ? 'internal server error' : message,
  });
};

export { APIError, handleError };
