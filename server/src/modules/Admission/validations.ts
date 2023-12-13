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

export function validateObservation(observation) {
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
    temperature: Joi.string().required(),
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
    comment: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(observation);
}

export function validateCarePlan(carePlan) {
  const schema = Joi.object({
    evaluation: Joi.string()
      .allow('')
      .optional(),
    scientific_principle: Joi.string()
      .allow('')
      .optional(),
    nursing_action: Joi.string()
      .allow('')
      .optional(),
    nursing_objective: Joi.string()
      .optional()
      .allow(''),
    nursing_diagnosis: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(carePlan);
}

export function validateIOChart(iochart) {
  const schema = Joi.array()
    .items(
      Joi.object({
        input_item: Joi.string().required(),
        input_quantity: Joi.number().required(),
        output_item: Joi.string().required(),
        output_quantity: Joi.number().required(),
        input_total: Joi.number().required(),
        output_total: Joi.number().required(),
      })
    )
    .required();

  return schema.validate(iochart);
}

export function validateNursingNote(note) {
  const schema = Joi.object({
    type_of_duty: Joi.string().required(),
    notes: Joi.string().required(),
  });
  return schema.validate(note);
}
