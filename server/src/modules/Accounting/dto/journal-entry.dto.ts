import Joi from 'joi';
import { JournalEntryStatus } from '../enums';

export interface JournalEntryLineDto {
  account_id: number;
  debit: number;
  credit: number;
  cost_center_id?: number | null;
  description?: string;
  total?: number;
}

export interface CreateJournalEntryDto {
  transaction_date: string;
  reference: string;
  description?: string;
  visit_id?: number;
  patient_id?: number;
  status?: JournalEntryStatus;
  lines: JournalEntryLineDto[];
}

export interface UpdateJournalEntryDto {
  transaction_date?: string;
  reference?: string;
  description?: string;
  visit_id?: number;
  patient_id?: number;
  status?: JournalEntryStatus;
  lines?: JournalEntryLineDto[];
}

export interface JournalEntryFilters {
  search?: string;
  status?: JournalEntryStatus;
  dateRange?: string;
  type?: string;
  page?: number;
  limit?: number;
}

// Validation schemas
export const journalEntryLineSchema = Joi.object({
  account_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Account ID must be a number',
    'number.integer': 'Account ID must be an integer',
    'number.min': 'Account ID must be greater than 0',
    'any.required': 'Account ID is required',
  }),
  debit: Joi.number().precision(2).min(0).default(0).messages({
    'number.base': 'Debit amount must be a number',
    'number.min': 'Debit amount cannot be negative',
  }),
  credit: Joi.number().precision(2).min(0).default(0).messages({
    'number.base': 'Credit amount must be a number',
    'number.min': 'Credit amount cannot be negative',
  }),
  cost_center_id: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.base': 'Cost center ID must be a number',
    'number.integer': 'Cost center ID must be an integer',
    'number.min': 'Cost center ID must be greater than 0',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
}).custom((value, helpers) => {
  // Custom validation to ensure either debit or credit is present, but not both
  if ((value.debit || 0) > 0 && (value.credit || 0) > 0) {
    return helpers.error('any.invalid', { message: 'A line cannot have both debit and credit amounts' });
  }
  
  if ((value.debit || 0) === 0 && (value.credit || 0) === 0) {
    return helpers.error('any.invalid', { message: 'A line must have either a debit or credit amount' });
  }
  
  return value;
});

export const createJournalEntrySchema = Joi.object({
  transaction_date: Joi.string().isoDate().required().messages({
    'string.empty': 'Transaction date is required',
    'string.isoDate': 'Transaction date must be a valid date',
    'any.required': 'Transaction date is required',
  }),
  reference: Joi.string().required().max(100).messages({
    'string.empty': 'Reference is required',
    'string.max': 'Reference cannot exceed 100 characters',
    'any.required': 'Reference is required',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  visit_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Visit ID must be a number',
    'number.integer': 'Visit ID must be an integer',
    'number.min': 'Visit ID must be greater than 0',
  }),
  patient_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Patient ID must be a number',
    'number.integer': 'Patient ID must be an integer',
    'number.min': 'Patient ID must be greater than 0',
  }),
  status: Joi.string().valid(...Object.values(JournalEntryStatus)).optional().default(JournalEntryStatus.DRAFT).messages({
    'any.only': `Status must be one of: ${Object.values(JournalEntryStatus).join(', ')}`,
  }),
  lines: Joi.array().items(journalEntryLineSchema).min(2).required().messages({
    'array.min': 'At least 2 journal entry lines are required',
    'any.required': 'Journal entry lines are required',
  }),
}).custom((value, helpers) => {
  // Custom validation to ensure debits and credits are balanced
  const totalDebits = value.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
  const totalCredits = value.lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);
  
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return helpers.error('any.invalid', { message: 'Total debits must equal total credits' });
  }
  
  return value;
});

export const updateJournalEntrySchema = Joi.object({
  transaction_date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Transaction date must be a valid date',
  }),
  reference: Joi.string().max(100).optional().messages({
    'string.max': 'Reference cannot exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  visit_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Visit ID must be a number',
    'number.integer': 'Visit ID must be an integer',
    'number.min': 'Visit ID must be greater than 0',
  }),
  patient_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Patient ID must be a number',
    'number.integer': 'Patient ID must be an integer',
    'number.min': 'Visit ID must be greater than 0',
  }),
  status: Joi.string().valid(...Object.values(JournalEntryStatus)).optional().messages({
    'any.only': `Status must be one of: ${Object.values(JournalEntryStatus).join(', ')}`,
  }),
  lines: Joi.array().items(journalEntryLineSchema).min(2).optional().messages({
    'array.min': 'At least 2 journal entry lines are required',
  }),
}).custom((value, helpers) => {
  // Custom validation to ensure debits and credits are balanced if lines are provided
  if (value.lines) {
    const totalDebits = value.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredits = value.lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return helpers.error('any.invalid', { message: 'Total debits must equal total credits' });
    }
  }
  
  return value;
});

export const journalEntryFiltersSchema = Joi.object({
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Search term cannot exceed 100 characters',
  }),
  status: Joi.string().valid(...Object.values(JournalEntryStatus)).optional().messages({
    'any.only': `Status must be one of: ${Object.values(JournalEntryStatus).join(', ')}`,
  }),
  startDate: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Start date must be a valid date',
  }),
  endDate: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'End date must be a valid date',
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be greater than 0',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be greater than 0',
    'number.max': 'Limit cannot exceed 100',
  }),
});
