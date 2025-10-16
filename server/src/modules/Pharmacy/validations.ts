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
    dosage_form_id: Joi.number().optional(), // Backward compatibility
    dosage_form_ids: Joi.array()
      .items(Joi.number())
      .min(1)
      .optional(),
  }).custom((value, helpers) => {
    // Ensure at least one of dosage_form_id or dosage_form_ids is provided
    if (!value.dosage_form_id && (!value.dosage_form_ids || value.dosage_form_ids.length === 0)) {
      return helpers.error('any.required', {
        message: 'Either dosage_form_id or dosage_form_ids is required',
      });
    }
    return value;
  });
  return schema.validate(measurement);
}

export function validateRouteOfAdministration(route) {
  const schema = Joi.object({
    name: Joi.string().required(),
    // Support both new array format and old single ID format for backward compatibility
    dosage_form_ids: Joi.array()
      .items(Joi.number())
      .min(1)
      .optional(),
    dosage_form_id: Joi.number().optional(),
  }).custom((value, helpers) => {
    // Ensure at least one of dosage_form_ids or dosage_form_id is provided
    if (!value.dosage_form_ids && !value.dosage_form_id) {
      return helpers.error('any.required', {
        message: 'Either dosage_form_ids or dosage_form_id is required',
      });
    }
    return value;
  });
  return schema.validate(route);
}

export function validateDispenseDrug(drug) {
  const schema = Joi.object({
    prescription_id: Joi.number(),
    additional_item_id: Joi.number(),
    quantity_to_dispense: Joi.number().required(),
    collected_by: Joi.string().required(),
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
