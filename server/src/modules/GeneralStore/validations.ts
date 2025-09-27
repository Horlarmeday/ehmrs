import Joi from 'joi';
import {
  ItemStatus,
  MovementType,
  RequestStatus,
  Priority,
  ItemRequestStatus,
} from '../../database/models/generalStore/types';

// Category validations
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  parent_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Parent ID must be a valid number',
      'number.positive': 'Parent ID must be a positive number',
    }),
  is_active: Joi.boolean()
    .optional()
    .default(true),

  code: Joi.string()
    .optional()
    .allow(''),
  icon_class: Joi.string()
    .optional()
    .allow(''),
  is_featured: Joi.boolean()
    .optional()
    .allow(''),
  is_restricted: Joi.boolean()
    .optional()
    .allow(''),
  requires_approval: Joi.boolean()
    .optional()
    .allow(''),
  sort_order: Joi.number()
    .optional()
    .allow(''),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  parent_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Parent ID must be a valid number',
      'number.positive': 'Parent ID must be a positive number',
    }),
  is_active: Joi.boolean().optional(),
});

// Subcategory validations
export const createSubcategorySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Subcategory name is required',
      'string.min': 'Subcategory name must be at least 2 characters long',
      'string.max': 'Subcategory name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  category_id: Joi.number()
    .required()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
      'any.required': 'Category ID is required',
    }),
  is_active: Joi.boolean()
    .optional()
    .default(true),
});

export const updateSubcategorySchema = Joi.object({
  name: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Subcategory name must be at least 2 characters long',
      'string.max': 'Subcategory name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  category_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
    }),
  is_active: Joi.boolean().optional(),
});

// Item validations
export const createItemSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Item name is required',
      'string.min': 'Item name must be at least 2 characters long',
      'string.max': 'Item name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  category_id: Joi.number()
    .required()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
      'any.required': 'Category ID is required',
    }),
  subcategory_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Subcategory ID must be a valid number',
      'number.positive': 'Subcategory ID must be a positive number',
    }),
  unit_id: Joi.number()
    .required()
    .positive()
    .messages({
      'number.base': 'Unit ID must be a valid number',
      'number.positive': 'Unit ID must be a positive number',
      'any.required': 'Unit ID is required',
    }),
  manufacturer: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'Manufacturer name cannot exceed 100 characters',
    }),
  model_number: Joi.string()
    .optional()
    .max(50)
    .messages({
      'string.max': 'Model number cannot exceed 50 characters',
    }),
  specifications: Joi.string()
    .optional()
    .max(2000)
    .messages({
      'string.max': 'Specifications cannot exceed 2000 characters',
    }),
  initial_stock: Joi.number()
    .required()
    .min(0)
    .max(999999)
    .messages({
      'number.base': 'Initial stock must be a valid number',
      'number.min': 'Initial stock cannot be negative',
      'number.max': 'Initial stock cannot exceed 999,999',
      'any.required': 'Initial stock is required',
    }),
  minimum_stock: Joi.number()
    .required()
    .min(0)
    .max(999999)
    .messages({
      'number.base': 'Minimum stock must be a valid number',
      'number.min': 'Minimum stock cannot be negative',
      'number.max': 'Minimum stock cannot exceed 999,999',
      'any.required': 'Minimum stock is required',
    }),
  maximum_stock: Joi.number()
    .optional()
    .min(1)
    .max(999999)
    .messages({
      'number.base': 'Maximum stock must be a valid number',
      'number.min': 'Maximum stock must be at least 1',
      'number.max': 'Maximum stock cannot exceed 999,999',
    }),
  unit_cost: Joi.number()
    .required()
    .min(0)
    .max(999999.99)
    .precision(2)
    .messages({
      'number.base': 'Unit cost must be a valid number',
      'number.min': 'Unit cost cannot be negative',
      'number.max': 'Unit cost cannot exceed 999,999.99',
      'number.precision': 'Unit cost can have maximum 2 decimal places',
      'any.required': 'Unit cost is required',
    }),
  location: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'Location cannot exceed 100 characters',
    }),
  shelf_number: Joi.string()
    .optional()
    .max(50)
    .messages({
      'string.max': 'Shelf number cannot exceed 50 characters',
    }),
  expiry_date: Joi.date()
    .optional()
    .greater('now')
    .messages({
      'date.greater': 'Expiry date must be in the future',
    }),
  is_expirable: Joi.boolean()
    .optional()
    .default(false),
  is_serialized: Joi.boolean()
    .optional()
    .default(false),
  is_lot_tracked: Joi.boolean()
    .optional()
    .default(false),
  supplier_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Supplier ID must be a valid number',
      'number.positive': 'Supplier ID must be a positive number',
    }),
});

export const updateItemSchema = Joi.object({
  name: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Item name must be at least 2 characters long',
      'string.max': 'Item name cannot exceed 100 characters',
    }),
  description: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
  category_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
    }),
  subcategory_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Subcategory ID must be a valid number',
      'number.positive': 'Subcategory ID must be a positive number',
    }),
  unit_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Unit ID must be a valid number',
      'number.positive': 'Unit ID must be a positive number',
    }),
  manufacturer: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'Manufacturer name cannot exceed 100 characters',
    }),
  model_number: Joi.string()
    .optional()
    .max(50)
    .messages({
      'string.max': 'Model number cannot exceed 50 characters',
    }),
  specifications: Joi.string()
    .optional()
    .max(2000)
    .messages({
      'string.max': 'Specifications cannot exceed 2000 characters',
    }),
  minimum_stock: Joi.number()
    .optional()
    .min(0)
    .max(999999)
    .messages({
      'number.base': 'Minimum stock must be a valid number',
      'number.min': 'Minimum stock cannot be negative',
      'number.max': 'Minimum stock cannot exceed 999,999',
    }),
  maximum_stock: Joi.number()
    .optional()
    .min(1)
    .max(999999)
    .messages({
      'number.base': 'Maximum stock must be a valid number',
      'number.min': 'Maximum stock must be at least 1',
      'number.max': 'Maximum stock cannot exceed 999,999',
    }),
  unit_cost: Joi.number()
    .optional()
    .min(0)
    .max(999999.99)
    .precision(2)
    .messages({
      'number.base': 'Unit cost must be a valid number',
      'number.min': 'Unit cost cannot be negative',
      'number.max': 'Unit cost cannot exceed 999,999.99',
      'number.precision': 'Unit cost can have maximum 2 decimal places',
    }),
  location: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'Location cannot exceed 100 characters',
    }),
  shelf_number: Joi.string()
    .optional()
    .max(50)
    .messages({
      'string.max': 'Shelf number cannot exceed 50 characters',
    }),
  expiry_date: Joi.date()
    .optional()
    .greater('now')
    .messages({
      'date.greater': 'Expiry date must be in the future',
    }),
  is_expirable: Joi.boolean().optional(),
  is_serialized: Joi.boolean().optional(),
  is_lot_tracked: Joi.boolean().optional(),
  supplier_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Supplier ID must be a valid number',
      'number.positive': 'Supplier ID must be a positive number',
    }),
  status: Joi.string()
    .optional()
    .valid(...Object.values(ItemStatus))
    .messages({
      'any.only': 'Status must be one of: ACTIVE, INACTIVE, DISCONTINUED',
    }),
});

// Movement validations
export const createMovementSchema = Joi.object({
  item_id: Joi.number()
    .required()
    .positive()
    .messages({
      'number.base': 'Item ID must be a valid number',
      'number.positive': 'Item ID must be a positive number',
      'any.required': 'Item ID is required',
    }),
  movement_type: Joi.string()
    .required()
    .valid(...Object.values(MovementType))
    .messages({
      'any.only': 'Movement type must be one of: IN, OUT, TRANSFER, ADJUSTMENT',
      'any.required': 'Movement type is required',
    }),
  quantity: Joi.number()
    .required()
    .positive()
    .max(999999)
    .messages({
      'number.base': 'Quantity must be a valid number',
      'number.positive': 'Quantity must be positive',
      'number.max': 'Quantity cannot exceed 999,999',
      'any.required': 'Quantity is required',
    }),
  unit_cost: Joi.number()
    .required()
    .min(0)
    .max(999999.99)
    .precision(2)
    .messages({
      'number.base': 'Unit cost must be a valid number',
      'number.min': 'Unit cost cannot be negative',
      'number.max': 'Unit cost cannot exceed 999,999.99',
      'number.precision': 'Unit cost can have maximum 2 decimal places',
      'any.required': 'Unit cost is required',
    }),
  reference_type: Joi.string()
    .required()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Reference type is required',
      'string.min': 'Reference type must be at least 2 characters long',
      'string.max': 'Reference type cannot exceed 50 characters',
    }),
  reference_id: Joi.number()
    .required()
    .positive()
    .messages({
      'number.base': 'Reference ID must be a valid number',
      'number.positive': 'Reference ID must be a positive number',
      'any.required': 'Reference ID is required',
    }),
  from_location: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'From location cannot exceed 100 characters',
    }),
  to_location: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'To location cannot exceed 100 characters',
    }),
  notes: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

// Request validations
export const createRequestSchema = Joi.object({
  requesting_department: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'string.empty': 'Requesting department is required',
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters',
    }),
  priority: Joi.string()
    .required()
    .valid(...Object.values(Priority))
    .messages({
      'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
      'any.required': 'Priority is required',
    }),
  required_date: Joi.date()
    .required()
    .greater('now')
    .messages({
      'date.base': 'Required date must be a valid date',
      'date.greater': 'Required date must be in the future',
      'any.required': 'Required date is required',
    }),
  notes: Joi.string()
    .optional()
    .max(1000)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
  items: Joi.array()
    .required()
    .min(1)
    .max(100)
    .items(
      Joi.object({
        item_id: Joi.number()
          .required()
          .positive()
          .messages({
            'number.base': 'Item ID must be a valid number',
            'number.positive': 'Item ID must be a positive number',
            'any.required': 'Item ID is required',
          }),
        quantity_requested: Joi.number()
          .required()
          .positive()
          .max(999999)
          .messages({
            'number.base': 'Quantity requested must be a valid number',
            'number.positive': 'Quantity requested must be positive',
            'number.max': 'Quantity requested cannot exceed 999,999',
            'any.required': 'Quantity requested is required',
          }),
        notes: Joi.string()
          .optional()
          .max(500)
          .messages({
            'string.max': 'Item notes cannot exceed 500 characters',
          }),
      })
    )
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required',
      'array.max': 'Cannot request more than 100 items at once',
      'any.required': 'Items are required',
    }),
});

// Add updateRequestSchema allowing partial meta and optional full items replacement
export const updateRequestSchema = Joi.object({
  requesting_department: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters',
    }),
  priority: Joi.string()
    .optional()
    .valid(...Object.values(Priority))
    .messages({
      'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
    }),
  required_date: Joi.date()
    .optional()
    .greater('now')
    .messages({
      'date.base': 'Required date must be a valid date',
      'date.greater': 'Required date must be in the future',
    }),
  notes: Joi.string()
    .optional()
    .max(1000)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
  items: Joi.array()
    .optional()
    .min(1)
    .max(100)
    .items(
      Joi.object({
        item_id: Joi.number()
          .required()
          .positive()
          .messages({
            'number.base': 'Item ID must be a valid number',
            'number.positive': 'Item ID must be a positive number',
            'any.required': 'Item ID is required',
          }),
        quantity_requested: Joi.number()
          .required()
          .positive()
          .max(999999)
          .messages({
            'number.base': 'Quantity requested must be a valid number',
            'number.positive': 'Quantity requested must be positive',
            'number.max': 'Quantity requested cannot exceed 999,999',
            'any.required': 'Quantity requested is required',
          }),
        notes: Joi.string()
          .optional()
          .max(500)
          .messages({
            'string.max': 'Item notes cannot exceed 500 characters',
          }),
      })
    )
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required when updating items',
      'array.max': 'Cannot request more than 100 items at once',
    }),
});

export const approveRequestSchema = Joi.object({
  approved_items: Joi.array()
    .required()
    .min(1)
    .items(
      Joi.object({
        item_id: Joi.number()
          .required()
          .positive()
          .messages({
            'number.base': 'Item ID must be a valid number',
            'number.positive': 'Item ID must be a positive number',
            'any.required': 'Item ID is required',
          }),
        quantity_approved: Joi.number()
          .required()
          .positive()
          .max(999999)
          .messages({
            'number.base': 'Quantity approved must be a valid number',
            'number.positive': 'Quantity approved must be positive',
            'number.max': 'Quantity approved cannot exceed 999,999',
            'any.required': 'Quantity approved is required',
          }),
      })
    )
    .messages({
      'array.base': 'Approved items must be an array',
      'array.min': 'At least one approved item is required',
      'any.required': 'Approved items are required',
    }),
});

export const rejectRequestSchema = Joi.object({
  rejection_reason: Joi.string()
    .required()
    .min(10)
    .max(500)
    .messages({
      'string.empty': 'Rejection reason is required',
      'string.min': 'Rejection reason must be at least 10 characters long',
      'string.max': 'Rejection reason cannot exceed 500 characters',
    }),
});

export const fulfillRequestSchema = Joi.object({
  issued_items: Joi.array()
    .required()
    .min(1)
    .items(
      Joi.object({
        item_id: Joi.number()
          .required()
          .positive()
          .messages({
            'number.base': 'Item ID must be a valid number',
            'number.positive': 'Item ID must be a positive number',
            'any.required': 'Item ID is required',
          }),
        quantity_issued: Joi.number()
          .required()
          .positive()
          .max(999999)
          .messages({
            'number.base': 'Quantity issued must be a valid number',
            'number.positive': 'Quantity issued must be positive',
            'number.max': 'Quantity issued cannot exceed 999,999',
            'any.required': 'Quantity issued is required',
          }),
      })
    )
    .messages({
      'array.base': 'Issued items must be an array',
      'array.min': 'At least one issued item is required',
      'any.required': 'Issued items are required',
    }),
});

// Query parameter validations
export const paginationSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  page: Joi.number()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),
  currentPage: Joi.number()
    .optional()
    .min(1)
    .messages({
      'number.base': 'Current page must be a valid number',
      'number.min': 'Current page must be at least 1',
    }),
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  pageLimit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Page limit must be a valid number',
      'number.min': 'Page limit must be at least 1',
      'number.max': 'Page limit cannot exceed 100',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.currentPage && !value.page) {
    value.page = value.currentPage;
  }
  if (value.pageLimit && !value.limit) {
    value.limit = value.pageLimit;
  }
  return value;
});

export const categoryFilterSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  page: Joi.number()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),
  currentPage: Joi.number()
    .optional()
    .min(1)
    .messages({
      'number.base': 'Current page must be a valid number',
      'number.min': 'Current page must be at least 1',
    }),
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  pageLimit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Page limit must be a valid number',
      'number.min': 'Page limit must be at least 1',
      'number.max': 'Page limit cannot exceed 100',
    }),
  parent_id: Joi.number()
    .optional()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Parent ID must be a valid number',
      'number.positive': 'Parent ID must be a positive number',
    }),
  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_active must be a boolean value',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.currentPage && !value.page) {
    value.page = value.currentPage;
  }
  if (value.pageLimit && !value.limit) {
    value.limit = value.pageLimit;
  }
  return value;
});

export const itemFilterSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  page: Joi.number()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),
  currentPage: Joi.number()
    .optional()
    .min(1)
    .messages({
      'number.base': 'Current page must be a valid number',
      'number.min': 'Current page must be at least 1',
    }),
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  pageLimit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Page limit must be a valid number',
      'number.min': 'Page limit must be at least 1',
      'number.max': 'Page limit cannot exceed 100',
    }),
  category_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
    }),
  subcategory_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Subcategory ID must be a valid number',
      'number.positive': 'Subcategory ID must be a positive number',
    }),
  status: Joi.string()
    .optional()
    .valid(...Object.values(ItemStatus))
    .messages({
      'any.only': 'Status must be one of: ACTIVE, INACTIVE, DISCONTINUED',
    }),
  supplier_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Supplier ID must be a valid number',
      'number.positive': 'Supplier ID must be a positive number',
    }),
  search: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Search term must be at least 2 characters long',
      'string.max': 'Search term cannot exceed 100 characters',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.currentPage && !value.page) {
    value.page = value.currentPage;
  }
  if (value.pageLimit && !value.limit) {
    value.limit = value.pageLimit;
  }
  return value;
});

export const movementFilterSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  page: Joi.number()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),
  currentPage: Joi.number()
    .optional()
    .min(1)
    .messages({
      'number.base': 'Current page must be a valid number',
      'number.min': 'Current page must be at least 1',
    }),
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  pageLimit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Page limit must be a valid number',
      'number.min': 'Page limit must be at least 1',
      'number.max': 'Page limit cannot exceed 100',
    }),
  item_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Item ID must be a valid number',
      'number.positive': 'Item ID must be a positive number',
    }),
  movement_type: Joi.string()
    .optional()
    .valid(...Object.values(MovementType))
    .messages({
      'any.only': 'Movement type must be one of: IN, OUT, TRANSFER, ADJUSTMENT',
    }),
  start_date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),
  end_date: Joi.date()
    .optional()
    .greater(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
    }),
  staff_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Staff ID must be a valid number',
      'number.positive': 'Staff ID must be a positive number',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.currentPage && !value.page) {
    value.page = value.currentPage;
  }
  if (value.pageLimit && !value.limit) {
    value.limit = value.pageLimit;
  }
  return value;
});

export const requestFilterSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  page: Joi.number()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),
  currentPage: Joi.number()
    .optional()
    .min(1)
    .messages({
      'number.base': 'Current page must be a valid number',
      'number.min': 'Current page must be at least 1',
    }),
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  pageLimit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Page limit must be a valid number',
      'number.min': 'Page limit must be at least 1',
      'number.max': 'Page limit cannot exceed 100',
    }),
  status: Joi.string()
    .optional()
    .valid(...Object.values(RequestStatus))
    .messages({
      'any.only':
        'Status must be one of: PENDING, APPROVED, REJECTED, FULFILLED, PARTIALLY_FULFILLED',
    }),
  priority: Joi.string()
    .optional()
    .valid(...Object.values(Priority))
    .messages({
      'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
    }),
  requesting_department: Joi.string()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Department name must be at least 2 characters long',
      'string.max': 'Department name cannot exceed 100 characters',
    }),
  start_date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),
  end_date: Joi.date()
    .optional()
    .greater(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.currentPage && !value.page) {
    value.page = value.currentPage;
  }
  if (value.pageLimit && !value.limit) {
    value.limit = value.pageLimit;
  }
  return value;
});

// Report validations
export const reportFilterSchema = Joi.object({
  // Support both old and new parameter names for backward compatibility
  start_date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),
  start: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),
  end_date: Joi.date()
    .optional()
    .greater(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
    }),
  end: Joi.date()
    .optional()
    .greater(Joi.ref('start'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
    }),
  category_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Category ID must be a valid number',
      'number.positive': 'Category ID must be a positive number',
    }),
  subcategory_id: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Subcategory ID must be a valid number',
      'number.positive': 'Subcategory ID must be a positive number',
    }),
  group_by: Joi.string()
    .optional()
    .valid('category', 'subcategory', 'supplier')
    .messages({
      'any.only': 'Group by must be one of: category, subcategory, supplier',
    }),
}).custom((value, helpers) => {
  // Normalize parameter names - prefer new names over old names
  if (value.start && !value.start_date) {
    value.start_date = value.start;
  }
  if (value.end && !value.end_date) {
    value.end_date = value.end;
  }

  // Ensure at least one date range is provided
  if (!value.start_date && !value.start) {
    return helpers.error('any.required', { message: 'Start date is required' });
  }
  if (!value.end_date && !value.end) {
    return helpers.error('any.required', { message: 'End date is required' });
  }

  return value;
});
