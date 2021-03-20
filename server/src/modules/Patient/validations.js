import Joi from 'joi';

export function validateCashPatient(patient) {
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
    relationship: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    photo: Joi.string().required(),
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
  });
  return schema.validate(patient);
}

export function validateHealthInsurancePatient(patient) {
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
    relationship: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    photo: Joi.string().required(),
    religion: Joi.string().required(),
    marital_status: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    insurance_id: Joi.number().required(),
    hmo_id: Joi.number().required(),
    enrollee_code: Joi.string().required(),
    phone: Joi.string()
      .min(11)
      .max(11)
      .required(),
    organization: Joi.string()
      .optional()
      .allow(''),
    plan: Joi.string().required(),
    alt_phone: Joi.string()
      .optional()
      .allow(''),
    dependants: Joi.array()
      .items(
        Joi.object({
          firstname: Joi.string().required(),
          lastname: Joi.string().required(),
          gender: Joi.string().required(),
          date_of_birth: Joi.date().required(),
          relationship: Joi.string().required(),
          photo: Joi.string().required(),
          insurance_id: Joi.number().required(),
          hmo_id: Joi.number().required(),
          enrollee_code: Joi.string().required(),
          plan: Joi.string().required(),
          phone: Joi.string().required(),
          address: Joi.string().required(),
        })
      )
      .optional(),
  });
  return schema.validate(patient);
}

export function validateOrdinaryPatient(patient) {
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
    country: Joi.string().required(),
    state: Joi.string().required(),
    lga: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    marital_status: Joi.string().required(),
    religion: Joi.string().required(),
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
    insurance_id: Joi.number().required(),
    relationship: Joi.string().required(),
    photo: Joi.string().required(),
    hmo_id: Joi.number().required(),
    plan: Joi.string().required(),
    enrollee_code: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
  });
  return schema.validate(dependant);
}
