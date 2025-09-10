import Joi from 'joi';

export interface CreateFinancialPeriodDto {
  name: string;
  start_date: string;
  end_date: string;
  balance?: number;
  notes?: string;
  status?: string;
  created_by: number;
}

export interface UpdateFinancialPeriodDto {
  name?: string;
  start_date?: string;
  end_date?: string;
  balance?: number;
  notes?: string;
  status?: string;
  updated_by?: number;
}

export interface FinancialPeriodFilters {
  search?: string;
  period_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface OpenPeriodDto {
  notes?: string;
}

export interface ClosePeriodDto {
  closing_date: string;
  notes?: string;
}

// Validation schemas
export const createFinancialPeriodSchema = Joi.object({
  name: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.empty': 'Period name is required',
      'string.max': 'Period name cannot exceed 100 characters',
      'any.required': 'Period name is required',
    }),
  period_type: Joi.string()
    .valid('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')
    .optional()
    .messages({
      'any.only': 'Period type must be one of: MONTHLY, QUARTERLY, YEARLY, CUSTOM',
    }),
  start_date: Joi.string()
    .isoDate()
    .required()
    .messages({
      'string.empty': 'Start date is required',
      'string.isoDate': 'Start date must be a valid date',
      'any.required': 'Start date is required',
    }),
  end_date: Joi.string()
    .isoDate()
    .required()
    .messages({
      'string.empty': 'End date is required',
      'string.isoDate': 'End date must be a valid date',
      'any.required': 'End date is required',
    }),
  opening_balance: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Opening balance must be a number',
      'number.min': 'Opening balance cannot be negative',
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  status: Joi.string()
    .valid('DRAFT', 'OPEN', 'CLOSED', 'SUSPENDED')
    .optional()
    .default('DRAFT')
    .messages({
      'any.only': 'Status must be one of: DRAFT, OPEN, CLOSED, SUSPENDED',
    }),
  auto_close: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Auto close must be a boolean value',
    }),
}).custom((value, helpers) => {
  // Custom validation to ensure end_date is after start_date
  const startDate = new Date(value.start_date);
  const endDate = new Date(value.end_date);

  if (endDate <= startDate) {
    return helpers.error('any.invalid', { message: 'End date must be after start date' });
  }

  return value;
});

export const updateFinancialPeriodSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Period name cannot exceed 100 characters',
    }),
  period_type: Joi.string()
    .valid('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')
    .optional()
    .messages({
      'any.only': 'Period type must be one of: MONTHLY, QUARTERLY, YEARLY, CUSTOM',
    }),
  start_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Start date must be a valid date',
    }),
  end_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'End date must be a valid date',
    }),
  opening_balance: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Opening balance must be a number',
      'number.min': 'Opening balance cannot be negative',
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  status: Joi.string()
    .valid('DRAFT', 'OPEN', 'CLOSED', 'SUSPENDED')
    .optional()
    .messages({
      'any.only': 'Status must be one of: DRAFT, OPEN, CLOSED, SUSPENDED',
    }),
  auto_close: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Auto close must be a boolean value',
    }),
  updated_by: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Updated by staff ID must be a number',
      'number.integer': 'Updated by staff ID must be an integer',
      'number.min': 'Updated by staff ID must be greater than 0',
    }),
}).custom((value, helpers) => {
  // Custom validation to ensure end_date is after start_date if both are provided
  if (value.start_date && value.end_date) {
    const startDate = new Date(value.start_date);
    const endDate = new Date(value.end_date);

    if (endDate <= startDate) {
      return helpers.error('any.invalid', { message: 'End date must be after start date' });
    }
  }

  return value;
});

export const financialPeriodFiltersSchema = Joi.object({
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  period_type: Joi.string()
    .valid('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM')
    .optional()
    .messages({
      'any.only': 'Period type must be one of: MONTHLY, QUARTERLY, YEARLY, CUSTOM',
    }),
  status: Joi.string()
    .valid('DRAFT', 'OPEN', 'CLOSED', 'SUSPENDED')
    .optional()
    .messages({
      'any.only': 'Status must be one of: DRAFT, OPEN, CLOSED, SUSPENDED',
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
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be greater than 0',
      'number.max': 'Limit cannot exceed 100',
    }),
});

export const openPeriodSchema = Joi.object({
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

export const closePeriodSchema = Joi.object({
  closing_date: Joi.string()
    .isoDate()
    .required()
    .messages({
      'string.empty': 'Closing date is required',
      'string.isoDate': 'Closing date must be a valid date',
      'any.required': 'Closing date is required',
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});
