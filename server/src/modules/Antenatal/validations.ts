import Joi from 'joi';

export function validateCreateAntenatal(req: any) {
  const schema = Joi.object({
    patient_id: Joi.number().required(),
    service_id: Joi.number()
      .allow('')
      .optional(),
  });
  return schema.validate(req);
}

export function validateUpdateAntenatalAccount(req: any) {
  const schema = Joi.object({
    gravida: Joi.string().required(),
    parity: Joi.string().required(),
    last_menses_period: Joi.date().required(),
    fetal_age: Joi.string().required(),
    estimated_concept_time: Joi.date().required(),
    estimated_delivery_date: Joi.date().required(),
    obstetric_history: Joi.string().required(),
    surgical_history: Joi.string().required(),
    medical_history: Joi.string().required(),
    family_history: Joi.array()
      .allow('')
      .optional(),
    blood_transfusion_history: Joi.string().required(),
    for_whom: Joi.string()
      .allow('')
      .optional(),
    pregnancies: Joi.array()
      .items(
        Joi.object({
          year: Joi.string().required(),
          delivery_place: Joi.string().required(),
          maturity: Joi.string().required(),
          duration: Joi.string().required(),
          delivery_type: Joi.string().required(),
          weight: Joi.number().required(),
          sex: Joi.string().required(),
          fate: Joi.string().required(),
          baby_type: Joi.string().required(),
          puerperium: Joi.string().required(),
        })
      )
      .optional(),
  });
  return schema.validate(req);
}

export function validateCreateAntenatalTriage(req: any) {
  const schema = Joi.object({
    height: Joi.number()
      .allow('')
      .optional(),
    weight: Joi.number()
      .allow('')
      .optional(),
    body_mass_index: Joi.string()
      .allow('')
      .optional(),
    urinalysis_glucose: Joi.string()
      .allow('')
      .optional(),
    urinalysis_protein: Joi.string()
      .allow('')
      .optional(),
    pallor: Joi.string()
      .allow('')
      .optional(),
    blood_pressure: Joi.string()
      .allow('')
      .optional(),
    maturity: Joi.string()
      .allow('')
      .optional(),
    oedema: Joi.string()
      .allow('')
      .optional(),
    presentation: Joi.string()
      .allow('')
      .optional(),
    foetal_heart_rate: Joi.string()
      .allow('')
      .optional(),
    fundal_height: Joi.string()
      .allow('')
      .optional(),
    comments: Joi.string()
      .allow('')
      .optional(),
    rvst: Joi.string()
      .allow('')
      .optional(),
    next_appointment_date: Joi.string()
      .allow('')
      .optional(),
    visit_id: Joi.number().required(),
  });
  return schema.validate(req);
}

export function validateCreateClinicalNote(req: any) {
  const schema = Joi.object({
    notes: Joi.string().required(),
    visit_id: Joi.number().required(),
  });
  return schema.validate(req);
}

export function validateCreateObservation(req: any) {
  const schema = Joi.object({
    mother_condition: Joi.string().required(),
    foetal_condition: Joi.string().required(),
    doctor_comments: Joi.string().required(),
    continuation_sheet: Joi.string().required(),
    ante_natal_id: Joi.number().required(),
    diagnosis: Joi.array()
      .items(
        Joi.object({
          certainty: Joi.string().required(),
          type: Joi.string().valid('ICD10', 'ICPC2'),
          diagnosis_id: Joi.number().required(),
          notes: Joi.string()
            .allow('')
            .optional(),
        })
      )
      .required(),
  });
  return schema.validate(req);
}
