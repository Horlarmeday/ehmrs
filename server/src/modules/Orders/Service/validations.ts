import Joi from 'joi';

export function validateBulkService(services) {
  const schema = Joi.object({
    services: Joi.array()
      .items(
        Joi.object({
          service_id: Joi.number().required(),
          service_type: Joi.string().required(),
          price: Joi.number().required(),
          is_urgent: Joi.boolean().required(),
        })
      )
      .required(),
  });

  return schema.validate(services);
}
