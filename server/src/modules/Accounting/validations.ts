import Joi from 'joi';

// Patient Deposit Validations
export const createDepositSchema = Joi.object({
  patient_id: Joi.number()
    .required()
    .positive(),
  amount: Joi.number()
    .required()
    .positive()
    .precision(2),
  deposit_type: Joi.string()
    .valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'OTHER')
    .required(),
  reference_number: Joi.string().optional(),
  description: Joi.string()
    .optional()
    .allow('')
    .max(500),
  status: Joi.string()
    .valid('ACTIVE', 'USED', 'REFUNDED')
    .optional(),
  bank_account_id: Joi.number()
    .positive()
    .optional()
    .allow(null),
  pos_terminal_id: Joi.number()
    .positive()
    .optional()
    .allow(null),
  initial_amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(null),
  current_balance: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(null),
  refundable_amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(null),
  deposit_date: Joi.date().optional(),
  last_activity_date: Joi.date().optional(),
  payment_method: Joi.string()
    .valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'INSURANCE', 'OTHER')
    .optional(),

  payment_reference: Joi.string()
    .optional()
    .max(100),
});

export const updateDepositSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  deposit_type: Joi.string()
    .valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'OTHER')
    .optional(),
  description: Joi.string()
    .optional()
    .max(500),
  status: Joi.string()
    .valid('ACTIVE', 'USED', 'REFUNDED')
    .optional(),
  bank_account_id: Joi.number()
    .positive()
    .optional(),
  pos_terminal_id: Joi.number()
    .positive()
    .optional(),
  current_balance: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  refundable_amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  last_activity_date: Joi.date().optional(),
  payment_method: Joi.string()
    .valid('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'INSURANCE', 'OTHER')
    .optional(),
  payment_reference: Joi.string()
    .optional()
    .max(100),
});

// Clinical Bill Validations
export const createBillSchema = Joi.object({
  patient_id: Joi.number()
    .required()
    .positive(),
  visit_id: Joi.number()
    .required()
    .positive(),
  items: Joi.array()
    .items(
      Joi.object({
        item_type: Joi.string()
          .valid('DRUG', 'TEST', 'INVESTIGATION', 'SERVICE', 'ADDITIONAL_ITEM')
          .required(),
        item_id: Joi.number()
          .required()
          .positive(),
        quantity: Joi.number()
          .required()
          .positive()
          .integer(),
        discount_percentage: Joi.number()
          .min(0)
          .max(100)
          .precision(2)
          .optional(),
        notes: Joi.string()
          .optional()
          .max(500),
      })
    )
    .min(1)
    .required(),
  billing_mode: Joi.string()
    .valid('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET')
    .required(),
  payment_collection_method: Joi.string()
    .valid('DEPOSIT', 'POINT_OF_SERVICE', 'INSURANCE_CLAIM', 'MIXED')
    .required(),
  payment_collection_point: Joi.string().required(),
  patient_co_pay_amount: Joi.number()
    .min(0)
    .precision(2)
    .optional(),
  hmo_billed_amount: Joi.number()
    .min(0)
    .precision(2)
    .optional(),
  due_date: Joi.date()
    .optional()
    .greater('now'),
  notes: Joi.string()
    .optional()
    .max(1000),
});

export const updateBillSchema = Joi.object({
  billing_status: Joi.string()
    .valid('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')
    .optional(),
  payment_status: Joi.string()
    .valid('PENDING', 'PARTIAL', 'PAID', 'CANCELLED')
    .optional(),
  due_date: Joi.date()
    .optional()
    .greater('now'),
  notes: Joi.string()
    .optional()
    .max(1000),
});

// Clinical Payment Validations
export const createPaymentSchema = Joi.object({
  bill_id: Joi.number()
    .required()
    .positive(),
  patient_id: Joi.number()
    .required()
    .positive(),
  amount: Joi.number()
    .required()
    .positive()
    .precision(2),
  payment_method: Joi.string()
    .valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'DEPOSIT', 'INSURANCE', 'OTHER')
    .required(),
  // payment_type: Joi.string()
  //   .valid('FULL', 'PARTIAL', 'DEPOSIT', 'REFUND', 'POINT_OF_SERVICE')
  //   .required(),
  collection_point: Joi.string().optional(),
  transaction_id: Joi.string()
    .optional()
    .max(100),
  bank_reference: Joi.string()
    .optional()
    .allow(null)
    .max(100),
  card_type: Joi.string()
    .optional()
    .max(50),
  mobile_money_provider: Joi.string()
    .optional()
    .allow(null)
    .max(50),
  deposit_id: Joi.number()
    .positive()
    .allow(null)
    .optional(),
  insurance_provider: Joi.string()
    .optional()
    .allow(null)
    .max(100),
  insurance_claim_number: Joi.string()
    .optional()
    .allow(null)
    .max(100),
  notes: Joi.string()
    .optional()
    .allow('')
    .max(1000),
});

// Search and Filter Validations
export const depositFilterSchema = Joi.object({
  patient_id: Joi.number()
    .positive()
    .optional(),
  patient_search: Joi.string()
    .optional()
    .max(100), // Allow patient search by name/ID
  deposit_type: Joi.string()
    .valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'OTHER')
    .optional(),
  status: Joi.string()
    .valid('ACTIVE', 'USED', 'REFUNDED')
    .optional()
    .allow(''),
  bank_account_id: Joi.number()
    .positive()
    .optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  min_amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  max_amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  page: Joi.number()
    .positive()
    .integer()
    .min(1)
    .optional(),
  limit: Joi.number()
    .positive()
    .integer()
    .min(1)
    .max(100)
    .optional(),
});

export const billFilterSchema = Joi.object({
  patient_search: Joi.string()
    .optional()
    .allow(''),
  visit_id: Joi.number()
    .positive()
    .optional(),
  billing_mode: Joi.string()
    .valid('CASH', 'INSURANCE', 'WAIVER', 'OTHER', 'FREE', 'WALLET')
    .optional()
    .allow(''),
  payment_status: Joi.string()
    .valid('PENDING', 'PARTIAL', 'PAID', 'CANCELLED')
    .optional()
    .allow(''),
  billing_status: Joi.string()
    .valid('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')
    .optional()
    .allow(''),
  start_date: Joi.date()
    .optional()
    .allow(''),
  end_date: Joi.date()
    .optional()
    .allow(''),
  min_amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(''),
  max_amount: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(''),
  page: Joi.number()
    .positive()
    .integer()
    .min(1)
    .optional()
    .allow(''),
  limit: Joi.number()
    .positive()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .allow(''),
});

export const paymentFilterSchema = Joi.object({
  bill_id: Joi.number()
    .positive()
    .optional(),
  patient_id: Joi.number()
    .positive()
    .optional(),
  payment_method: Joi.string()
    .valid('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'DEPOSIT', 'INSURANCE', 'OTHER')
    .optional(),
  payment_type: Joi.string()
    .valid('FULL', 'PARTIAL', 'DEPOSIT', 'REFUND', 'POINT_OF_SERVICE')
    .optional(),
  status: Joi.string()
    .valid('PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED', 'CONFIRMED', 'SETTLED')
    .optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  min_amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  max_amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),
  search: Joi.string()
    .min(1)
    .max(100)
    .optional(),
  page: Joi.number()
    .positive()
    .integer()
    .min(1)
    .optional(),
  limit: Joi.number()
    .positive()
    .integer()
    .default(50)
    .min(1)
    .max(100)
    .optional(),
});

// Enhanced Deposit Operation Validation Schemas
export const useDepositSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required(),
  bill_id: Joi.number()
    .positive()
    .required(),
  description: Joi.string()
    .optional()
    .max(500),
});

export const refundDepositSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required(),
  refund_reason: Joi.string()
    .required()
    .max(500),
});

export const adjustDepositSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required(),
  adjustment_type: Joi.string()
    .valid('add', 'subtract')
    .required(),
  reason: Joi.string()
    .required()
    .max(500),
});

// Pagination Schema
export const paginationSchema = Joi.object({
  page: Joi.number()
    .positive()
    .integer()
    .min(1)
    .optional(),
  limit: Joi.number()
    .positive()
    .integer()
    .min(1)
    .max(100)
    .optional(),
});

// Financial Report Schema
export const financialReportSchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  department: Joi.string().optional(),
  chart_type: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly')
    .optional(),
  page: Joi.number()
    .positive()
    .integer()
    .min(1)
    .optional(),
  limit: Joi.number()
    .positive()
    .integer()
    .min(1)
    .max(100)
    .optional(),
});

// ===== PAYMENT PROCESSING VALIDATIONS =====

// Process Payment Schema
export const processPaymentSchema = Joi.object({
  bill_id: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Bill ID is required',
      'number.base': 'Bill ID must be a number',
      'number.positive': 'Bill ID must be a positive number',
    }),
  patient_id: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Patient ID is required',
      'number.base': 'Patient ID must be a number',
      'number.positive': 'Patient ID must be a positive number',
    }),
  selected_items: Joi.array()
    .items(Joi.number().positive())
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one item must be selected for payment',
      'array.min': 'At least one item must be selected for payment',
      'array.base': 'Selected items must be an array',
    }),
  amount: Joi.number()
    .required()
    .positive()
    .precision(2)
    .messages({
      'any.required': 'Payment amount is required',
      'number.base': 'Payment amount must be a number',
      'number.positive': 'Payment amount must be greater than zero',
      'number.precision': 'Payment amount must have maximum 2 decimal places',
    }),
  payment_method: Joi.string()
    .valid('CASH', 'CARD', 'BANK_TRANSFER', 'INSURANCE', 'DEPOSIT', 'OTHER')
    .required()
    .messages({
      'any.required': 'Payment method is required',
      'any.only':
        'Payment method must be one of: CASH, CARD, BANK_TRANSFER, INSURANCE, DEPOSIT, OTHER',
    }),
  payment_type: Joi.string()
    .valid('FULL', 'PARTIAL', 'ADVANCE', 'DEPOSIT', 'POINT_OF_SERVICE')
    .required()
    .messages({
      'any.required': 'Payment type is required',
      'any.only': 'Payment type must be one of: FULL, PARTIAL, ADVANCE, DEPOSIT, POINT_OF_SERVICE',
    }),
  payment_date: Joi.date()
    .optional()
    .default(() => new Date())
    .messages({
      'date.base': 'Payment date must be a valid date',
    }),
  notes: Joi.string()
    .optional()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),

  // Method-specific fields
  // CASH payment fields
  cash_register_id: Joi.when('payment_method', {
    is: 'CASH',
    then: Joi.number()
      .required()
      .positive()
      .messages({
        'any.required': 'Cash register ID is required for cash payments',
        'number.base': 'Cash register ID must be a number',
        'number.positive': 'Cash register ID must be a positive number',
      }),
    otherwise: Joi.forbidden(),
  }),
  cash_received: Joi.when('payment_method', {
    is: 'CASH',
    then: Joi.number()
      .positive()
      .precision(2)
      .min(Joi.ref('amount'))
      .messages({
        'number.min': 'Cash received must be greater than or equal to payment amount',
        'number.positive': 'Cash received must be greater than zero',
      }),
    otherwise: Joi.forbidden(),
  }),
  change_given: Joi.when('payment_method', {
    is: 'CASH',
    then: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .messages({
        'number.min': 'Change given cannot be negative',
        'number.precision': 'Change must have maximum 2 decimal places',
      }),
    otherwise: Joi.forbidden(),
  }),

  // CARD payment fields
  pos_terminal_id: Joi.when('payment_method', {
    is: 'CARD',
    then: Joi.number()
      .required()
      .positive()
      .messages({
        'any.required': 'POS terminal is required for card payments',
        'number.positive': 'POS terminal ID must be a positive number',
      }),
    otherwise: Joi.forbidden(),
  }),
  transaction_reference: Joi.when('payment_method', {
    is: 'CARD',
    then: Joi.string()
      .optional()
      .max(100)
      .allow('')
      .messages({
        'string.max': 'Transaction reference cannot exceed 100 characters',
      }),
    otherwise: Joi.forbidden(),
  }),

  // BANK_TRANSFER payment fields
  bank_account_id: Joi.when('payment_method', {
    is: 'BANK_TRANSFER',
    then: Joi.number()
      .required()
      .positive()
      .messages({
        'any.required': 'Bank account is required for bank transfer payments',
        'number.positive': 'Bank account ID must be a positive number',
      }),
    otherwise: Joi.forbidden(),
  }),
  bank_reference: Joi.when('payment_method', {
    is: 'BANK_TRANSFER',
    then: Joi.string()
      .required()
      .max(100)
      .messages({
        'any.required': 'Bank reference is required for bank transfer payments',
        'string.max': 'Bank reference cannot exceed 100 characters',
      }),
    otherwise: Joi.forbidden(),
  }),

  // INSURANCE payment fields
  insurance_provider: Joi.when('payment_method', {
    is: 'INSURANCE',
    then: Joi.string()
      .required()
      .max(100)
      .messages({
        'any.required': 'Insurance provider is required for insurance payments',
        'string.max': 'Insurance provider cannot exceed 100 characters',
      }),
    otherwise: Joi.forbidden(),
  }),
  policy_number: Joi.when('payment_method', {
    is: 'INSURANCE',
    then: Joi.string()
      .optional()
      .max(100)
      .messages({
        'string.max': 'Policy number cannot exceed 100 characters',
      }),
    otherwise: Joi.forbidden(),
  }),
  copay_amount: Joi.when('payment_method', {
    is: 'INSURANCE',
    then: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .messages({
        'number.min': 'Co-pay amount cannot be negative',
        'number.precision': 'Co-pay amount must have maximum 2 decimal places',
      }),
    otherwise: Joi.forbidden(),
  }),

  // DEPOSIT payment fields
  deposit_usage: Joi.when('payment_method', {
    is: 'DEPOSIT',
    then: Joi.number()
      .required()
      .positive()
      .precision(2)
      .max(Joi.ref('amount'))
      .messages({
        'any.required': 'Deposit usage amount is required for deposit payments',
        'number.positive': 'Deposit usage amount must be greater than zero',
        'number.max': 'Deposit usage cannot exceed payment amount',
        'number.precision': 'Deposit usage must have maximum 2 decimal places',
      }),
    otherwise: Joi.forbidden(),
  }),
});

// Payment Options Query Schema
export const paymentOptionsQuerySchema = Joi.object({
  billId: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Bill ID is required',
      'number.base': 'Bill ID must be a number',
      'number.positive': 'Bill ID must be a positive number',
    }),
  patientId: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Patient ID is required',
      'number.base': 'Patient ID must be a number',
      'number.positive': 'Patient ID must be a positive number',
    }),
});

// Payment Status Params Schema
export const paymentStatusParamsSchema = Joi.object({
  paymentId: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Payment ID is required',
      'number.base': 'Payment ID must be a number',
      'number.positive': 'Payment ID must be a positive number',
    }),
});

// Payment Receipt Params Schema
export const paymentReceiptParamsSchema = Joi.object({
  paymentId: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Payment ID is required',
      'number.base': 'Payment ID must be a number',
      'number.positive': 'Payment ID must be a positive number',
    }),
});

// ===== BANK RECONCILIATION VALIDATIONS =====

// Bank Statement Import Schema
export const bankStatementImportSchema = Joi.object({
  bank_account_id: Joi.number()
    .required()
    .positive()
    .messages({
      'any.required': 'Bank account ID is required',
      'number.base': 'Bank account ID must be a number',
      'number.positive': 'Bank account ID must be a positive number',
    }),
  statement_date: Joi.date()
    .required()
    .max('now')
    .messages({
      'any.required': 'Statement date is required',
      'date.base': 'Statement date must be a valid date',
      'date.max': 'Statement date cannot be in the future',
    }),
  statement_reference: Joi.string()
    .required()
    .max(100)
    .messages({
      'any.required': 'Statement reference is required',
      'string.max': 'Statement reference cannot exceed 100 characters',
    }),
  opening_balance: Joi.number()
    .required()
    .precision(2)
    .messages({
      'any.required': 'Opening balance is required',
      'number.base': 'Opening balance must be a number',
      'number.precision': 'Opening balance must have maximum 2 decimal places',
    }),
  closing_balance: Joi.number()
    .required()
    .precision(2)
    .messages({
      'any.required': 'Closing balance is required',
      'number.base': 'Closing balance must be a number',
      'number.precision': 'Closing balance must have maximum 2 decimal places',
    }),
  transactions: Joi.array()
    .items(
      Joi.object({
        transaction_date: Joi.date()
          .required()
          .max('now')
          .messages({
            'any.required': 'Transaction date is required',
            'date.base': 'Transaction date must be a valid date',
            'date.max': 'Transaction date cannot be in the future',
          }),
        description: Joi.string()
          .required()
          .max(200)
          .messages({
            'any.required': 'Transaction description is required',
            'string.max': 'Transaction description cannot exceed 200 characters',
          }),
        reference: Joi.string()
          .required()
          .max(100)
          .messages({
            'any.required': 'Transaction reference is required',
            'string.max': 'Transaction reference cannot exceed 100 characters',
          }),
        amount: Joi.number()
          .required()
          .positive()
          .precision(2)
          .messages({
            'any.required': 'Transaction amount is required',
            'number.base': 'Transaction amount must be a number',
            'number.positive': 'Transaction amount must be greater than zero',
            'number.precision': 'Transaction amount must have maximum 2 decimal places',
          }),
        type: Joi.string()
          .valid('CREDIT', 'DEBIT')
          .required()
          .messages({
            'any.required': 'Transaction type is required',
            'any.only': 'Transaction type must be either CREDIT or DEBIT',
          }),
        bank_reference: Joi.string()
          .required()
          .max(100)
          .messages({
            'any.required': 'Bank reference is required',
            'string.max': 'Bank reference cannot exceed 100 characters',
          }),
        counterparty: Joi.string()
          .optional()
          .max(100)
          .messages({
            'string.max': 'Counterparty cannot exceed 100 characters',
          }),
        category: Joi.string()
          .optional()
          .max(100)
          .messages({
            'string.max': 'Category cannot exceed 100 characters',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one transaction is required',
      'array.min': 'At least one transaction is required',
    }),
  notes: Joi.string()
    .optional()
    .max(1000)
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

// Bank Reconciliation Approval Schema
export const bankReconciliationApprovalSchema = Joi.object({
  approval_notes: Joi.string()
    .optional()
    .max(1000)
    .messages({
      'string.max': 'Approval notes cannot exceed 1000 characters',
    }),
});

// ===== END BANK RECONCILIATION VALIDATIONS =====

// =============================================================================
// PHASE 6: REPORTING & ANALYTICS VALIDATIONS
// =============================================================================

export const operationalReportSchema = Joi.object({
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  report_type: Joi.string()
    .valid('performance', 'utilization', 'reconciliation', 'settlement', 'exceptions')
    .optional(),
  department: Joi.string().optional(),
  payment_method: Joi.string().optional(),
  include_details: Joi.boolean().default(true),
  format: Joi.string()
    .valid('json', 'csv', 'pdf')
    .default('json'),
});

export const businessIntelligenceSchema = Joi.object({
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  analysis_type: Joi.string()
    .valid('trends', 'predictive', 'kpi', 'real-time', 'comprehensive')
    .optional(),
  include_forecasts: Joi.boolean().default(true),
  include_risk_assessment: Joi.boolean().default(true),
  department: Joi.string().optional(),
  payment_method: Joi.string().optional(),
  format: Joi.string()
    .valid('json', 'csv', 'pdf')
    .default('json'),
});

// =============================================================================
// PATIENT FINANCIAL STATEMENT VALIDATION
// =============================================================================

export const financialStatementSchema = Joi.object({
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),
  endDate: Joi.date()
    .optional()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).messages({
        'date.min': 'End date must be after start date',
      }),
    })
    .messages({
      'date.base': 'End date must be a valid date',
    }),
  format: Joi.string()
    .valid('pdf', 'csv', 'xlsx')
    .required()
    .messages({
      'any.required': 'Export format is required',
      'any.only': 'Format must be one of: pdf, csv, xlsx',
    }),
  includeDeposits: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'includeDeposits must be a boolean value',
    }),
  includeDetails: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'includeDetails must be a boolean value',
    }),
}).custom((value, helpers) => {
  // Validate date range is not more than 1 year
  if (value.startDate && value.endDate) {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 365) {
      return helpers.error('any.custom', {
        message: 'Date range cannot exceed 1 year',
      });
    }
  }
  
  return value;
});

export function validateFinancialStatementRequest(data: any) {
  return financialStatementSchema.validate(data, { abortEarly: false });
}
