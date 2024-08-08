import Joi from 'joi';

export function validateAdmission(admission) {
  const schema = Joi.object({
    ward_id: Joi.number().required(),
    bed_id: Joi.number()
      .allow('')
      .optional(),
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

export function validateChangeWard(ward) {
  const schema = Joi.object({
    ward_id: Joi.number().required(),
    bed_id: Joi.number().required(),
  });
  return schema.validate(ward);
}

export function validateDischargePatient(discharge) {
  const schema = Joi.object({
    discharge_type: Joi.string().required(),
    date_discharged: Joi.date().required(),
    conditions_of_patient: Joi.string().required(),
    transfer_location: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(discharge);
}

export function validateWardRound(wardRound) {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  return schema.validate(wardRound);
}

export function validateCreateDeliveryInfo(req: any) {
  const schema = Joi.object({
    mode_of_delivery: Joi.string().required(),
    date_of_delivery: Joi.date().required(),
    blood_loss_quantity: Joi.string()
      .allow('')
      .optional(),
    duration: Joi.string().required(),
    condition_of_mother: Joi.string().required(),
    condition_of_baby: Joi.string().required(),
    sex: Joi.string().required(),
    apgar_one_min: Joi.string()
      .allow('')
      .optional(),
    apgar_five_min: Joi.string()
      .allow('')
      .optional(),
    apgar_ten_min: Joi.string()
      .allow('')
      .optional(),
    baby_immunization_date: Joi.date()
      .allow('')
      .optional(),
    bcg: Joi.string()
      .allow('')
      .optional(),
    opvo: Joi.string()
      .allow('')
      .optional(),
    hbv: Joi.string()
      .allow('')
      .optional(),
    nature_of_liquor: Joi.string()
      .allow('')
      .optional(),
    nevirapine: Joi.string()
      .allow('')
      .optional(),
    vitaminA_IU: Joi.string()
      .allow('')
      .optional(),
    birth_weight: Joi.string()
      .allow('')
      .optional(),
    time_surgery_ended: Joi.date()
      .allow('')
      .optional(),
    comments: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(req);
}

export function validatePostnatalInfo(req: any) {
  const schema = Joi.object({
    temperature: Joi.string().required(),
    weight: Joi.number().required(),
    pulse: Joi.string()
      .allow('')
      .optional(),
    blood_pressure: Joi.string().required(),
    respiration: Joi.string()
      .allow('')
      .optional(),
    lochia: Joi.string()
      .allow('')
      .optional(),
    feeding: Joi.string()
      .allow('')
      .optional(),
    baby_condition: Joi.string().required(),
    general_condition: Joi.string()
      .allow('')
      .optional(),
    involution_of_uterus: Joi.string()
      .allow('')
      .optional(),
    episotomy: Joi.string()
      .allow('')
      .optional(),
    result: Joi.string()
      .allow('')
      .optional(),
    pcv: Joi.string()
      .allow('')
      .optional(),
    reflexes: Joi.string()
      .allow('')
      .optional(),
    umbilical_cord: Joi.string()
      .allow('')
      .optional(),
    pap_smear_date: Joi.date()
      .allow('')
      .optional(),
    pelvic_examination: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(req);
}
