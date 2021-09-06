import Joi from 'joi';

export function validateVisit(visit) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    type: Joi.string().required(),
  });
  return schema.validate(visit);
}
