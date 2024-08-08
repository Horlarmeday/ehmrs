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
    pulse: Joi.string()
      .optional()
      .allow(''),
    respiration: Joi.string()
      .optional()
      .allow(''),
    temperature: Joi.alternatives(Joi.string(), Joi.number()).required(),
    systolic: Joi.string()
      .optional()
      .allow(''),
    diastolic: Joi.string()
      .optional()
      .allow(''),
    heart_rate: Joi.string()
      .optional()
      .allow(''),
    spo2: Joi.string()
      .optional()
      .allow(''),
    muac: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(triage);
}

export function validateFetchTriage(req) {
  const schema = Joi.object({
    patientId: Joi.number().required(),
  });
  return schema.validate(req);
}
