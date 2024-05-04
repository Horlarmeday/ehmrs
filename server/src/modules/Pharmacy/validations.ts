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

export function validateDispenseDrug(drug) {
  const schema = Joi.object({
    prescription_id: Joi.number(),
    additional_item_id: Joi.number(),
    quantity_to_dispense: Joi.number().required(),
  }).xor('prescription_id', 'additional_item_id');
  return schema.validate(drug);
}

export function validateReturnDrug(drug) {
  const schema = Joi.object({
    prescription_id: Joi.number(),
    additional_item_id: Joi.number(),
    quantity_to_return: Joi.number().required(),
    reason_for_return: Joi.string().required(),
  }).xor('prescription_id', 'additional_item_id');
  return schema.validate(drug);
}
