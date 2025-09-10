import Joi from 'joi';
import { BankAccountType } from '../enums';

// ===== BANK ACCOUNT DTOs =====

export interface CreateBankAccountDto {
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: BankAccountType;
  current_balance?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateBankAccountDto {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  account_type?: BankAccountType;
  current_balance?: number;
  description?: string;
  is_active?: boolean;
}

export interface BankAccountFilters {
  bank_name?: string;
  account_type?: BankAccountType;
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BankAccountResponse {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: BankAccountType;
  current_balance: number;
  is_active: boolean;
  description?: string;
  display_name: string;
  status_display: string;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
  createdByStaff?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  updatedByStaff?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

// ===== VALIDATION SCHEMAS =====

export const createBankAccountSchema = Joi.object({
  bank_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Bank name is required',
      'string.min': 'Bank name must be at least 2 characters long',
      'string.max': 'Bank name cannot exceed 100 characters',
      'any.required': 'Bank name is required',
    }),

  account_number: Joi.string()
    .min(5)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Account number is required',
      'string.min': 'Account number must be at least 5 characters long',
      'string.max': 'Account number cannot exceed 20 characters',
      'any.required': 'Account number is required',
    }),

  account_name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Account name is required',
      'string.min': 'Account name must be at least 2 characters long',
      'string.max': 'Account name cannot exceed 100 characters',
      'any.required': 'Account name is required',
    }),

  account_type: Joi.string()
    .valid(...Object.values(BankAccountType))
    .required()
    .messages({
      'any.only': 'Invalid account type',
      'any.required': 'Account type is required',
    }),

  current_balance: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Current balance must be greater than or equal to 0',
      'number.precision': 'Current balance can have maximum 2 decimal places',
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),

  is_active: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Is active must be a boolean value',
    }),
});

export const updateBankAccountSchema = Joi.object({
  bank_name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Bank name cannot be empty',
      'string.min': 'Bank name must be at least 2 characters long',
      'string.max': 'Bank name cannot exceed 100 characters',
    }),

  account_number: Joi.string()
    .min(5)
    .max(20)
    .optional()
    .messages({
      'string.empty': 'Account number cannot be empty',
      'string.min': 'Account number must be at least 5 characters long',
      'string.max': 'Account number cannot exceed 20 characters',
    }),

  account_name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Account name cannot be empty',
      'string.min': 'Account name must be at least 2 characters long',
      'string.max': 'Account name cannot exceed 100 characters',
    }),

  account_type: Joi.string()
    .valid(...Object.values(BankAccountType))
    .optional()
    .messages({
      'any.only': 'Invalid account type',
    }),

  current_balance: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'Current balance must be greater than or equal to 0',
      'number.precision': 'Current balance can have maximum 2 decimal places',
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),

  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Is active must be a boolean value',
    }),
});

export const bankAccountFiltersSchema = Joi.object({
  bank_name: Joi.string()
    .optional()
    .allow('', null)
    .messages({
      'string.base': 'Bank name filter must be a string',
    }),

  account_type: Joi.string()
    .valid(...Object.values(BankAccountType))
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Invalid account type filter',
    }),

  is_active: Joi.boolean()
    .optional()
    .allow('', null)
    .messages({
      'boolean.base': 'Is active filter must be a boolean value',
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  search: Joi.string()
    .optional()
    .allow('', null)
    .messages({
      'string.base': 'Search term must be a string',
    }),

  sort: Joi.string()
    .valid(
      'bank_name',
      'account_number',
      'account_name',
      'current_balance',
      'createdAt',
      'updatedAt'
    )
    .optional()
    .default('bank_name')
    .messages({
      'any.only': 'Invalid sort field',
    }),

  order: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('asc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
});
