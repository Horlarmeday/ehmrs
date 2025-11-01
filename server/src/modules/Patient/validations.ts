import Joi from 'joi';

export function validateCreatePatientAccount(patient) {
  const schema = Joi.object({
    firstname: Joi.string()
      .min(3)
      .required(),
    lastname: Joi.string()
      .min(3)
      .required(),
    middlename: Joi.string()
      .min(3)
      .optional()
      .allow(''),
    email: Joi.string()
      .min(5)
      .max(255)
      .optional()
      .allow(''),
    occupation: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    next_of_kin_name: Joi.string().required(),
    next_of_kin_phone: Joi.string().required(),
    next_of_kin_address: Joi.string().required(),
    next_of_kin_relationship: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    photo: Joi.string()
      .optional()
      .allow(''),
    religion: Joi.string().required(),
    marital_status: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
    alt_phone: Joi.string()
      .optional()
      .allow(''),
    registration_fee: Joi.number()
      .optional()
      .allow(''),
    service_id: Joi.number()
      .optional()
      .allow(''),
  });
  return schema.validate(patient);
}

export function validatePatientHealthInsurance(patient) {
  const schema = Joi.object({
    insurance_id: Joi.number().required(),
    hmo_id: Joi.number().required(),
    enrollee_code: Joi.string().required(),
    organization: Joi.string()
      .optional()
      .allow(''),
    plan: Joi.string().required(),
    dependants: Joi.array()
      .items(
        Joi.object({
          firstname: Joi.string().required(),
          lastname: Joi.string().required(),
          gender: Joi.string().required(),
          date_of_birth: Joi.date().required(),
          relationship_to_principal: Joi.string().required(),
          photo: Joi.string()
            .optional()
            .allow(''),
          insurance_id: Joi.number().required(),
          hmo_id: Joi.number().required(),
          enrollee_code: Joi.string().required(),
          plan: Joi.string().required(),
          phone: Joi.string().required(),
          address: Joi.string().required(),
          country: Joi.string().required(),
          state: Joi.string().required(),
          lga: Joi.string().required(),
        })
      )
      .optional(),
  });
  return schema.validate(patient);
}

export function validateCreateEmergencyPatient(patient) {
  const schema = Joi.object({
    firstname: Joi.string()
      .min(3)
      .required(),
    lastname: Joi.string()
      .min(3)
      .required(),
    middlename: Joi.string()
      .min(3)
      .optional()
      .allow(''),
    email: Joi.string()
      .min(5)
      .max(255)
      .optional()
      .allow(''),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    country: Joi.string()
      .optional()
      .allow(''),
    state: Joi.string()
      .optional()
      .allow(''),
    lga: Joi.string()
      .optional()
      .allow(''),
    date_of_birth: Joi.date().required(),
    marital_status: Joi.string()
      .optional()
      .allow(''),
    religion: Joi.string()
      .optional()
      .allow(''),
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
  });
  return schema.validate(patient);
}

export function validateDependant(dependant) {
  const schema = Joi.object({
    firstname: Joi.string().required(),
    gender: Joi.string().required(),
    lastname: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    relationship_to_principal: Joi.string().required(),
    photo: Joi.string()
      .optional()
      .allow(''),
    enrollee_code: Joi.string()
      .optional()
      .allow(''),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
  });
  return schema.validate(dependant);
}

export function validateFindPatient(patient) {
  const schema = Joi.object({
    firstname: Joi.string().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(patient);
}

export function validateUpdatePatientInsurance(insurance) {
  const schema = Joi.object({
    patient_insurance_id: Joi.number().required(),
    insurance_id: Joi.number().required(),
    organization: Joi.string()
      .optional()
      .allow(null),
    hmo_id: Joi.number().required(),
    enrollee_code: Joi.string()
      .optional()
      .allow(null),
    plan: Joi.string()
      .optional()
      .allow(null),
  });
  return schema.validate(insurance);
}

export function validateTogglePatientInsurance(insurance) {
  const schema = Joi.object({
    has_insurance: Joi.boolean().required(),
  });
  return schema.validate(insurance);
}

export function validatePatientAccountsMerge(patient) {
  const schema = Joi.object({
    sourcePatientIds: Joi.array()
      .items(Joi.number())
      .required(),
    targetPatientId: Joi.number().required(),
  });
  return schema.validate(patient);
}

export function validateMarkPatientAsDeceased(data) {
  const schema = Joi.object({
    date_of_death: Joi.date().required(),
    cause_of_death: Joi.string()
      .optional()
      .allow(''),
    death_certificate_number: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(data);
}

export function validateRevivePatient(data) {
  const schema = Joi.object({
    revival_reason: Joi.string().required(),
  });
  return schema.validate(data);
}

export function validateTransferDependants(data) {
  const schema = Joi.object({
    deceased_principal_id: Joi.number()
      .integer()
      .required(),
    new_principal_id: Joi.number()
      .integer()
      .required(),
  });
  return schema.validate(data);
}
