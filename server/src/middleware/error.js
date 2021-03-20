import winston from 'winston';
import { handleError } from '../util/apiError';

export default function(error, req, res, next) {
  winston.error(error.message, error);
  handleError(error, res);
}
