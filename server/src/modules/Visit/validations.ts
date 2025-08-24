import Joi from 'joi';

export function validateVisit(visit: any) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    category: Joi.string().required(),
    department: Joi.string().required(),
    professional: Joi.string().required(),
    date_of_visit: Joi.date().required(),
    type: Joi.string().required(),
    service_id: Joi.alternatives()
      .try(Joi.number(), Joi.array().items(Joi.number()))
      .allow('')
      .optional(),
    // service_id: Joi.number()
    //   .optional()
    //   .allow(''),
    ante_natal_id: Joi.number()
      .allow('')
      .optional(),
    immunization_id: Joi.number()
      .allow('')
      .optional(),
    priority: Joi.string()
      .allow('')
      .optional(),
    emergency_priority: Joi.string()
      .allow('')
      .optional(),
    chief_complaint: Joi.string()
      .allow('')
      .optional(),
    initial_assessment: Joi.string()
      .allow('')
      .optional(),
    treatment_duration: Joi.string()
      .allow('')
      .optional(),
    dialysis_notes: Joi.string()
      .allow('')
      .optional(),
    dialysis_type: Joi.string()
      .allow('')
      .optional(),
    dialysis_priority: Joi.string()
      .allow('')
      .optional(),
    scheduled_time: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(visit);
}
