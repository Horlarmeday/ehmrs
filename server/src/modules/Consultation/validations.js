import Joi from 'joi';

export function validateObservation(observation) {
  const schema = Joi.object({
    complaint_note: Joi.string()
      .allow('')
      .optional(),
    history_note: Joi.string()
      .allow('')
      .optional(),
    examination_note: Joi.string()
      .allow('')
      .optional(),
    has_smoking_history: Joi.boolean()
      .allow('')
      .optional(),
    complaints: Joi.array()
      .items(
        Joi.object({
          complaint: Joi.string().required(),
          frequency: Joi.string().required(),
          frequency_number: Joi.number().required(),
          notes: Joi.string()
            .allow('')
            .optional(),
        })
      )
      .required(),
  });
  return schema.validate(observation);
}

export function validateDiagnosis(diagnosis) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    certainty: Joi.string().required(),
    order: Joi.string().required(),
    notes: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(diagnosis);
}
