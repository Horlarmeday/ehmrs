// ===== ACCOUNTING ENUMS =====

// Payment Status Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CONFIRMED = 'CONFIRMED',
  SETTLED = 'SETTLED',
}

// Bank Transfer Status Enums
export enum BankTransferStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// Billing Status Enums
export enum BillingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Billing Mode Enums
export enum BillingMode {
  CASH = 'CASH',
  INSURANCE = 'INSURANCE',
  WAIVER = 'WAIVER',
  OTHER = 'OTHER',
  FREE = 'FREE',
  WALLET = 'WALLET',
}

// Payment Collection Method Enums
export enum PaymentCollectionMethod {
  DEPOSIT = 'DEPOSIT',
  POINT_OF_SERVICE = 'POINT_OF_SERVICE',
  INSURANCE_CLAIM = 'INSURANCE_CLAIM',
  MIXED = 'MIXED',
}

// Payment Method Enums
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  DEPOSIT = 'DEPOSIT',
  INSURANCE = 'INSURANCE',
  WAIVER = 'WAIVER',
  OTHER = 'OTHER',
}

// Payment Type Enums
export enum PaymentType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  DEPOSIT = 'DEPOSIT',
  REFUND = 'REFUND',
  POINT_OF_SERVICE = 'POINT_OF_SERVICE',
}

// Deposit Status Enums
export enum DepositStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  REFUNDED = 'REFUNDED',
}

// Deposit Type Enums
export enum DepositType {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  INSURANCE = 'INSURANCE',
  OTHER = 'OTHER',
}

// Deposit Transaction Type Enums
export enum DepositTransactionType {
  CREATED = 'CREATED',
  USED = 'USED',
  REFUNDED = 'REFUNDED',
  ADJUSTED = 'ADJUSTED',
  EXPIRED = 'EXPIRED',
}

// Deposit Journal Entry Type Enums
export enum DepositJournalEntryType {
  DEPOSIT = 'DEPOSIT',
  USAGE = 'USAGE',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

// Chart of Account Type Enums
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

// Chart of Account Status Enums
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// Journal Entry Status Enums
export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  VOIDED = 'VOIDED',
  RECONCILED = 'RECONCILED',
}

// Bank Account Type Enums (Nigerian Context)
export enum BankAccountType {
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT',
  DOMICILIARY = 'DOMICILIARY',
}

// Cost Center Status Enums
export enum CostCenterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// Financial Period Status Enums
export enum FinancialPeriodStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
}

// HMO Claim Status Enums
export enum HMOClaimStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

// Transaction Type Enums
export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

// Currency Enums
export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

// Tax Type Enums
export enum TaxType {
  VAT = 'VAT',
  GST = 'GST',
  SALES_TAX = 'SALES_TAX',
  NONE = 'NONE',
}

// Discount Type Enums
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  NONE = 'NONE',
}

export enum BillItemPaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
}

export enum BillItemTypeEnum {
  DRUG = 'DRUG',
  TEST = 'TEST',
  INVESTIGATION = 'INVESTIGATION',
  SERVICE = 'SERVICE',
  ADDITIONAL_ITEM = 'ADDITIONAL_ITEM',
}

export enum PaymentProcessingStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum CashMovementType {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  CHANGE_GIVEN = 'CHANGE_GIVEN',
  OPENING_BALANCE = 'OPENING_BALANCE',
  CLOSING_BALANCE = 'CLOSING_BALANCE',
  RECONCILIATION = 'RECONCILIATION',
  ADJUSTMENT = 'ADJUSTMENT',
  REFUND = 'REFUND',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

