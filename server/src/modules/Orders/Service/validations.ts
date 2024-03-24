import Joi from 'joi';
import { Source } from '../../../database/models/prescribedService';

export function validateBulkService(services) {
  const schema = Joi.object({
    services: Joi.array()
      .items(
        Joi.object({
          service_id: Joi.number().required(),
          service_type: Joi.string().required(),
          quantity: Joi.number()
            .allow('')
            .optional(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean()
            .allow('')
            .optional(),
          source: Joi.string()
            .valid(Source.CONSULTATION, Source.ANC, Source.THEATER)
            .required(),
          surgery_id: Joi.number()
            .allow('')
            .optional(),
          ante_natal_id: Joi.number()
            .allow('')
            .optional(),
        })
      )
      .required(),
  });

  return schema.validate(services);
}

export function validateDeleteService(req) {
  const schema = Joi.object({
    serviceId: Joi.number().required(),
  });

  return schema.validate(req);
}
