import Joi from 'joi';

export function validateGenericDrug(drug) {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
  });
  return schema.validate(drug);
}

export function validatePharmacyItem(item) {
  const schema = Joi.object({
    product_code: Joi.string()
      .allow('')
      .optional(),
    shelf: Joi.string()
      .allow('')
      .optional(),
    strength: Joi.string()
      .optional()
      .allow(''),
    dosage_form: Joi.string()
      .optional()
      .allow(''),
    voucher: Joi.string()
      .allow('')
      .optional(),
    batch: Joi.string()
      .allow('')
      .optional(),
    strength_input: Joi.string()
      .optional()
      .allow(''),
    route: Joi.string()
      .allow('')
      .optional(),
    date_received: Joi.date()
      .optional()
      .allow(''),
    expiration: Joi.date()
      .optional()
      .allow(''),
    quantity: Joi.number().required(),
    unit_id: Joi.number().required(),
    unit_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    drug_form: Joi.string().required(),
    nhis_selling_price: Joi.number()
      .optional()
      .allow(''),
    drug_id: Joi.number().required(),
    create_cash_item: Joi.boolean().required(),
    create_nhis_item: Joi.boolean().required(),
  });
  return schema.validate(item);
}
