import Joi from 'joi';

export function validateSurgery(surgery) {
  const schema = Joi.object({
    service_id: Joi.number().required(),
    visit_id: Joi.number().required(),
    notes: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(surgery);
}
