import Joi from 'joi';

export function validateDrugPrescription(drug) {
  const schema = Joi.object({});

  return schema.validate(drug);
}
