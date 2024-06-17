import Joi from 'joi';
import { ExportDataType } from './types/pharmacy-item.types';

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
    measurement_id: Joi.number()
      .optional()
      .allow(null),
    dosage_form_id: Joi.number()
      .optional()
      .allow(null),
    voucher: Joi.string()
      .allow('')
      .optional(),
    batch: Joi.string()
      .allow('')
      .optional(),
    strength_input: Joi.string()
      .optional()
      .allow(''),
    route_id: Joi.number()
      .allow(null)
      .optional(),
    date_received: Joi.date()
      .optional()
      .allow(''),
    expiration: Joi.date()
      .optional()
      .allow(''),
    brand: Joi.string()
      .optional()
      .allow(''),
    quantity_received: Joi.number().required(),
    unit_id: Joi.number().required(),
    unit_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    drug_form: Joi.string().required(),
    nhis_selling_price: Joi.number()
      .optional()
      .allow(''),
    private_selling_price: Joi.number()
      .optional()
      .allow(''),
    drug_id: Joi.number().required(),
    create_cash_item: Joi.boolean().required(),
    create_nhis_item: Joi.boolean().required(),
    create_private_item: Joi.boolean().required(),
  });
  return schema.validate(item);
}

export function validateLaboratoryItem(item) {
  const schema = Joi.object({
    product_code: Joi.string()
      .allow('')
      .optional(),
    shelf: Joi.string()
      .allow('')
      .optional(),
    voucher: Joi.string()
      .allow('')
      .optional(),
    batch: Joi.string()
      .allow('')
      .optional(),
    date_received: Joi.date()
      .optional()
      .allow(''),
    expiration: Joi.date()
      .optional()
      .allow(''),
    quantity: Joi.number().required(),
    name: Joi.string().required(),
    unit_id: Joi.number().required(),
    unit_price: Joi.number().required(),
  });
  return schema.validate(item);
}

export const validateDispenseItems = items => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        receiver: Joi.number().required(),
        quantity_to_dispense: Joi.number().required(),
        dispensary: Joi.number().required(),
        drug_name: Joi.string().required(),
        unit_id: Joi.number().required(),
      })
    ),
  });
  return schema.validate(items);
};

export const validateReorderItems = items => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        selling_price: Joi.number().required(),
        unit_price: Joi.number().required(),
        quantity_received: Joi.number().required(),
        voucher: Joi.string().required(),
        batch: Joi.string().required(),
        expiration: Joi.date().required(),
        date_received: Joi.date().required(),
      })
    ),
  });
  return schema.validate(items);
};

export const validateExportedData = items => {
  const schema = Joi.object({
    selectedItemsId: Joi.array()
      .items()
      .required(),
    dataType: Joi.string()
      .valid(ExportDataType.CSV, ExportDataType.PDF, ExportDataType.EXCEL)
      .required(),
  });
  return schema.validate(items);
};
