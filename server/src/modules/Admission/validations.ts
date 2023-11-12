import Joi from 'joi';

export function validateAdmission(admission) {
  const schema = Joi.object({
    ward_id: Joi.number().required(),
    bed_id: Joi.number().required(),
    visit_id: Joi.number().required(),
    ante_natal_id: Joi.number()
      .optional()
      .allow(''),
    comment: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(admission);
}
