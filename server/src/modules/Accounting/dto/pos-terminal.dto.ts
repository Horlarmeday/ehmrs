import Joi from 'joi';

// ===== POS TERMINAL DTOs =====

export interface CreatePOSTerminalDto {
  terminal_id: string;
  bank_account_id: number;
  location: string;
  terminal_type: 'MOBILE' | 'FIXED' | 'KIOSK';
  merchant_name?: string;
  merchant_id?: string;
  daily_transaction_limit?: number;
  daily_amount_limit?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePOSTerminalDto {
  terminal_id?: string;
  bank_account_id?: number;
  location?: string;
  terminal_type?: 'MOBILE' | 'FIXED' | 'KIOSK';
  merchant_name?: string;
  merchant_id?: string;
  daily_transaction_limit?: number;
  daily_amount_limit?: number;
  description?: string;
  is_active?: boolean;
}

export interface POSTerminalFilters {
  terminal_id?: string;
  bank_account_id?: number;
  location?: string;
  terminal_type?: 'MOBILE' | 'FIXED' | 'KIOSK';
  is_active?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface POSTerminalResponse {
  id: number;
  terminal_id: string;
  bank_account_id: number;
  location: string;
  terminal_type: 'MOBILE' | 'FIXED' | 'KIOSK';
  is_active: boolean;
  merchant_name?: string;
  merchant_id?: string;
  daily_transaction_limit?: number;
  daily_amount_limit?: number;
  description?: string;
  last_used_at?: Date;
  display_name: string;
  status_display: string;
  terminal_type_display: string;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
  bankAccount?: {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
  };
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

export const createPOSTerminalSchema = Joi.object({
  terminal_id: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Terminal ID is required',
      'string.min': 'Terminal ID must be at least 3 characters long',
      'string.max': 'Terminal ID cannot exceed 50 characters',
      'any.required': 'Terminal ID is required',
    }),

  bank_account_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank account ID must be a number',
      'number.integer': 'Bank account ID must be an integer',
      'number.positive': 'Bank account ID must be positive',
      'any.required': 'Bank account ID is required',
    }),

  location: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Location is required',
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 100 characters',
      'any.required': 'Location is required',
    }),

  terminal_type: Joi.string()
    .valid('MOBILE', 'FIXED', 'KIOSK')
    .required()
    .messages({
      'any.only': 'Invalid terminal type',
      'any.required': 'Terminal type is required',
    }),

  merchant_name: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Merchant name cannot exceed 100 characters',
    }),

  merchant_id: Joi.string()
    .max(20)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Merchant ID cannot exceed 20 characters',
    }),

  daily_transaction_limit: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Daily transaction limit must be greater than or equal to 0',
      'number.precision': 'Daily transaction limit can have maximum 2 decimal places',
    }),

  daily_amount_limit: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Daily amount limit must be greater than or equal to 0',
      'number.precision': 'Daily amount limit can have maximum 2 decimal places',
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

export const updatePOSTerminalSchema = Joi.object({
  terminal_id: Joi.string()
    .min(3)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Terminal ID cannot be empty',
      'string.min': 'Terminal ID must be at least 3 characters long',
      'string.max': 'Terminal ID cannot exceed 50 characters',
    }),

  bank_account_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Bank account ID must be a number',
      'number.integer': 'Bank account ID must be an integer',
      'number.positive': 'Bank account ID must be positive',
    }),

  location: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Location cannot be empty',
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 100 characters',
    }),

  terminal_type: Joi.string()
    .valid('MOBILE', 'FIXED', 'KIOSK')
    .optional()
    .messages({
      'any.only': 'Invalid terminal type',
    }),

  merchant_name: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Merchant name cannot exceed 100 characters',
    }),

  merchant_id: Joi.string()
    .max(20)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Merchant ID cannot exceed 20 characters',
    }),

  daily_transaction_limit: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'Daily transaction limit must be greater than or equal to 0',
      'number.precision': 'Daily transaction limit can have maximum 2 decimal places',
    }),

  daily_amount_limit: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'Daily amount limit must be greater than or equal to 0',
      'number.precision': 'Daily amount limit can have maximum 2 decimal places',
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

export const posTerminalFiltersSchema = Joi.object({
  terminal_id: Joi.string()
    .optional()
    .allow('', null)
    .messages({
      'string.base': 'Terminal ID filter must be a string',
    }),

  bank_account_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('', null)
    .messages({
      'number.base': 'Bank account ID filter must be a number',
      'number.integer': 'Bank account ID filter must be an integer',
      'number.positive': 'Bank account ID filter must be positive',
    }),

  location: Joi.string()
    .optional()
    .allow('', null)
    .messages({
      'string.base': 'Location filter must be a string',
    }),

  terminal_type: Joi.string()
    .valid('MOBILE', 'FIXED', 'KIOSK')
    .optional()
    .allow('', null)
    .messages({
      'any.only': 'Invalid terminal type filter',
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
});
