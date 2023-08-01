import Joi from 'joi';

export function validateAdmission(admission) {
  const schema = Joi.object({
    ward_id: Joi.number().required(),
    bed_id: Joi.number().required(),
    visit_id: Joi.number().required(),
    comment: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(admission);
}
