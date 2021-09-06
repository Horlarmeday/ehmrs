import Joi from 'joi';

export function validateTriage(triage) {
  const schema = Joi.object({
    rvs: Joi.string()
      .optional()
      .allow(''),
    height: Joi.number()
      .optional()
      .allow(''),
    weight: Joi.number().required(),
    bmi: Joi.number()
      .optional()
      .allow(''),
    pulse: Joi.number()
      .optional()
      .allow(''),
    respiration: Joi.string()
      .optional()
      .allow(''),
    temperature: Joi.number().required(),
    systolic: Joi.number()
      .optional()
      .allow(''),
    diastolic: Joi.number()
      .optional()
      .allow(''),
    heart_rate: Joi.number()
      .optional()
      .allow(''),
    fetal_heart_rate: Joi.number()
      .optional()
      .allow(''),
    spo2: Joi.number()
      .optional()
      .allow(''),
    muac: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(triage);
}
