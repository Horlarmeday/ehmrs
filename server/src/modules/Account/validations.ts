import Joi from 'joi';
import { ServiceName } from '../../database/models/paymentHistory';

export function validatePaymentHistory(payment) {
  const schema = Joi.object({
    mode_of_payment: Joi.string().required(),
    type: Joi.string().required(),
    serviceType: Joi.string().required(),
    notes: Joi.string()
      .optional()
      .allow(''),
    selectedItems: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().required(),
          price: Joi.number().required(),
        })
      )
      .required(),
  });
  return schema.validate(payment);
}

export function validateChartOfAccount(data) {
  const schema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string()
      .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')
      .required(),
    parent_id: Joi.number().optional(),
    description: Joi.string().optional(),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
}

export function validateUpdateChartOfAccount(data) {
  const schema = Joi.object({
    id: Joi.number().required(),
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    type: Joi.string()
      .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')
      .optional(),
    parent_id: Joi.number().optional(),
    description: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
  });
  return schema.validate(data);
}

export function validateJournalEntry(data) {
  const schema = Joi.object({
    transaction_date: Joi.date().required(),
    reference: Joi.string().required(),
    description: Joi.string().required(),
    visit_id: Joi.number().optional(),
    patient_id: Joi.number().optional(),
    lines: Joi.array()
      .items(
        Joi.object({
          account_id: Joi.number().required(),
          type: Joi.string()
            .valid('DEBIT', 'CREDIT')
            .required(),
          amount: Joi.number().required(),
          description: Joi.string().optional(),
        })
      )
      .min(2)
      .required(),
  });
  return schema.validate(data);
}

export function validateCostCenter(data) {
  const schema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    department_id: Joi.number().required(),
    description: Joi.string().optional(),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
}

export function validateUpdateCostCenter(data) {
  const schema = Joi.object({
    id: Joi.number().required(),
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    department_id: Joi.number().optional(),
    description: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
  });
  return schema.validate(data);
}

export function validateFinancialStatement(data) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    type: Joi.string()
      .valid('BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW', 'COST_CENTER')
      .required(),
    format: Joi.string()
      .valid('PDF', 'EXCEL', 'CSV', 'JSON')
      .optional(),
  });
  return schema.validate(data);
}

export function validateTrendAnalysis(data) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    interval: Joi.string()
      .valid('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')
      .required(),
    metrics: Joi.array()
      .items(Joi.string())
      .optional(),
    department_id: Joi.string().optional(),
    format: Joi.string()
      .valid('PDF', 'EXCEL', 'CSV', 'JSON')
      .optional(),
  });
  return schema.validate(data);
}

export function validateCustomReport(data) {
  const schema = Joi.object({
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    metrics: Joi.array()
      .items(Joi.string())
      .required(),
    dimensions: Joi.array()
      .items(Joi.string())
      .optional(),
    filters: Joi.array()
      .items(Joi.string())
      .optional(),
    format: Joi.string()
      .valid('PDF', 'EXCEL', 'CSV', 'JSON')
      .optional(),
  });
  return schema.validate(data);
}

export function validatePaymentReceipt(data) {
  const schema = Joi.object({
    serviceName: Joi.string()
      .valid(
        'ALL',
        ServiceName.ITEMS,
        ServiceName.SERVICES,
        ServiceName.DRUGS,
        ServiceName.TESTS,
        ServiceName.INVESTIGATIONS
      )
      .required(),
  });
  return schema.validate(data);
}
