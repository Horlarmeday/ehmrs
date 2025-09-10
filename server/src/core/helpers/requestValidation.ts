import { Request } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

export interface ValidationError extends Error {
  status: number;
  details: any[];
}

export function validateRequest(
  req: Request,
  schema: ValidationSchema
): { error?: ValidationError } {
  const errors: any[] = [];

  // Validate params
  if (schema.params) {
    const { error } = schema.params.validate(req.params);
    if (error) {
      errors.push({
        field: 'params',
        message: error.details[0].message,
        details: error.details,
      });
    }
  }

  // Validate query
  if (schema.query) {
    const { error } = schema.query.validate(req.query);
    if (error) {
      errors.push({
        field: 'query',
        message: error.details[0].message,
        details: error.details,
      });
    }
  }

  // Validate body
  if (schema.body) {
    const { error } = schema.body.validate(req.body);
    if (error) {
      errors.push({
        field: 'body',
        message: error.details[0].message,
        details: error.details,
      });
    }
  }

  // Validate headers
  if (schema.headers) {
    const { error } = schema.headers.validate(req.headers);
    if (error) {
      errors.push({
        field: 'headers',
        message: error.details[0].message,
        details: error.details,
      });
    }
  }

  if (errors.length > 0) {
    const validationError = new Error('Validation failed') as ValidationError;
    validationError.status = 400;
    validationError.details = errors;
    return { error: validationError };
  }

  return {};
}

export default validateRequest;
