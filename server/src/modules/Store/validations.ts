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
    quantity_received: Joi.number()
      .min(0)
      .required(),
    unit_id: Joi.number().required(),
    unit_price: Joi.number().required(),
    selling_price: Joi.number().required(),
    drug_form: Joi.string().required(),
    vendor_id: Joi.number().required(),
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
        quantity_received: Joi.number()
          .min(0)
          .required(),
        voucher: Joi.string().required(),
        batch: Joi.string().required(),
        expiration: Joi.date().required(),
        date_received: Joi.date().required(),
        vendor_id: Joi.number().required(),
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
    selectAll: Joi.boolean(),
  });
  return schema.validate(items);
};

export const validateCreateVendor = vendor => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .allow('')
      .optional(),
    phone: Joi.string()
      .allow('')
      .optional(),
    address: Joi.string()
      .allow('')
      .optional(),
  });
  return schema.validate(vendor);
};

// Report validation schemas
export const validateReportFilters = filters => {
  const schema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    drugId: Joi.number().optional(),
    vendorId: Joi.number().optional(),
    drugType: Joi.string()
      .valid('CASH', 'NHIS', 'PRIVATE')
      .optional(),
    category: Joi.string().optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
    sortBy: Joi.string()
      .valid('date', 'quantity', 'value', 'name')
      .default('date')
      .optional(),
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
      .optional(),
  });
  return schema.validate(filters);
};

export const validateInventoryReportFilters = filters => {
  const schema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    drugId: Joi.number().optional(),
    vendorId: Joi.number().optional(),
    drugType: Joi.string()
      .valid('CASH', 'NHIS', 'PRIVATE')
      .optional(),
    movementType: Joi.string()
      .valid('IN', 'OUT', 'ADJUSTMENT')
      .optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
  });
  return schema.validate(filters);
};

export const validateDispenseReportFilters = filters => {
  const schema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    drugId: Joi.number().optional(),
    dispensaryId: Joi.number().optional(),
    receiverId: Joi.number().optional(),
    drugType: Joi.string()
      .valid('CASH', 'NHIS', 'PRIVATE')
      .optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
  });
  return schema.validate(filters);
};

export const validateExpiryReportFilters = filters => {
  const schema = Joi.object({
    daysToExpiry: Joi.number()
      .min(0)
      .max(365)
      .default(30)
      .optional(),
    drugId: Joi.number().optional(),
    vendorId: Joi.number().optional(),
    drugType: Joi.string()
      .valid('CASH', 'NHIS', 'PRIVATE')
      .optional(),
    status: Joi.string()
      .valid('EXPIRED', 'EXPIRING_SOON', 'VALID')
      .optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
  });
  return schema.validate(filters);
};

export const validateStockLevelReportFilters = filters => {
  const schema = Joi.object({
    drugId: Joi.number().optional(),
    vendorId: Joi.number().optional(),
    drugType: Joi.string()
      .valid('CASH', 'NHIS', 'PRIVATE')
      .optional(),
    stockLevel: Joi.string()
      .valid('LOW', 'MEDIUM', 'HIGH', 'OUT_OF_STOCK')
      .optional(),
    threshold: Joi.number()
      .min(0)
      .default(10)
      .optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
  });
  return schema.validate(filters);
};

export const validateVendorPerformanceReportFilters = filters => {
  const schema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    vendorId: Joi.number().optional(),
    performanceMetric: Joi.string()
      .valid('DELIVERY_TIME', 'QUALITY', 'COST', 'RELIABILITY')
      .optional(),
    limit: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .optional(),
    offset: Joi.number()
      .min(0)
      .default(0)
      .optional(),
  });
  return schema.validate(filters);
};
