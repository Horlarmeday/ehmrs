import Joi from 'joi';

export function validateGenericDrug(drug) {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
  });
  return schema.validate(drug);
}

export function validateDosageForm(dosage) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });
  return schema.validate(dosage);
}

export function validateMeasurement(measurement) {
  const schema = Joi.object({
    name: Joi.string().required(),
    dosage_form_id: Joi.number().required(),
  });
  return schema.validate(measurement);
}

export function validateRouteOfAdministration(route) {
  const schema = Joi.object({
    name: Joi.string().required(),
    dosage_form_id: Joi.number().required(),
  });
  return schema.validate(route);
}
