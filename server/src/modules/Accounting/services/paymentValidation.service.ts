import { Op, Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  ClinicalBill,
  ClinicalBillItem,
  ClinicalPayment,
  PatientDeposit,
  BankAccount,
  POSTerminal,
  Staff,
  FinancialPeriod,
} from '../../../database/models';
import {
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  BillingStatus,
  DepositStatus,
  FinancialPeriodStatus,
} from '../enums';
import { logger } from '../../../core/helpers/logger';
import dayjs from 'dayjs';

// ===== VALIDATION RESULT INTERFACES =====

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: ValidationMetadata;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'ERROR' | 'CRITICAL';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  recommendation?: string;
}

export interface ValidationMetadata {
  billBalance: number;
  remainingBalance: number;
  paymentLimits: PaymentLimits;
  approvalRequired: boolean;
  approvalThreshold: number;
  financialPeriodStatus: string;
}

export interface PaymentLimits {
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  remainingDaily: number;
  remainingMonthly: number;
}

export interface PaymentValidationContext {
  staffId: number;
  staffRole: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  billId: number;
  patientId: number;
  selectedItems: number[];
}

// ===== PAYMENT VALIDATION SERVICE =====

/**
 * Payment Validation Service
 *
 * This service handles all payment validation logic including:
 * - Business rule validation
 * - Payment limit validation
 * - Approval workflow validation
 * - Financial period validation
 * - Cross-field validation
 * - Status transition validation
 */
export class PaymentValidationService {
  // ===== CORE VALIDATION METHODS =====

  /**
   * Comprehensive payment validation
   */
  static async validatePayment(
    paymentData: any,
    context: PaymentValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: ValidationMetadata = {
      billBalance: 0,
      remainingBalance: 0,
      paymentLimits: {
        dailyLimit: 0,
        monthlyLimit: 0,
        dailyUsed: 0,
        monthlyUsed: 0,
        remainingDaily: 0,
        remainingMonthly: 0,
      },
      approvalRequired: false,
      approvalThreshold: 0,
      financialPeriodStatus: '',
    };

    try {
      // 1. Basic Data Validation
      const basicValidation = this.validateBasicData(paymentData, context);
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // 2. Bill and Item Validation
      const billValidation = await this.validateBillAndItems(
        context.billId,
        context.patientId,
        context.selectedItems,
        context.amount
      );
      errors.push(...billValidation.errors);
      warnings.push(...billValidation.warnings);
      if (billValidation.metadata) {
        metadata.billBalance = billValidation.metadata.billBalance;
        metadata.remainingBalance = billValidation.metadata.remainingBalance;
      }

      // 3. Financial Period Validation
      const periodValidation = await this.validateFinancialPeriod(context.paymentDate);
      errors.push(...periodValidation.errors);
      warnings.push(...periodValidation.warnings);
      if (periodValidation.metadata) {
        metadata.financialPeriodStatus = periodValidation.metadata.status;
      }

      // 4. Payment Method Validation
      const methodValidation = await this.validatePaymentMethod(
        context.paymentMethod,
        paymentData,
        context
      );
      errors.push(...methodValidation.errors);
      warnings.push(...methodValidation.warnings);

      // 5. Payment Limit Validation
      // const limitValidation = await this.validatePaymentLimits(
      //   context.staffId,
      //   context.paymentMethod,
      //   context.amount,
      //   context.paymentDate,
      //   transaction
      // );
      // errors.push(...limitValidation.errors);
      // warnings.push(...limitValidation.warnings);
      // if (limitValidation.metadata) {
      //   metadata.paymentLimits = limitValidation.metadata;
      // }

      // 6. Approval Workflow Validation
      // const approvalValidation = this.validateApprovalWorkflow(
      //   context.amount,
      //   context.staffRole,
      //   context.paymentMethod
      // );
      // errors.push(...approvalValidation.errors);
      // warnings.push(...approvalValidation.warnings);
      // if (approvalValidation.metadata) {
      //   metadata.approvalRequired = approvalValidation.metadata.approvalRequired;
      //   metadata.approvalThreshold = approvalValidation.metadata.approvalThreshold;
      // }

      // 7. Cross-field Validation
      const crossFieldValidation = this.validateCrossFields(paymentData, context);
      errors.push(...crossFieldValidation.errors);
      warnings.push(...crossFieldValidation.warnings);

      // 8. Business Rule Validation
      const businessRuleValidation = await this.validateBusinessRules(paymentData, context);
      errors.push(...businessRuleValidation.errors);
      warnings.push(...businessRuleValidation.warnings);

      // Determine overall validation result
      const isValid = errors.filter(e => e.severity === 'CRITICAL').length === 0;

      return {
        isValid,
        errors,
        warnings,
        metadata,
      };
    } catch (error) {
      logger.error('Payment validation error:', error);
      errors.push({
        field: 'system',
        code: 'VALIDATION_ERROR',
        message: 'System error during validation',
        severity: 'CRITICAL',
      });

      return {
        isValid: false,
        errors,
        warnings,
        metadata,
      };
    }
  }

  // ===== VALIDATION COMPONENTS =====

  /**
   * Validate basic payment data
   */
  private static validateBasicData(
    paymentData: any,
    context: PaymentValidationContext
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Amount validation
    if (context.amount <= 0) {
      errors.push({
        field: 'amount',
        code: 'INVALID_AMOUNT',
        message: 'Payment amount must be greater than zero',
        severity: 'CRITICAL',
      });
    }

    // Amount precision validation
    const amountStr = context.amount.toString();
    if (amountStr.includes('.') && amountStr.split('.')[1].length > 2) {
      errors.push({
        field: 'amount',
        code: 'INVALID_PRECISION',
        message: 'Payment amount cannot have more than 2 decimal places',
        severity: 'ERROR',
      });
    }

    // Payment date validation
    if (context.paymentDate > new Date()) {
      warnings.push({
        field: 'payment_date',
        code: 'FUTURE_DATE',
        message: 'Payment date is in the future',
        recommendation: 'Consider using current date for immediate payments',
      });
    }

    // Payment type validation
    if (context.paymentType === PaymentType.PARTIAL && context.amount <= 0) {
      errors.push({
        field: 'payment_type',
        code: 'INVALID_PARTIAL_PAYMENT',
        message: 'Partial payment amount must be greater than zero',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate bill and selected items
   */
  private static async validateBillAndItems(
    billId: number,
    patientId: number,
    selectedItems: number[],
    amount: number
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[]; metadata?: any }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: any = {};

    try {
      // Get bill with items
      const bill = await ClinicalBill.findByPk(billId, {
        include: [{ model: ClinicalBillItem, as: 'billItems' }],
      });

      if (!bill) {
        errors.push({
          field: 'bill_id',
          code: 'BILL_NOT_FOUND',
          message: 'Bill not found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      // Validate patient match
      if (bill.patient_id !== patientId) {
        errors.push({
          field: 'patient_id',
          code: 'PATIENT_MISMATCH',
          message: 'Patient ID does not match bill patient',
          severity: 'CRITICAL',
        });
      }

      // Validate bill status
      if (bill.billing_status === BillingStatus.CANCELLED) {
        errors.push({
          field: 'bill_id',
          code: 'BILL_CANCELLED',
          message: 'Cannot process payment for cancelled bill',
          severity: 'CRITICAL',
        });
      }

      if (bill.billing_status === BillingStatus.REJECTED) {
        errors.push({
          field: 'bill_id',
          code: 'BILL_REJECTED',
          message: 'Cannot process payment for rejected bill',
          severity: 'CRITICAL',
        });
      }

      // Validate selected items
      const billItemIds = bill.billItems.map(item => item.id);
      const invalidItems = selectedItems.filter(id => !billItemIds.includes(id));

      if (invalidItems.length > 0) {
        errors.push({
          field: 'selected_items',
          code: 'INVALID_ITEMS',
          message: `Invalid item IDs: ${invalidItems.join(', ')}`,
          severity: 'CRITICAL',
        });
      }

      // Calculate bill total and remaining balance
      const selectedBillItems = bill.billItems.filter(item => selectedItems.includes(item.id));
      const totalBill = bill.billItems.reduce(
        (sum, item) => sum + parseFloat(item.final_price.toString()),
        0
      );

      // const billTotal = selectedBillItems.reduce(
      //   (sum, item) => sum + parseFloat(item.final_price.toString()),
      //   0
      // );

      const existingPayments = await ClinicalPayment.sum('amount', {
        where: { bill_id: billId },
      });

      const remainingBalance = totalBill - (existingPayments || 0);
      metadata.billBalance = totalBill;
      metadata.remainingBalance = remainingBalance;

      // Validate payment amount against remaining balance
      if (amount > remainingBalance) {
        errors.push({
          field: 'amount',
          code: 'AMOUNT_EXCEEDS_BALANCE',
          message: `Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`,
          severity: 'CRITICAL',
        });
      }

      // Check for overpayment
      if (amount < remainingBalance && amount > 0) {
        warnings.push({
          field: 'amount',
          code: 'PARTIAL_PAYMENT',
          message: `Partial payment detected. Remaining balance: ${remainingBalance - amount}`,
          recommendation: 'Consider collecting full amount or process as partial payment',
        });
      }
    } catch (error) {
      logger.error('Bill validation error:', error);
      errors.push({
        field: 'bill_id',
        code: 'BILL_VALIDATION_ERROR',
        message: 'Error validating bill and items',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings, metadata };
  }

  /**
   * Validate financial period
   */
  private static async validateFinancialPeriod(
    paymentDate: Date
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[]; metadata?: any }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: any = {};

    try {
      // Find current financial period
      const currentPeriod = await FinancialPeriod.findOne({
        where: { is_current: true },
      });

      if (!currentPeriod) {
        errors.push({
          field: 'financial_period',
          code: 'NO_CURRENT_PERIOD',
          message: 'No current financial period found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      metadata.status = currentPeriod.status;

      // Check if period is open
      if (currentPeriod.status !== FinancialPeriodStatus.OPEN) {
        errors.push({
          field: 'financial_period',
          code: 'PERIOD_CLOSED',
          message: `Financial period ${
            currentPeriod.name
          } is ${currentPeriod.status.toLowerCase()}`,
          severity: 'CRITICAL',
        });
      }

      // Check if payment date is within period
      const periodStart = new Date(currentPeriod.start_date);
      const periodEnd = new Date(currentPeriod.end_date);

      if (paymentDate < periodStart || paymentDate > periodEnd) {
        errors.push({
          field: 'payment_date',
          code: 'DATE_OUT_OF_PERIOD',
          message: `Payment date must be within financial period: ${periodStart.toDateString()} - ${periodEnd.toDateString()}`,
          severity: 'CRITICAL',
        });
      }
    } catch (error) {
      logger.error('Financial period validation error:', error);
      errors.push({
        field: 'financial_period',
        code: 'PERIOD_VALIDATION_ERROR',
        message: 'Error validating financial period',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings, metadata };
  }

  /**
   * Validate payment method specific requirements
   */
  private static async validatePaymentMethod(
    paymentMethod: PaymentMethod,
    paymentData: any,
    context: PaymentValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      switch (paymentMethod) {
        case PaymentMethod.CASH:
          const cashValidation = await this.validateCashPayment(paymentData, context);
          errors.push(...cashValidation.errors);
          warnings.push(...cashValidation.warnings);
          break;

        case PaymentMethod.CARD:
          const cardValidation = await this.validateCardPayment(paymentData);
          errors.push(...cardValidation.errors);
          warnings.push(...cardValidation.warnings);
          break;

        case PaymentMethod.BANK_TRANSFER:
          const bankValidation = await this.validateBankTransferPayment(paymentData);
          errors.push(...bankValidation.errors);
          warnings.push(...bankValidation.warnings);
          break;

        case PaymentMethod.INSURANCE:
          const insuranceValidation = this.validateInsurancePayment(paymentData);
          errors.push(...insuranceValidation.errors);
          warnings.push(...insuranceValidation.warnings);
          break;

        case PaymentMethod.DEPOSIT:
          const depositValidation = await this.validateDepositPayment(paymentData, context);
          errors.push(...depositValidation.errors);
          warnings.push(...depositValidation.warnings);
          break;

        case PaymentMethod.OTHER:
          const otherValidation = this.validateOtherPayment(paymentData);
          errors.push(...otherValidation.errors);
          warnings.push(...otherValidation.warnings);
          break;

        default:
          errors.push({
            field: 'payment_method',
            code: 'INVALID_METHOD',
            message: `Unsupported payment method: ${paymentMethod}`,
            severity: 'CRITICAL',
          });
      }
    } catch (error) {
      logger.error('Payment method validation error:', error);
      errors.push({
        field: 'payment_method',
        code: 'METHOD_VALIDATION_ERROR',
        message: 'Error validating payment method',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate cash payment
   */
  private static async validateCashPayment(
    paymentData: any,
    context: PaymentValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { cash_received, change_given, cash_register_id } = paymentData;

    // Validate cash register ID
    if (!cash_register_id) {
      errors.push({
        field: 'cash_register_id',
        code: 'CASH_REGISTER_REQUIRED',
        message: 'Cash register ID is required for cash payments',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    // Validate cash register exists and is open
    try {
      const { CashRegister } = await import('../../../database/models/cashRegister');
      const cashRegister = await CashRegister.findByPk(cash_register_id);

      if (!cashRegister) {
        errors.push({
          field: 'cash_register_id',
          code: 'CASH_REGISTER_NOT_FOUND',
          message: 'The requested cash register could not be found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      if (cashRegister.status !== 'OPEN') {
        errors.push({
          field: 'cash_register_id',
          code: 'CASH_REGISTER_NOT_OPEN',
          message: `Cash register ${cashRegister.register_code} is not open. Current status: ${cashRegister.status}`,
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      if (!cashRegister.is_active) {
        errors.push({
          field: 'cash_register_id',
          code: 'CASH_REGISTER_INACTIVE',
          message: `Cash register ${cashRegister.register_code} is inactive`,
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }
    } catch (error) {
      errors.push({
        field: 'cash_register_id',
        code: 'CASH_REGISTER_VALIDATION_ERROR',
        message: 'Error validating cash register',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    // Validate cash received
    if (!cash_received || cash_received < context.amount) {
      errors.push({
        field: 'cash_received',
        code: 'INSUFFICIENT_CASH',
        message: `Cash received (${cash_received}) must be greater than or equal to payment amount (${context.amount})`,
        severity: 'CRITICAL',
      });
    }

    // Validate change calculation
    if (cash_received && change_given !== undefined) {
      const calculatedChange = cash_received - context.amount;
      if (Math.abs(change_given - calculatedChange) > 0.01) {
        errors.push({
          field: 'change_given',
          code: 'INVALID_CHANGE',
          message: `Change given (${change_given}) does not match calculated change (${calculatedChange})`,
          severity: 'ERROR',
        });
      }
    }

    // Check for large cash payments
    if (context.amount > 100000000) {
      warnings.push({
        field: 'amount',
        code: 'LARGE_CASH_PAYMENT',
        message: 'Large cash payment detected',
        recommendation: 'Consider using alternative payment methods for large amounts',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate card payment
   */
  private static async validateCardPayment(
    paymentData: any
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { pos_terminal_id } = paymentData;

    if (!pos_terminal_id) {
      errors.push({
        field: 'pos_terminal_id',
        code: 'POS_TERMINAL_REQUIRED',
        message: 'POS terminal ID is required for card payments',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    try {
      // Validate POS terminal
      const posTerminal = await POSTerminal.findByPk(pos_terminal_id);

      if (!posTerminal) {
        errors.push({
          field: 'pos_terminal_id',
          code: 'POS_TERMINAL_NOT_FOUND',
          message: 'POS terminal not found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      if (!posTerminal.is_active) {
        errors.push({
          field: 'pos_terminal_id',
          code: 'POS_TERMINAL_INACTIVE',
          message: 'POS terminal is inactive',
          severity: 'CRITICAL',
        });
      }

      // Check daily limits
      if (posTerminal.daily_transaction_limit) {
        const todayTransactions = await ClinicalPayment.count({
          where: {
            pos_terminal_id,
            payment_method: PaymentMethod.CARD,
            createdAt: {
              [Op.gte]: dayjs()
                .startOf('day')
                .toDate(),
            },
          },
        });

        if (todayTransactions >= posTerminal.daily_transaction_limit) {
          errors.push({
            field: 'pos_terminal_id',
            code: 'DAILY_LIMIT_EXCEEDED',
            message: 'Daily transaction limit exceeded for POS terminal',
            severity: 'CRITICAL',
          });
        }
      }

      // Check amount limits
      if (posTerminal.daily_amount_limit) {
        const todayAmount = await ClinicalPayment.sum('amount', {
          where: {
            pos_terminal_id,
            payment_method: PaymentMethod.CARD,
            createdAt: {
              [Op.gte]: dayjs()
                .startOf('day')
                .toDate(),
            },
          },
        });

        if ((todayAmount || 0) + paymentData.amount > posTerminal.daily_amount_limit) {
          errors.push({
            field: 'amount',
            code: 'DAILY_AMOUNT_LIMIT_EXCEEDED',
            message: 'Daily amount limit exceeded for POS terminal',
            severity: 'CRITICAL',
          });
        }
      }
    } catch (error) {
      logger.error('POS terminal validation error:', error);
      errors.push({
        field: 'pos_terminal_id',
        code: 'POS_VALIDATION_ERROR',
        message: 'Error validating POS terminal',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate bank transfer payment
   */
  private static async validateBankTransferPayment(
    paymentData: any
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { bank_account_id, bank_reference } = paymentData;

    if (!bank_account_id) {
      errors.push({
        field: 'bank_account_id',
        code: 'BANK_ACCOUNT_REQUIRED',
        message: 'Bank account ID is required for bank transfer payments',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    if (!bank_reference) {
      errors.push({
        field: 'bank_reference',
        code: 'BANK_REFERENCE_REQUIRED',
        message: 'Bank reference is required for bank transfer payments',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    try {
      // Validate bank account
      const bankAccount = await BankAccount.findByPk(bank_account_id);

      if (!bankAccount) {
        errors.push({
          field: 'bank_account_id',
          code: 'BANK_ACCOUNT_NOT_FOUND',
          message: 'Bank account not found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      if (!bankAccount.is_active) {
        errors.push({
          field: 'bank_account_id',
          code: 'BANK_ACCOUNT_INACTIVE',
          message: 'Bank account is inactive',
          severity: 'CRITICAL',
        });
      }

      // Check for duplicate bank reference
      const existingPayment = await ClinicalPayment.findOne({
        where: { bank_reference },
      });

      if (existingPayment) {
        errors.push({
          field: 'bank_reference',
          code: 'DUPLICATE_BANK_REFERENCE',
          message: 'Bank reference already exists',
          severity: 'CRITICAL',
        });
      }
    } catch (error) {
      logger.error('Bank account validation error:', error);
      errors.push({
        field: 'bank_account_id',
        code: 'BANK_VALIDATION_ERROR',
        message: 'Error validating bank account',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate insurance payment
   */
  private static validateInsurancePayment(
    paymentData: any
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { insurance_provider, policy_number, copay_amount } = paymentData;

    if (!insurance_provider) {
      errors.push({
        field: 'insurance_provider',
        code: 'INSURANCE_PROVIDER_REQUIRED',
        message: 'Insurance provider is required for insurance payments',
        severity: 'CRITICAL',
      });
    }

    if (copay_amount !== undefined && copay_amount < 0) {
      errors.push({
        field: 'copay_amount',
        code: 'INVALID_COPAY',
        message: 'Co-pay amount cannot be negative',
        severity: 'ERROR',
      });
    }

    if (copay_amount !== undefined && copay_amount > paymentData.amount) {
      errors.push({
        field: 'copay_amount',
        code: 'COPAY_EXCEEDS_AMOUNT',
        message: 'Co-pay amount cannot exceed payment amount',
        severity: 'ERROR',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate deposit payment
   */
  private static async validateDepositPayment(
    paymentData: any,
    context: PaymentValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { deposit_usage } = paymentData;

    if (!deposit_usage || deposit_usage <= 0) {
      errors.push({
        field: 'deposit_usage',
        code: 'INVALID_DEPOSIT_USAGE',
        message: 'Deposit usage amount is required and must be greater than zero',
        severity: 'CRITICAL',
      });
      return { errors, warnings };
    }

    if (deposit_usage > context.amount) {
      errors.push({
        field: 'deposit_usage',
        code: 'DEPOSIT_USAGE_EXCEEDS_AMOUNT',
        message: 'Deposit usage cannot exceed payment amount',
        severity: 'ERROR',
      });
    }

    try {
      // Validate patient deposit
      const patientDeposit = await PatientDeposit.findOne({
        where: {
          patient_id: context.patientId,
          status: DepositStatus.ACTIVE,
        },
      });

      if (!patientDeposit) {
        errors.push({
          field: 'deposit_usage',
          code: 'NO_ACTIVE_DEPOSIT',
          message: 'No active patient deposit found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      if (patientDeposit.amount < deposit_usage) {
        errors.push({
          field: 'deposit_usage',
          code: 'INSUFFICIENT_DEPOSIT',
          message: `Insufficient deposit balance. Available: ${patientDeposit.amount}, Requested: ${deposit_usage}`,
          severity: 'CRITICAL',
        });
      }

      // Check if deposit is sufficient for remaining balance
      const remainingBalance = context.amount - deposit_usage;
      if (remainingBalance > 0) {
        warnings.push({
          field: 'deposit_usage',
          code: 'PARTIAL_DEPOSIT_USAGE',
          message: `Deposit covers ${deposit_usage} of ${context.amount}. Remaining: ${remainingBalance}`,
          recommendation: 'Consider using additional payment method for remaining amount',
        });
      }
    } catch (error) {
      logger.error('Deposit validation error:', error);
      errors.push({
        field: 'deposit_usage',
        code: 'DEPOSIT_VALIDATION_ERROR',
        message: 'Error validating patient deposit',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate other payment method
   */
  private static validateOtherPayment(
    paymentData: any
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // For other payment methods, require additional notes
    if (!paymentData.notes || paymentData.notes.trim().length < 10) {
      warnings.push({
        field: 'notes',
        code: 'INSUFFICIENT_NOTES',
        message: 'Detailed notes are recommended for other payment methods',
        recommendation: 'Provide detailed explanation of payment method and process',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate payment limits
   */
  private static async validatePaymentLimits(
    staffId: number,
    paymentMethod: PaymentMethod,
    amount: number,
    paymentDate: Date,
    transaction?: Transaction
  ): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata?: PaymentLimits;
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: PaymentLimits = {
      dailyLimit: 0,
      monthlyLimit: 0,
      dailyUsed: 0,
      monthlyUsed: 0,
      remainingDaily: 0,
      remainingMonthly: 0,
    };

    try {
      // Get staff payment limits based on role
      const staff = await Staff.findByPk(staffId, { transaction });
      if (!staff) {
        errors.push({
          field: 'staff_id',
          code: 'STAFF_NOT_FOUND',
          message: 'Staff member not found',
          severity: 'CRITICAL',
        });
        return { errors, warnings };
      }

      // Define payment limits based on staff role
      let dailyLimit = 10000; // Default NGN10,000
      let monthlyLimit = 100000; // Default NGN100,000

      switch (staff.role) {
        case 'ADMIN':
          dailyLimit = 50000;
          monthlyLimit = 500000;
          break;
        case 'ACCOUNTANT':
          dailyLimit = 25000;
          monthlyLimit = 250000;
          break;
        case 'CASHIER':
          dailyLimit = 15000;
          monthlyLimit = 150000;
          break;
        case 'NURSE':
        case 'DOCTOR':
          dailyLimit = 5000;
          monthlyLimit = 50000;
          break;
        default:
          dailyLimit = 5000;
          monthlyLimit = 50000;
      }

      metadata.dailyLimit = dailyLimit;
      metadata.monthlyLimit = monthlyLimit;

      // Calculate daily usage
      const todayStart = new Date(paymentDate);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const dailyUsed = await ClinicalPayment.sum('amount', {
        where: {
          processed_by: staffId,
          payment_method: paymentMethod,
          processed_at: {
            [Op.gte]: todayStart,
            [Op.lt]: todayEnd,
          },
        },
        transaction,
      });

      metadata.dailyUsed = dailyUsed || 0;
      metadata.remainingDaily = dailyLimit - (dailyUsed || 0);

      // Calculate monthly usage
      const monthStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
      const monthEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);

      const monthlyUsed = await ClinicalPayment.sum('amount', {
        where: {
          processed_by: staffId,
          payment_method: paymentMethod,
          processed_at: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd,
          },
        },
        transaction,
      });

      metadata.monthlyUsed = monthlyUsed || 0;
      metadata.remainingMonthly = monthlyLimit - (monthlyUsed || 0);

      // Validate daily limit
      if ((dailyUsed || 0) + amount > dailyLimit) {
        errors.push({
          field: 'amount',
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Daily payment limit exceeded. Limit: ${dailyLimit}, Used: ${dailyUsed}, Requested: ${amount}`,
          severity: 'CRITICAL',
        });
      }

      // Validate monthly limit
      if ((monthlyUsed || 0) + amount > monthlyLimit) {
        errors.push({
          field: 'amount',
          code: 'MONTHLY_LIMIT_EXCEEDED',
          message: `Monthly payment limit exceeded. Limit: ${monthlyLimit}, Used: ${monthlyUsed}, Requested: ${amount}`,
          severity: 'CRITICAL',
        });
      }

      // Check for approaching limits
      if ((dailyUsed || 0) + amount > dailyLimit * 0.8) {
        warnings.push({
          field: 'amount',
          code: 'APPROACHING_DAILY_LIMIT',
          message: 'Approaching daily payment limit',
          recommendation: 'Consider processing payment tomorrow or contact supervisor',
        });
      }

      if ((monthlyUsed || 0) + amount > monthlyLimit * 0.8) {
        warnings.push({
          field: 'amount',
          code: 'APPROACHING_MONTHLY_LIMIT',
          message: 'Approaching monthly payment limit',
          recommendation: 'Consider processing payment tomorrow or contact supervisor',
        });
      }
    } catch (error) {
      logger.error('Payment limit validation error:', error);
      errors.push({
        field: 'amount',
        code: 'LIMIT_VALIDATION_ERROR',
        message: 'Error validating payment limits',
        severity: 'CRITICAL',
      });
    }

    return { errors, warnings, metadata };
  }

  /**
   * Validate approval workflow
   */
  private static validateApprovalWorkflow(
    amount: number,
    staffRole: string,
    paymentMethod: PaymentMethod
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; metadata?: any } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: any = {};

    // Define approval thresholds
    let approvalThreshold = 5000; // Default $5,000
    let approvalRequired = false;

    // Adjust thresholds based on staff role
    switch (staffRole) {
      case 'ADMIN':
        approvalThreshold = 25000;
        break;
      case 'ACCOUNTANT':
        approvalThreshold = 15000;
        break;
      case 'CASHIER':
        approvalThreshold = 5000;
        break;
      case 'NURSE':
      case 'DOCTOR':
        approvalThreshold = 2000;
        break;
      default:
        approvalThreshold = 1000;
    }

    // Check if approval is required
    if (amount > approvalThreshold) {
      approvalRequired = true;
      errors.push({
        field: 'amount',
        code: 'APPROVAL_REQUIRED',
        message: `Payment amount (${amount}) exceeds approval threshold (${approvalThreshold})`,
        severity: 'CRITICAL',
      });
    }

    // Additional approval requirements for certain payment methods
    if (paymentMethod === PaymentMethod.CASH && amount > 10000) {
      approvalRequired = true;
      errors.push({
        field: 'amount',
        code: 'CASH_APPROVAL_REQUIRED',
        message: 'Large cash payment requires additional approval',
        severity: 'CRITICAL',
      });
    }

    if (paymentMethod === PaymentMethod.BANK_TRANSFER && amount > 50000) {
      approvalRequired = true;
      errors.push({
        field: 'amount',
        code: 'BANK_TRANSFER_APPROVAL_REQUIRED',
        message: 'Large bank transfer requires additional approval',
        severity: 'CRITICAL',
      });
    }

    metadata.approvalRequired = approvalRequired;
    metadata.approvalThreshold = approvalThreshold;

    return { errors, warnings, metadata };
  }

  /**
   * Validate cross-field relationships
   */
  private static validateCrossFields(
    paymentData: any,
    context: PaymentValidationContext
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate payment type consistency
    if (context.paymentType === PaymentType.FULL && context.amount < context.amount) {
      errors.push({
        field: 'payment_type',
        code: 'INCONSISTENT_FULL_PAYMENT',
        message: 'Full payment amount must equal bill amount',
        severity: 'ERROR',
      });
    }

    // Validate partial payment logic
    if (context.paymentType === PaymentType.PARTIAL && context.amount >= context.amount) {
      warnings.push({
        field: 'payment_type',
        code: 'PARTIAL_PAYMENT_AMOUNT',
        message: 'Payment amount equals or exceeds bill amount. Consider using FULL payment type.',
        recommendation: 'Change payment type to FULL or reduce payment amount',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate business rules
   */
  private static async validateBusinessRules(
    paymentData: any,
    context: PaymentValidationContext
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Business rule: Check for duplicate payments
      const existingPayment = await ClinicalPayment.findOne({
        where: {
          bill_id: context.billId,
          patient_id: context.patientId,
          amount: context.amount,
          payment_method: context.paymentMethod,
          createdAt: {
            [Op.gte]: dayjs()
              .subtract(5, 'minute')
              .toDate(), // Last 5 minutes
          },
        },
      });

      if (existingPayment) {
        warnings.push({
          field: 'amount',
          code: 'POTENTIAL_DUPLICATE',
          message: 'Similar payment processed recently. Verify this is not a duplicate.',
          recommendation: 'Check payment history for potential duplicates',
        });
      }

      // Business rule: Check for unusual payment patterns
      const recentPayments = await ClinicalPayment.findAll({
        where: {
          patient_id: context.patientId,
          createdAt: {
            [Op.gte]: dayjs()
              .subtract(24, 'hour')
              .toDate(), // Last 24 hours
          },
        },
      });

      if (recentPayments.length > 5) {
        warnings.push({
          field: 'patient_id',
          code: 'FREQUENT_PAYMENTS',
          message: 'Patient has made multiple payments in the last 24 hours',
          recommendation: 'Verify payment necessity and patient understanding',
        });
      }

      // Business rule: Check for weekend/holiday payments
      const dayOfWeek = context.paymentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sunday or Saturday
        warnings.push({
          field: 'payment_date',
          code: 'WEEKEND_PAYMENT',
          message: 'Payment processed on weekend',
          recommendation: 'Verify payment urgency and staff availability',
        });
      }
    } catch (error) {
      logger.error('Business rule validation error:', error);
      warnings.push({
        field: 'system',
        code: 'BUSINESS_RULE_VALIDATION_ERROR',
        message: 'Error validating business rules',
        recommendation: 'Contact system administrator',
      });
    }

    return { errors, warnings };
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate unique payment reference
   */
  static generatePaymentReference(paymentMethod: PaymentMethod): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const methodPrefix = paymentMethod.substring(0, 2).toUpperCase();

    return `${methodPrefix}-${timestamp}-${random}`;
  }

  /**
   * Validate payment reference format
   */
  static validatePaymentReference(reference: string): boolean {
    const referencePattern = /^[A-Z]{2}-\d{13}-\d{3}$/;
    return referencePattern.test(reference);
  }

  /**
   * Check if payment requires approval
   */
  static requiresApproval(amount: number, staffRole: string): boolean {
    const thresholds = {
      ADMIN: 25000,
      ACCOUNTANT: 15000,
      CASHIER: 5000,
      NURSE: 2000,
      DOCTOR: 2000,
      DEFAULT: 1000,
    };

    const threshold = thresholds[staffRole] || thresholds['DEFAULT'];
    return amount > threshold;
  }

  /**
   * Get payment validation summary
   */
  static getValidationSummary(validationResult: ValidationResult): string {
    const { errors, warnings } = validationResult;
    const criticalErrors = errors.filter(e => e.severity === 'CRITICAL').length;
    const regularErrors = errors.filter(e => e.severity === 'ERROR').length;
    const warningCount = warnings.length;

    if (criticalErrors > 0) {
      return `❌ Validation Failed: ${criticalErrors} critical errors, ${regularErrors} errors, ${warningCount} warnings`;
    } else if (regularErrors > 0) {
      return `⚠️ Validation Failed: ${regularErrors} errors, ${warningCount} warnings`;
    } else if (warningCount > 0) {
      return `⚠️ Validation Passed with ${warningCount} warnings`;
    } else {
      return '✅ Validation Passed';
    }
  }

  /**
   * Validate mixed payment (combination of methods)
   */
  static async validateMixedPayment(
    paymentData: any,
    context: PaymentValidationContext,
    transaction?: Transaction
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: ValidationMetadata = {
      billBalance: 0,
      remainingBalance: 0,
      paymentLimits: {
        dailyLimit: 0,
        monthlyLimit: 0,
        dailyUsed: 0,
        monthlyUsed: 0,
        remainingDaily: 0,
        remainingMonthly: 0,
      },
      approvalRequired: false,
      approvalThreshold: 0,
      financialPeriodStatus: '',
    };

    try {
      // Validate mixed payment breakdown
      if (
        !paymentData.mixed_payment_breakdown ||
        !Array.isArray(paymentData.mixed_payment_breakdown)
      ) {
        errors.push({
          field: 'mixed_payment_breakdown',
          code: 'INVALID_MIXED_PAYMENT_BREAKDOWN',
          message: 'Mixed payment breakdown is required and must be an array',
          severity: 'CRITICAL',
        });
        return { isValid: false, errors, warnings, metadata };
      }

      // Validate breakdown array is not empty
      if (paymentData.mixed_payment_breakdown.length === 0) {
        errors.push({
          field: 'mixed_payment_breakdown',
          code: 'EMPTY_MIXED_PAYMENT_BREAKDOWN',
          message: 'Mixed payment breakdown cannot be empty',
          severity: 'CRITICAL',
        });
        return { isValid: false, errors, warnings, metadata };
      }

      // Validate total amount matches breakdown
      const breakdownTotal = paymentData.mixed_payment_breakdown.reduce(
        (sum: number, item: any) => sum + (item.amount || 0),
        0
      );

      if (Math.abs(breakdownTotal - context.amount) > 0.01) {
        // Allow for small decimal differences
        errors.push({
          field: 'mixed_payment_breakdown',
          code: 'MIXED_PAYMENT_AMOUNT_MISMATCH',
          message: `Total breakdown amount (${breakdownTotal}) does not match payment amount (${context.amount})`,
          severity: 'CRITICAL',
        });
      }

      // Validate each breakdown item
      for (let i = 0; i < paymentData.mixed_payment_breakdown.length; i++) {
        const item = paymentData.mixed_payment_breakdown[i];
        const itemErrors = await this.validateMixedPaymentItem(item, i, context, transaction);
        errors.push(...itemErrors);
      }

      // Validate no duplicate payment methods
      const methods = paymentData.mixed_payment_breakdown.map((item: any) => item.method);
      const uniqueMethods = new Set(methods);
      if (methods.length !== uniqueMethods.size) {
        errors.push({
          field: 'mixed_payment_breakdown',
          code: 'DUPLICATE_PAYMENT_METHODS',
          message: 'Mixed payment cannot have duplicate payment methods',
          severity: 'CRITICAL',
        });
      }

      // Validate minimum breakdown items
      if (paymentData.mixed_payment_breakdown.length < 2) {
        errors.push({
          field: 'mixed_payment_breakdown',
          code: 'INSUFFICIENT_MIXED_PAYMENT_METHODS',
          message: 'Mixed payment must have at least 2 different payment methods',
          severity: 'CRITICAL',
        });
      }

      // Business rule: Mixed payments over certain amount require approval
      if (context.amount > 10000) {
        // 10,000 threshold for mixed payments
        metadata.approvalRequired = true;
        metadata.approvalThreshold = 10000;
        warnings.push({
          field: 'amount',
          code: 'MIXED_PAYMENT_APPROVAL_REQUIRED',
          message: 'Mixed payment amount exceeds approval threshold',
          recommendation: 'This payment requires manager approval',
        });
      }
    } catch (error) {
      logger.error('Mixed payment validation error:', error);
      errors.push({
        field: 'system',
        code: 'MIXED_PAYMENT_VALIDATION_ERROR',
        message: 'Error validating mixed payment',
        severity: 'CRITICAL',
      });
    }

    return { isValid: errors.length === 0, errors, warnings, metadata };
  }

  /**
   * Validate individual mixed payment breakdown item
   */
  private static async validateMixedPaymentItem(
    item: any,
    index: number,
    context: PaymentValidationContext,
    transaction?: Transaction
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Validate required fields
      if (!item.method) {
        errors.push({
          field: `mixed_payment_breakdown[${index}].method`,
          code: 'MISSING_PAYMENT_METHOD',
          message: 'Payment method is required for each breakdown item',
          severity: 'CRITICAL',
        });
      }

      if (!item.amount || item.amount <= 0) {
        errors.push({
          field: `mixed_payment_breakdown[${index}].amount`,
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than zero for each breakdown item',
          severity: 'CRITICAL',
        });
      }

      // Validate method-specific data
      switch (item.method) {
        case 'CASH':
          if (!item.cash_register_id) {
            errors.push({
              field: `mixed_payment_breakdown[${index}].cash_register_id`,
              code: 'MISSING_CASH_REGISTER',
              message: 'Cash register ID is required for cash payments',
              severity: 'CRITICAL',
            });
          }
          break;

        case 'DEPOSIT':
          if (!item.deposit_id) {
            errors.push({
              field: `mixed_payment_breakdown[${index}].deposit_id`,
              code: 'MISSING_DEPOSIT_ID',
              message: 'Deposit ID is required for deposit payments',
              severity: 'CRITICAL',
            });
          }
          break;

        case 'POS_TERMINAL':
          if (!item.card_type) {
            errors.push({
              field: `mixed_payment_breakdown[${index}].card_type`,
              code: 'MISSING_CARD_TYPE',
              message: 'Card type is required for POS terminal payments',
              severity: 'CRITICAL',
            });
          }
          break;

        case 'BANK_TRANSFER':
          if (!item.bank_account_id) {
            errors.push({
              field: `mixed_payment_breakdown[${index}].bank_account_id`,
              code: 'MISSING_BANK_ACCOUNT',
              message: 'Bank account ID is required for bank transfer payments',
              severity: 'CRITICAL',
            });
          }
          break;

        case 'INSURANCE':
          if (!item.insurance_provider) {
            errors.push({
              field: `mixed_payment_breakdown[${index}].bank_account_id`,
              code: 'MISSING_INSURANCE_PROVIDER',
              message: 'Insurance provider is required for insurance payments',
              severity: 'CRITICAL',
            });
          }
          break;
      }
    } catch (error) {
      logger.error(`Mixed payment item validation error for index ${index}:`, error);
      errors.push({
        field: `mixed_payment_breakdown[${index}]`,
        code: 'ITEM_VALIDATION_ERROR',
        message: 'Error validating mixed payment item',
        severity: 'CRITICAL',
      });
    }

    return errors;
  }
}

export default PaymentValidationService;
