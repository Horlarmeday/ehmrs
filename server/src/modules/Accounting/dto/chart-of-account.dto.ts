import Joi from 'joi';

export interface CreateChartOfAccountDto {
  code: string;
  name: string;
  type: string;
  parent_id?: number | null;
  description?: string;
  is_active?: boolean;
  balance?: number;
  tax_code?: string;
  budget_allocation?: number;
  allow_manual_entries?: boolean;
}

export interface UpdateChartOfAccountDto {
  code?: string;
  name?: string;
  type?: string;
  parent_id?: number | null;
  description?: string;
  is_active?: boolean;
  balance?: number;
  tax_code?: string;
  budget_allocation?: number;
  allow_manual_entries?: boolean;
}

export interface ChartOfAccountFilters {
  search?: string;
  type?: string;
  status?: string;
  level?: string;
  page?: number;
  limit?: number;
}

// Validation schemas
export const createChartOfAccountSchema = Joi.object({
  code: Joi.string()
    .required()
    .max(50)
    .messages({
      'string.empty': 'Account code is required',
      'string.max': 'Account code cannot exceed 50 characters',
    }),
  name: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.empty': 'Account name is required',
      'string.max': 'Account name cannot exceed 100 characters',
    }),
  type: Joi.string()
    .required()
    .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')
    .messages({
      'string.empty': 'Account type is required',
      'any.only': 'Account type must be one of: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE',
    }),
  parent_id: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Parent ID must be a number',
      'number.integer': 'Parent ID must be an integer',
      'number.min': 'Parent ID must be greater than 0',
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  is_active: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'is_active must be a boolean',
    }),
  balance: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Balance must be a number',
      'number.min': 'Balance cannot be negative',
    }),
  tax_code: Joi.string()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Tax code cannot exceed 20 characters',
    }),
  budget_allocation: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Budget allocation must be a number',
      'number.min': 'Budget allocation cannot be negative',
    }),
  allow_manual_entries: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'allow_manual_entries must be a boolean',
    }),
});

export const updateChartOfAccountSchema = Joi.object({
  code: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Account code cannot exceed 50 characters',
    }),
  name: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Account name cannot exceed 100 characters',
    }),
  type: Joi.string()
    .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')
    .optional()
    .messages({
      'any.only': 'Account type must be one of: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE',
    }),
  parent_id: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Parent ID must be a number',
      'number.integer': 'Parent ID must be an integer',
      'number.min': 'Parent ID must be greater than 0',
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_active must be a boolean',
    }),
  balance: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Balance must be a number',
      'number.min': 'Balance cannot be negative',
    }),
  tax_code: Joi.string()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Tax code cannot exceed 20 characters',
    }),
  budget_allocation: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Budget allocation must be a number',
      'number.min': 'Budget allocation cannot be negative',
    }),
  allow_manual_entries: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'allow_manual_entries must be a boolean',
    }),
  id: Joi.number()
    .optional()
    .allow(''),
  createdAt: Joi.date()
    .optional()
    .allow(''),
  updatedAt: Joi.date()
    .optional()
    .allow(''),
  parent: Joi.any()
    .allow(null)
    .optional()
    .allow(''),
  children: Joi.any()
    .allow(null)
    .optional()
    .allow(''),
});

export const chartOfAccountFiltersSchema = Joi.object({
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  type: Joi.string()
    .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'REVENUE')
    .optional()
    .messages({
      'any.only': 'Account type must be one of: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE, REVENUE',
    }),
  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_active must be a boolean',
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be greater than 0',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(70)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be greater than 0',
      'number.max': 'Limit cannot exceed 100',
    }),
});
