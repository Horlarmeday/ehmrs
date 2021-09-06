import BaseError from './base-error';

class BadException extends BaseError {
  constructor(name: string, httpCode: number, message = 'internal server error') {
    super(name, httpCode, message);
  }
}

export { BadException };
