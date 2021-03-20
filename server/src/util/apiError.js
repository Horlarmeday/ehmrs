import BaseError from './baseError';

class APIError extends BaseError {
  constructor(name, httpCode, message = 'internal server error') {
    super(name, httpCode, message);
  }
}

const handleError = (err, res) => {
  const { httpCode, message } = err;
  res.status(httpCode || 500).json({
    status: 'error',
    httpCode,
    message,
  });
};

export { APIError, handleError };
