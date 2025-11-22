import Joi from 'joi';

export function validateTriage(triage) {
  const schema = Joi.object({
    height: Joi.number()
      .optional()
      .min(30)
      .max(250)
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
    fbc: Joi.string()
      .optional()
      .allow(''),
    rbs: Joi.string()
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
