import Joi from "joi";

export const validateICD10Disease = (icd10Disease) => {
  const schema = Joi.object({
    diagnosis: Joi.string().required(),
    code: Joi.string().required(),
    sub_class_code: Joi.string().optional().allow(''),
    class_code: Joi.string().optional().allow(''),
  })
  return schema.validate(icd10Disease)
}

export const validateICPC2Disease = (icpc2Disease) => {
  const schema = Joi.object({
    diagnosis: Joi.string().required(),
    code: Joi.string().required(),
  })
  return schema.validate(icpc2Disease)
}