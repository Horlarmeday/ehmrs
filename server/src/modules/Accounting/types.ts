// Accounting Module Types and Interfaces

import {
  BillingMode,
  BillingStatus,
  BillItemTypeEnum,
  DepositStatus,
  DepositType,
  PaymentCollectionMethod,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from './enums';

// Patient Deposit Types
export interface PatientDepositData {
  id?: number;
  patient_id: number;
  amount: number;
  deposit_type: DepositType;
  reference_number: string;
  description?: string;
  status?: DepositStatus;
  created_by: number;
  updated_by?: number;
  period_id?: number;
  bank_account_id?: number;
  pos_terminal_id?: number;
  initial_amount?: number;
  current_balance?: number;
  refundable_amount?: number;
  deposit_date?: Date;
}

// Clinical Bill Types
export interface ClinicalBillData {
  id?: number;
  bill_number: string;
  patient_id: number;
  visit_id: number;
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  final_amount: number;
  billing_mode: BillingMode;
  patient_co_pay_amount: number;
  hmo_billed_amount: number;
  payment_status?: PaymentStatus;
  billing_status?: BillingStatus;
  payment_collection_method: PaymentCollectionMethod;
  payment_collection_point?: string;
  due_date: Date;
  notes?: string;
  created_by: number;
  updated_by?: number;
  period_id?: number;
}

// Clinical Bill Item Types
export interface ClinicalBillItemData {
  id?: number;
  bill_id: number;
  item_type: BillItemTypeEnum;
  item_id: number;
  item_name: string;
  item_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_price: number;
  notes?: string;
}

// Clinical Payment Types
export interface ClinicalPaymentData {
  id?: number;
  payment_reference: string;
  bill_id: number;
  patient_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  collection_point?: string;
  transaction_id?: string;
  bank_reference?: string;
  card_type?: string;
  mobile_money_provider?: string;
  deposit_id?: number;
  deposit_usage?: number;
  insurance_provider?: string;
  insurance_claim_number?: string;
  notes?: string;
  status?: PaymentStatus;
  processed_by: number;
  processed_at?: Date;
  period_id?: number;
}

// Billing Request Types
export interface BillingRequestData {
  patient_id: number;
  visit_id: number;
  items: BillingItemRequest[];
  billing_mode: BillingMode;
  payment_collection_method: PaymentCollectionMethod;
  payment_collection_point: string; // Always points to accounting department
  patient_co_pay_amount?: number;
  hmo_billed_amount?: number;
  due_date?: Date;
  notes?: string;
  created_by: number;
}

export interface BillingItemRequest {
  item_type: BillItemTypeEnum;
  item_id: number;
  quantity: number;
  discount_percentage?: number;
  notes?: string;
}

// Payment Request Types
export interface PaymentRequestData {
  bill_id: number;
  patient_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  collection_point?: string;
  transaction_id?: string;
  bank_reference?: string;
  card_type?: string;
  mobile_money_provider?: string;
  deposit_id?: number;
  insurance_provider?: string;
  insurance_claim_number?: string;
  notes?: string;
  processed_by: number;
}

export interface PaymentData {
  bill_id: number;
  patient_id: number;
  amount: number;
  payment_method: string;
  payment_type: string;
  collection_point?: string;
  notes?: string;
  staff_id: number;
  period_id?: number;

  // Cash specific fields
  cash_register_id?: number;

  // POS specific fields
  card_type?: string;
  card_last_four?: string;
  authorization_code?: string;
  transaction_id?: string;

  // Bank Transfer specific fields
  transfer_date?: Date;
  expected_settlement_date?: Date;
  transfer_fee?: number;

  // Insurance specific fields
  claim_reference?: string;
  insurance_provider?: string;
  policy_number?: string;
  copay_amount?: number;

  // Mixed payment fields
  is_mixed_payment?: boolean;
  mixed_payment_breakdown?: MixedPaymentBreakdown[];
}

export interface MixedPaymentBreakdown {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  notes?: string;

  // Method-specific data
  cash_register_id?: number;
  deposit_id?: number;
  card_type?: string;
  bank_account_id?: number;
  insurance_provider?: string;
}

export interface MixedPaymentResult {
  payment: ClinicalPaymentData;
  method: 'MIXED';
  breakdown: MixedPaymentBreakdown[];
  total_amount: number;
  method_totals: Record<PaymentMethod, number>;
}

export interface BankTransferPaymentData {
  bill_id: number;
  patient_id: number;
  amount: number;
  bank_account_id: number;
  transfer_date: Date;
  expected_settlement_date?: Date; // Optional for Nigerian context
  transfer_fee?: number; // Optional for Nigerian context (defaults to 0)
  transfer_currency?: string; // Optional for Nigerian context (defaults to 'NGN')
  exchange_rate?: number; // Optional for Nigerian context (defaults to 1)
  original_amount?: number;
  original_currency?: string;
  transfer_processor?: string; // Optional for Nigerian context
  transfer_processor_reference?: string; // Optional for Nigerian context
  notes?: string;
  payment_reference?: string; // Payment reference for tracking
  period_id?: number; // Financial period ID for accounting
  visit_id?: number;
}

// Search and Filter Types
export interface BillSearchFilters {
  patient_id?: number;
  visit_id?: number;
  billing_mode?: BillingMode;
  payment_status?: PaymentStatus;
  billing_status?: BillingStatus;
  start_date?: Date;
  end_date?: Date;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
}

export interface PaymentSearchFilters {
  bill_id?: number;
  patient_id?: number;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  status?: PaymentStatus;
  start_date?: Date;
  end_date?: Date;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DepositSearchFilters {
  patient_id?: number;
  patient_search?: string; // Add patient search support
  deposit_type?: DepositType;
  status?: DepositStatus;
  start_date?: Date;
  end_date?: Date;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
}

// Response Types
export interface BillingSummary {
  total_bills: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  today_bills: number;
  today_amount: number;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  cash_payments: number;
  card_payments: number;
  bank_transfers: number;
  mobile_money_payments: number;
  insurance_payments: number;
  deposit_payments: number;
  // Enhanced details from specialized tables
  bank_transfer_details?: Array<{
    transfer_status: string;
    count: number;
    total_amount: number;
    total_fees: number;
  }>;
  insurance_details?: Array<{
    claim_status: string;
    count: number;
    total_amount: number;
    total_copay: number;
  }>;
  pos_details?: Array<{
    transaction_status: string;
    count: number;
    total_amount: number;
    total_fees: number;
  }>;
  cash_details?: Array<{
    movement_type: string;
    count: number;
    total_amount: number;
  }>;
  deposit_details?: {
    total_deposits: number;
    total_deposit_usage: number;
  };
}

export interface DepositSummary {
  total_deposits: number;
  total_amount: number;
  active_deposits: number;
  active_amount: number;
  used_deposits: number;
  used_amount: number;
}

// HMO Integration Types
export interface HMOPricingData {
  hmo_id: number;
  item_type: BillItemTypeEnum;
  item_id: number;
  covered_percentage: number;
  patient_co_pay_percentage: number;
  max_coverage_amount?: number;
  is_active: boolean;
}

// Audit and History Types
export interface BillingAuditLog {
  id: number;
  bill_id: number;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  old_values?: any;
  new_values?: any;
  performed_by: number;
  performed_at: Date;
  notes?: string;
}

export interface PaymentAuditLog {
  id: number;
  payment_id: number;
  action: 'CREATED' | 'PROCESSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  old_values?: any;
  new_values?: any;
  performed_by: number;
  performed_at: Date;
  notes?: string;
}
