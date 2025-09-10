import Joi from 'joi';

export interface TrialBalanceFilters {
  period_id?: string;
  start_date?: string; // ✅ ADD: Frontend sends start_date
  end_date?: string; // ✅ ADD: Frontend sends end_date
  account_type?: string; // ✅ ADD: Frontend sends account_type
  search?: string; // ✅ ADD: Frontend sends search
  as_of_date?: string;
  include_zero_balances?: boolean;
  page?: number;
  limit?: number;
}

// Validation schemas
export const trialBalanceFiltersSchema = Joi.object({
  period_id: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Period ID cannot exceed 50 characters',
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
  account_type: Joi.string()
    .valid('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')
    .optional()
    .messages({
      'any.only': 'Account type must be one of: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE',
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  as_of_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'As of date must be a valid date',
    }),
  include_zero_balances: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'include_zero_balances must be a boolean',
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
