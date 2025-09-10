import Joi from 'joi';

export interface CreateHMOClaimDto {
  bill_id: number;
  patient_id: number;
  hmo_id: number;
  claim_number: string;
  claim_amount: number;
  approved_amount?: number;
  status?: string;
  submission_date?: string;
  notes?: string;
}

export interface UpdateHMOClaimDto {
  bill_id?: number;
  patient_id?: number;
  hmo_id?: number;
  claim_number?: string;
  claim_amount?: number;
  approved_amount?: number;
  status?: string;
  submission_date?: string;
  approval_date?: string;
  payment_date?: string;
  notes?: string;
  rejection_reason?: string;
}

export interface HMOClaimFilters {
  hmo?: string;
  status?: string;
  dateRange?: string;
  amountRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApproveClaimDto {
  notes?: string;
}

export interface RejectClaimDto {
  reason: string;
}

export interface ProcessPaymentDto {
  amount: string;
  notes?: string;
}

// Validation schemas
export const createHMOClaimSchema = Joi.object({
  bill_id: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Bill ID must be a number',
      'number.integer': 'Bill ID must be an integer',
      'number.min': 'Bill ID must be greater than 0',
      'any.required': 'Bill ID is required',
    }),
  patient_id: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Patient ID must be a number',
      'number.integer': 'Patient ID must be an integer',
      'number.min': 'Patient ID must be greater than 0',
      'any.required': 'Patient ID is required',
    }),
  hmo_id: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'HMO ID must be a number',
      'number.integer': 'HMO ID must be an integer',
      'number.min': 'HMO ID must be greater than 0',
      'any.required': 'HMO ID is required',
    }),
  claim_number: Joi.string()
    .required()
    .max(100)
    .messages({
      'string.empty': 'Claim number is required',
      'string.max': 'Claim number cannot exceed 100 characters',
      'any.required': 'Claim number is required',
    }),
  claim_amount: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Claim amount must be a number',
      'number.min': 'Claim amount cannot be negative',
      'any.required': 'Claim amount is required',
    }),
  approved_amount: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Approved amount must be a number',
      'number.min': 'Approved amount cannot be negative',
    }),
  status: Joi.string()
    .valid('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')
    .optional()
    .default('PENDING')
    .messages({
      'any.only': 'Status must be one of: PENDING, SUBMITTED, APPROVED, REJECTED, PAID',
    }),
  submission_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Submission date must be a valid date',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

export const updateHMOClaimSchema = Joi.object({
  bill_id: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Bill ID must be a number',
      'number.integer': 'Bill ID must be an integer',
      'number.min': 'Bill ID must be greater than 0',
    }),
  patient_id: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Patient ID must be a number',
      'number.integer': 'Patient ID must be an integer',
      'number.min': 'Patient ID must be greater than 0',
    }),
  hmo_id: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'HMO ID must be a number',
      'number.integer': 'HMO ID must be an integer',
      'number.min': 'HMO ID must be greater than 0',
    }),
  claim_number: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Claim number cannot exceed 100 characters',
    }),
  claim_amount: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Claim amount must be a number',
      'number.min': 'Claim amount cannot be negative',
    }),
  approved_amount: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Approved amount must be a number',
      'number.min': 'Approved amount cannot be negative',
    }),
  status: Joi.string()
    .valid('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')
    .optional()
    .messages({
      'any.only': 'Status must be one of: PENDING, SUBMITTED, APPROVED, REJECTED, PAID',
    }),
  submission_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Submission date must be a valid date',
    }),
  approval_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Approval date must be a valid date',
    }),
  payment_date: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Payment date must be a valid date',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
  rejection_reason: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Rejection reason cannot exceed 1000 characters',
    }),
});

export const hmoClaimFiltersSchema = Joi.object({
  hmo_id: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'HMO ID must be a number',
      'number.integer': 'HMO ID must be an integer',
      'number.min': 'HMO ID must be greater than 0',
    }),
  status: Joi.string()
    .valid('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')
    .optional()
    .messages({
      'any.only': 'Status must be one of: PENDING, SUBMITTED, APPROVED, REJECTED, PAID',
    }),
  startDate: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'Start date must be a valid date',
    }),
  endDate: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'End date must be a valid date',
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters',
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

export const approveClaimSchema = Joi.object({
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

export const rejectClaimSchema = Joi.object({
  reason: Joi.string()
    .required()
    .max(500)
    .messages({
      'string.empty': 'Rejection reason is required',
      'string.max': 'Rejection reason cannot exceed 500 characters',
      'any.required': 'Rejection reason is required',
    }),
});

export const processPaymentSchema = Joi.object({
  amount: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Payment amount must be a number',
      'number.min': 'Payment amount cannot be negative',
      'any.required': 'Payment amount is required',
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});
