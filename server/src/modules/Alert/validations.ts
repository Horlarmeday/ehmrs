import Joi from 'joi';

export function validateAlert(alert: Joi.ObjectSchema) {
  const schema = Joi.object({
    alert: Joi.string().required(),
    visit_id: Joi.number().required(),
  });
  return schema.validate(alert);
}
