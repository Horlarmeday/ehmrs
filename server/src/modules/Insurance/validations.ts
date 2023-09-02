import Joi from 'joi';

export function validateInsurance(insurance) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(insurance);
}

export function validateHMO(hmo) {
  const schema = Joi.object({
    name: Joi.string().required(),
    insurance_id: Joi.number().required(),
    hmo_num: Joi.string()
      .optional()
      .allow(''),
  });
  return schema.validate(hmo);
}

export function validateSetInsuranceDefault(insurance) {
  const schema = Joi.object({
    insurance_id: Joi.number().required(),
  });
  return schema.validate(insurance);
}
