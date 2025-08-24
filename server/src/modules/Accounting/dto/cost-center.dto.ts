import Joi from 'joi';

export interface CreateCostCenterDto {
  code: string;
  name: string;
  department_id: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCostCenterDto {
  code?: string;
  name?: string;
  department_id?: number;
  description?: string;
  is_active?: boolean;
}

export interface CostCenterFilters {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Validation schemas
export const createCostCenterSchema = Joi.object({
  code: Joi.string().required().max(20).messages({
    'string.empty': 'Cost center code is required',
    'string.max': 'Cost center code cannot exceed 20 characters',
    'any.required': 'Cost center code is required',
  }),
  name: Joi.string().required().max(100).messages({
    'string.empty': 'Cost center name is required',
    'string.max': 'Cost center name cannot exceed 100 characters',
    'any.required': 'Cost center name is required',
  }),
  department_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.min': 'Department ID must be greater than 0',
    'any.required': 'Department ID is required',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'is_active must be a boolean',
  }),
});

export const updateCostCenterSchema = Joi.object({
  code: Joi.string().max(20).optional().messages({
    'string.max': 'Cost center code cannot exceed 20 characters',
  }),
  name: Joi.string().max(100).optional().messages({
    'string.max': 'Cost center name cannot exceed 100 characters',
  }),
  department_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.min': 'Department ID must be greater than 0',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'is_active must be a boolean',
  }),
});

export const costCenterFiltersSchema = Joi.object({
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Search term cannot exceed 100 characters',
  }),
  department_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.min': 'Department ID must be greater than 0',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'is_active must be a boolean',
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
