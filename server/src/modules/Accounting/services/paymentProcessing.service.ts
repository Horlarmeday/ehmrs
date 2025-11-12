import { Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  ClinicalBill,
  ClinicalBillItem,
  ClinicalPayment,
  PatientDeposit,
  BankAccount,
  POSTerminal,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  PrescribedDrug,
  PrescribedTest,
  PrescribedInvestigation,
  PrescribedService,
  PrescribedAdditionalItem,
  CashTransaction,
  BankTransfer,
  InsuranceClaim,
  POSTerminalTransaction,
  ClinicalPaymentItem,
  DrugPrescription,
  TestPrescription,
  InvestigationPrescription,
  Service,
} from '../../../database/models';
import {
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  BillingStatus,
  JournalEntryStatus,
  DepositStatus,
  BillItemTypeEnum,
} from '../enums';
import { PaymentValidationService, PaymentValidationContext } from './paymentValidation.service';
import { logger } from '../../../core/helpers/logger';
import { PatientDepositService } from './patientDeposit.service';
import sequelizeConnection from '../../../database/config/data-source';
import { PaymentItemStatus } from '../../../database/models/clinicalPaymentItem';

// ===== PAYMENT RESULT INTERFACES =====

interface BasePaymentResult {
  payment: ClinicalPayment;
}

interface CashPaymentResult extends BasePaymentResult {
  method: 'CASH';
  cash_received?: number;
  change_given?: number;
  cash_register?: any; // CashRegister model
}

interface CardPaymentResult extends BasePaymentResult {
  method: 'CARD';
  pos_terminal: POSTerminal;
  bank_account?: BankAccount;
}

interface BankTransferPaymentResult extends BasePaymentResult {
  method: 'BANK_TRANSFER';
  bank_account: BankAccount;
  bank_reference: string;
}

interface InsurancePaymentResult extends BasePaymentResult {
  method: 'INSURANCE';
  insurance_provider: string;
  policy_number?: string;
  copay_amount?: number;
}

interface DepositPaymentResult extends BasePaymentResult {
  method: 'DEPOSIT';
  deposit_usage: number;
  remaining_balance: number;
}

interface OtherPaymentResult extends BasePaymentResult {
  method: 'OTHER';
}

interface MobileMoneyPaymentResult extends BasePaymentResult {
  method: 'MOBILE_MONEY';
  mobile_money_provider: string;
  transaction_reference?: string;
}

interface WaiverPaymentResult extends BasePaymentResult {
  method: 'WAIVER';
  waiver_reason: string;
  approved_by?: number;
}

interface MixedPaymentResult extends BasePaymentResult {
  method: 'MIXED';
  breakdown: any[];
  total_amount: number;
  method_totals: Record<string, number>;
}

type PaymentResult =
  | CashPaymentResult
  | CardPaymentResult
  | BankTransferPaymentResult
  | InsurancePaymentResult
  | DepositPaymentResult
  | OtherPaymentResult
  | MobileMoneyPaymentResult
  | WaiverPaymentResult
  | MixedPaymentResult;

// ===== PAYMENT DATA INTERFACE =====

interface PaymentData {
  bill_id: number;
  patient_id: number;
  selected_items: number[];
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  payment_date: Date;
  notes?: string;
  payment_reference?: string; // Auto-generated payment reference
  period_id?: number; // Financial period ID for accounting
  // Method-specific data
  cash_received?: number;
  change_given?: number;
  cash_register_id?: number; // Cash register ID for cash payments
  bank_account_id?: number;
  pos_terminal_id?: number;
  // Card payment specific fields
  card_type?: string;
  card_last_four?: string;
  // Mixed payment fields
  is_mixed_payment?: boolean;
  mixed_payment_breakdown?: any[];
  authorization_code?: string;
  transaction_id?: string;
  // Bank transfer specific fields
  transfer_date?: Date;
  expected_settlement_date?: Date;
  transfer_fee?: number;
  // Insurance specific fields
  claim_reference?: string;
  insurance_provider?: string;
  policy_number?: string;
  copay_amount?: number;
  deposit_usage?: number;
  bank_reference?: string;
  // Mobile money specific fields
  mobile_money_provider?: string;
  // Waiver specific fields
  waiver_reason?: string;
  visit_id?: number;
}

/**
 * Payment Processing Service
 *
 * This service handles all payment processing logic including:
 * - Multiple payment methods (CASH, CARD, BANK_TRANSFER, INSURANCE, DEPOSIT, MIXED)
 * - Journal entry creation for double-entry accounting
 * - Payment validation and processing
 * - Financial transaction management
 */
export class PaymentProcessingService {
  /**
   * Process payment for selected bill items
   */
  static async processPayment(
    paymentData: PaymentData,
    staffId: number,
    staffRole = 'STAFF'
  ): Promise<PaymentResult> {
    let transaction: Transaction | undefined;
    try {
      // Create validation context
      const validationContext: PaymentValidationContext = {
        staffId,
        staffRole,
        paymentDate: paymentData.payment_date || new Date(),
        amount: paymentData.amount,
        paymentMethod: paymentData.payment_method,
        paymentType: paymentData.payment_type,
        billId: paymentData.bill_id,
        patientId: paymentData.patient_id,
        selectedItems: paymentData.selected_items,
      };

      // Comprehensive payment validation using our new framework
      const validationResult = await PaymentValidationService.validatePayment(
        paymentData,
        validationContext
      );

      if (!validationResult.isValid) {
        const criticalErrors = validationResult.errors.filter(e => e.severity === 'CRITICAL');
        const errorMessages = criticalErrors.map(e => `${e.field}: ${e.message}`).join('; ');

        throw new BadException(
          'Payment Validation Failed',
          400,
          `Payment validation failed: ${errorMessages}`
        );
      }

      // Log warnings if any
      if (validationResult.warnings.length > 0) {
        logger.warn('Payment validation warnings:', {
          paymentId: paymentData.bill_id,
          warnings: validationResult.warnings,
        });
      }

      // Generate unique payment reference if not provided
      if (!paymentData.payment_reference) {
        paymentData.payment_reference = PaymentValidationService.generatePaymentReference(
          paymentData.payment_method
        );
        logger.info(`Generated payment reference: ${paymentData.payment_reference}`, {
          billId: paymentData.bill_id,
          paymentMethod: paymentData.payment_method,
          amount: paymentData.amount,
        });
      }

      // Determine financial period if not provided
      if (!paymentData.period_id) {
        try {
          const { FinancialPeriodValidationService } = await import(
            './financialPeriodValidation.service'
          );
          const currentPeriod = await FinancialPeriodValidationService.getCurrentActivePeriod();
          if (currentPeriod) {
            paymentData.period_id = currentPeriod.id;
            logger.info(
              `Auto-assigned financial period: ${currentPeriod.name} (ID: ${currentPeriod.id})`,
              {
                billId: paymentData.bill_id,
                paymentMethod: paymentData.payment_method,
              }
            );
          } else {
            logger.warn(
              'No active financial period found, payment will be created without period association',
              {
                billId: paymentData.bill_id,
                paymentMethod: paymentData.payment_method,
              }
            );
          }
        } catch (error) {
          logger.warn(
            'Failed to determine current financial period, payment will be created without period association',
            {
              billId: paymentData.bill_id,
              paymentMethod: paymentData.payment_method,
              error: error.message,
            }
          );
        }
      }

      // Get bill and items
      const bill = await ClinicalBill.findByPk(paymentData.bill_id, {
        include: [{ model: ClinicalBillItem, as: 'billItems' }],
      });

      if (!bill) {
        throw new BadException('Bill Not Found', 404, 'The requested bill could not be found');
      }

      // Validate selected items
      const selectedItems = bill.billItems.filter(item =>
        paymentData.selected_items.includes(item.id)
      );

      if (selectedItems.length === 0) {
        throw new BadException('No Items Selected', 400, 'No valid items selected for payment');
      }

      // Calculate totals
      const totalAmount = selectedItems.reduce(
        (sum, item) =>
          sum +
          (parseFloat(item.total_price.toString()) || parseFloat(item.unit_price.toString()) || 0),
        0
      );

      if (Math.abs(paymentData.amount - totalAmount) > 0.01) {
        throw new BadException(
          'Payment Amount Mismatch',
          400,
          'Payment amount does not match selected items total'
        );
      }

      const paymentProcessingData = { ...paymentData, visit_id: bill.visit_id };
      // Always create a transaction for this operation
      transaction = await sequelizeConnection.transaction();

      // Process payment based on method
      let paymentResult: PaymentResult;
      switch (paymentData.payment_method) {
        case PaymentMethod.CASH:
          paymentResult = await this.processCashPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.CARD:
          // Record confirmed card payment (cashier has processed card payment via POS terminal)
          paymentResult = await this.recordCardPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.BANK_TRANSFER:
          // Record confirmed bank transfer payment (cashier has verified funds received)
          paymentResult = await this.recordBankTransferPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.INSURANCE:
          paymentResult = await this.processInsurancePayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.DEPOSIT:
          paymentResult = await this.processDepositPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.OTHER:
          paymentResult = await this.processMixedPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.MOBILE_MONEY:
          paymentResult = await this.processMobileMoneyPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        case PaymentMethod.WAIVER:
          paymentResult = await this.processWaiverPayment(
            paymentProcessingData,
            selectedItems,
            staffId,
            transaction
          );
          break;
        default:
          throw new BadException('Invalid Payment Method', 400, 'Invalid payment method');
      }

      // Journal entries are already created by individual payment method services
      // No need to create duplicate entries here - that would violate accounting principles
      // Each payment method service handles its own double-entry accounting properly

      // Create payment-item records to track which items this payment covers
      await this.createPaymentItemRecords(
        paymentResult.payment.id,
        selectedItems,
        paymentData.amount,
        paymentData.payment_method,
        transaction
      );

      // Update bill and item statuses
      await this.updateBillAndItemStatuses(bill, selectedItems, paymentResult, transaction);

      // Commit the transaction
      await transaction.commit();

      return paymentResult;
    } catch (error) {
      // Rollback the transaction on error
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          logger.error(
            'Failed to rollback transaction during deposit creation error:',
            rollbackError
          );
        }
      }
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to process payment', 500, error.message);
    }
  }

  /**
   * Create payment-item records to track which items each payment covers
   */
  private static async createPaymentItemRecords(
    paymentId: number,
    selectedItems: any[],
    totalPaymentAmount: number,
    paymentMethod: PaymentMethod,
    transaction: Transaction
  ): Promise<void> {
    try {
      // Calculate how much each item should receive from this payment
      const itemAmounts = this.calculateItemPaymentAmounts(
        selectedItems,
        totalPaymentAmount,
        paymentMethod
      );

      // Create payment-item records
      const paymentItemRecords = itemAmounts.map(item => ({
        payment_id: paymentId,
        bill_item_id: item.billItemId,
        amount_paid: item.amountToPay,
        payment_status: item.status as PaymentItemStatus,
        payment_percentage: item.percentage,
        notes: `Payment ${paymentId} - ${item.status}`,
      }));

      await ClinicalPaymentItem.bulkCreate(paymentItemRecords, { transaction });

      logger.info(
        `Created ${paymentItemRecords.length} payment-item records for payment ${paymentId}`,
        {
          paymentId,
          itemCount: paymentItemRecords.length,
          totalAmount: totalPaymentAmount,
          paymentMethod,
        }
      );
    } catch (error) {
      logger.error('Failed to create payment-item records:', error);
      throw new BadException('Failed to create payment-item records', 500, error.message);
    }
  }

  /**
   * Calculate how much each selected item should receive from the payment
   */
  private static calculateItemPaymentAmounts(
    selectedItems: any[],
    totalPaymentAmount: number,
    paymentMethod: PaymentMethod
  ): Array<{
    billItemId: number;
    amountToPay: number;
    status: string;
    percentage: number;
  }> {
    const totalItemsCost = selectedItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(item.total_price?.toString()) || parseFloat(item.unit_price?.toString()) || 0),
      0
    );

    // Determine status based on payment method
    const isInsurancePayment = paymentMethod === PaymentMethod.INSURANCE;
    const fullPaymentStatus = isInsurancePayment ? 'CLEARED' : 'PAID';
    const partialPaymentStatus = 'PARTIAL'; // PARTIAL is same for all payment methods

    // If payment covers all items fully
    if (totalPaymentAmount >= totalItemsCost) {
      return selectedItems.map(item => {
        const itemCost =
          parseFloat(item.total_price?.toString()) || parseFloat(item.unit_price?.toString()) || 0;
        return {
          billItemId: item.id,
          amountToPay: itemCost,
          status: fullPaymentStatus, // CLEARED for insurance, PAID for others
          percentage: 100.0,
        };
      });
    }

    // If payment is partial, distribute proportionally
    const paymentRatio = totalPaymentAmount / totalItemsCost;
    return selectedItems.map(item => {
      const itemCost =
        parseFloat(item.total_price?.toString()) || parseFloat(item.unit_price?.toString()) || 0;
      const amountToPay = itemCost * paymentRatio;
      return {
        billItemId: item.id,
        amountToPay: Math.round(amountToPay * 100) / 100, // Round to 2 decimal places
        status: partialPaymentStatus, // PARTIAL for all payment methods
        percentage: Math.round(paymentRatio * 10000) / 100, // Round to 2 decimal places
      };
    });
  }

  /**
   * Validate payment data
   */
  private static async validatePaymentData(paymentData: PaymentData) {
    if (!paymentData.bill_id || !paymentData.patient_id || !paymentData.selected_items) {
      throw new BadException('Missing Required Payment Data', 400, 'Missing required payment data');
    }

    if (paymentData.amount <= 0) {
      throw new BadException(
        'Invalid Payment Amount',
        400,
        'Payment amount must be greater than zero'
      );
    }

    if (!paymentData.payment_method || !paymentData.payment_type) {
      throw new BadException(
        'Payment Method Required',
        400,
        'Payment method and type are required'
      );
    }

    if (!paymentData.payment_date) {
      throw new BadException('Payment Date Required', 400, 'Payment date is required');
    }

    // Method-specific validation
    switch (paymentData.payment_method) {
      case PaymentMethod.CASH:
        if (paymentData.cash_received && paymentData.cash_received < paymentData.amount) {
          throw new BadException(
            'Insufficient Cash Received',
            400,
            'Cash received must be greater than or equal to payment amount'
          );
        }
        break;
      case PaymentMethod.CARD:
        if (!paymentData.pos_terminal_id) {
          throw new BadException(
            'POS Terminal Required',
            400,
            'POS terminal is required for card payments'
          );
        }
        break;
      case PaymentMethod.BANK_TRANSFER:
        if (!paymentData.bank_account_id) {
          throw new BadException(
            'Bank Account Required',
            400,
            'Bank account is required for bank transfer payments'
          );
        }
        if (!paymentData.bank_reference) {
          throw new BadException(
            'Bank Reference Required',
            400,
            'Bank reference is required for bank transfer payments'
          );
        }
        break;
      case PaymentMethod.INSURANCE:
        if (!paymentData.insurance_provider) {
          throw new BadException(
            'Insurance Provider Required',
            400,
            'Insurance provider is required for insurance payments'
          );
        }
        if (paymentData.copay_amount && paymentData.copay_amount < 0) {
          throw new BadException('Invalid Co-pay Amount', 400, 'Co-pay amount cannot be negative');
        }
        break;
      case PaymentMethod.DEPOSIT:
        if (!paymentData.deposit_usage || paymentData.deposit_usage <= 0) {
          throw new BadException(
            'Invalid Deposit Usage',
            400,
            'Deposit usage amount is required and must be greater than zero'
          );
        }
        break;
    }
  }

  /**
   * Process cash payment
   */
  private static async processCashPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<CashPaymentResult> {
    // Import CashPaymentService dynamically to avoid circular dependencies
    const { CashPaymentService } = await import('./cashPayment.service');

    // Process cash payment through the dedicated cash payment service
    const result = await CashPaymentService.processCashPayment(
      {
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        cash_received: paymentData.cash_received,
        change_given: paymentData.change_given,
        register_id: paymentData.cash_register_id, // Cash register ID is required for cash payments
        notes: paymentData.notes,
        payment_date: paymentData.payment_date,
        payment_reference: paymentData.payment_reference, // Pass the generated payment reference
        period_id: paymentData.period_id, // Pass the financial period ID
        visit_id: paymentData.visit_id,
      },
      staffId,
      transaction
    );

    return {
      payment: result.payment,
      method: 'CASH' as const,
      cash_received: paymentData.cash_received,
      change_given: paymentData.change_given,
      cash_register: result.register,
    };
  }

  /**
   * Record confirmed card payment
   */
  private static async recordCardPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<CardPaymentResult> {
    // Import POSTerminalPaymentService dynamically to avoid circular dependencies
    const { POSTerminalPaymentService } = await import('./posTerminalPayment.service');

    // Record confirmed POS payment through the dedicated POS terminal payment service
    const result = await POSTerminalPaymentService.recordPOSPayment(
      {
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        pos_terminal_id: paymentData.pos_terminal_id,
        card_type: paymentData.card_type,
        card_last_four: paymentData.card_last_four,
        authorization_code: paymentData.authorization_code,
        transaction_id: paymentData.transaction_id,
        notes: paymentData.notes,
        payment_date: paymentData.payment_date,
        payment_reference: paymentData.payment_reference, // Pass the generated payment reference
        period_id: paymentData.period_id, // Pass the financial period ID
        visit_id: paymentData.visit_id,
      },
      staffId,
      transaction
    );

    return {
      payment: result.payment,
      method: 'CARD' as const,
      pos_terminal: result.terminal,
      bank_account: result.bankAccount,
    };
  }

  /**
   * Record confirmed bank transfer payment
   */
  private static async recordBankTransferPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<BankTransferPaymentResult> {
    // Import BankTransferPaymentService dynamically to avoid circular dependencies
    const { BankTransferPaymentService } = await import('./bankTransferPayment.service');

    // Record confirmed bank transfer payment through the dedicated bank transfer payment service
    const result = await BankTransferPaymentService.recordBankTransferPayment(
      {
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        bank_account_id: paymentData.bank_account_id,
        transfer_date: paymentData.transfer_date || new Date(),
        expected_settlement_date: paymentData.expected_settlement_date || null, // Optional for Nigerian context
        transfer_fee: paymentData.transfer_fee || 0, // Default to 0 for Nigerian bank transfers
        transfer_currency: 'NGN', // Nigerian Naira
        exchange_rate: 1, // 1:1 for NGN
        notes: paymentData.notes,
        payment_reference: paymentData.payment_reference, // Pass the generated payment reference
        period_id: paymentData.period_id, // Pass the financial period ID
        visit_id: paymentData.visit_id,
      },
      staffId,
      transaction
    );

    return {
      payment: result.payment,
      method: 'BANK_TRANSFER' as const,
      bank_account: result.bankTransfer?.bankAccount,
      bank_reference: result.payment.bank_reference,
    };
  }

  /**
   * Process insurance payment
   */
  private static async processInsurancePayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<InsurancePaymentResult> {
    // Import InsurancePaymentService dynamically to avoid circular dependencies
    const { InsurancePaymentService } = await import('./insurancePayment.service');

    // Process insurance payment through the dedicated insurance payment service
    const result = await InsurancePaymentService.processInsurancePayment(
      {
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        insurance_provider: paymentData.insurance_provider,
        policy_number: paymentData.policy_number,
        copay_amount: paymentData.copay_amount,
        claim_reference: paymentData.claim_reference,
        expected_settlement_date: paymentData.expected_settlement_date,
        notes: paymentData.notes,
        payment_reference: paymentData.payment_reference, // Pass the generated payment reference
        period_id: paymentData.period_id, // Pass the financial period ID
        visit_id: paymentData.visit_id,
      },
      staffId,
      transaction
    );

    return {
      payment: result.payment,
      method: 'INSURANCE' as const,
      insurance_provider: paymentData.insurance_provider,
      policy_number: paymentData.policy_number,
      copay_amount: paymentData.copay_amount,
    };
  }

  /**
   * Process deposit payment
   */
  private static async processDepositPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<DepositPaymentResult> {
    // Validate deposit usage
    const patientDeposit = await PatientDeposit.findOne({
      where: {
        patient_id: paymentData.patient_id,
        status: DepositStatus.ACTIVE,
      },
      transaction,
    });

    if (!patientDeposit) {
      throw new BadException('No Active Deposit Found', 400, 'No active patient deposit found');
    }

    if (patientDeposit.amount < paymentData.deposit_usage) {
      throw new BadException('Insufficient Deposit Balance', 400, 'Insufficient deposit balance');
    }

    await PatientDepositService.useDeposit(
      {
        deposit_id: patientDeposit.id,
        amount: paymentData.deposit_usage,
        bill_id: paymentData.bill_id,
        description: paymentData.notes,
        used_by: staffId,
      },
      transaction
    );

    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: PaymentMethod.DEPOSIT,
        payment_type: paymentData.payment_type,
        notes: paymentData.notes,
        deposit_id: patientDeposit.id,
        deposit_usage: paymentData.deposit_usage,
        status: PaymentStatus.PAID,
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    return {
      payment,
      method: 'DEPOSIT' as const,
      deposit_usage: paymentData.deposit_usage,
      remaining_balance: patientDeposit.amount - paymentData.deposit_usage,
    };
  }

  /**
   * Process mixed payment (combination of methods)
   */
  private static async processMixedPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<MixedPaymentResult> {
    try {
      // Validate mixed payment breakdown
      if (!paymentData.mixed_payment_breakdown || paymentData.mixed_payment_breakdown.length < 2) {
        throw new BadException(
          'Invalid Mixed Payment',
          400,
          'Mixed payment must have at least 2 different payment methods'
        );
      }

      // Calculate total from breakdown
      const breakdownTotal = paymentData.mixed_payment_breakdown.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      if (Math.abs(breakdownTotal - paymentData.amount) > 0.01) {
        throw new BadException(
          'Amount Mismatch',
          400,
          `Total breakdown amount (${breakdownTotal}) does not match payment amount (${paymentData.amount})`
        );
      }

      // Create main payment record
      const payment = await ClinicalPayment.create(
        {
          payment_reference:
            paymentData.payment_reference ||
            `MIX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          bill_id: paymentData.bill_id,
          patient_id: paymentData.patient_id,
          amount: paymentData.amount,
          payment_method: PaymentMethod.OTHER,
          payment_type: paymentData.payment_type,
          notes:
            paymentData.notes ||
            `Mixed payment: ${paymentData.mixed_payment_breakdown
              .map(item => `${item.method} (${item.amount})`)
              .join(', ')}`,
          status: PaymentStatus.PAID,
          processed_by: staffId,
          processed_at: new Date(),
          period_id: paymentData.period_id, // Use the financial period ID
        },
        { transaction }
      );

      // Process each payment method in the breakdown
      const methodTotals: Record<PaymentMethod, number> = {} as Record<PaymentMethod, number>;
      const processedBreakdown: any[] = [];

      for (const breakdownItem of paymentData.mixed_payment_breakdown) {
        // Initialize method total
        if (!methodTotals[breakdownItem.method]) {
          methodTotals[breakdownItem.method] = 0;
        }
        methodTotals[breakdownItem.method] += breakdownItem.amount;

        // Process individual payment method
        await this.processMixedPaymentMethod(payment.id, breakdownItem, staffId, transaction);

        processedBreakdown.push(breakdownItem);
      }

      // Create journal entries for mixed payment
      await this.createMixedPaymentJournalEntries(
        payment,
        processedBreakdown,
        staffId,
        transaction
      );

      return {
        payment,
        method: 'MIXED',
        breakdown: processedBreakdown,
        total_amount: paymentData.amount,
        method_totals: methodTotals,
      };
    } catch (error) {
      throw new BadException('Mixed Payment Processing Failed', 500, error.message);
    }
  }

  /**
   * Process mobile money payment
   */
  private static async processMobileMoneyPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<MobileMoneyPaymentResult> {
    // Create clinical payment record for mobile money
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: PaymentMethod.MOBILE_MONEY,
        payment_type: paymentData.payment_type,
        notes: paymentData.notes || 'Mobile money payment',
        status: PaymentStatus.PAID,
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
      },
      { transaction }
    );

    return {
      payment,
      method: 'MOBILE_MONEY' as const,
      mobile_money_provider: paymentData.mobile_money_provider || 'UNKNOWN',
    };
  }

  /**
   * Process waiver payment
   */
  private static async processWaiverPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<WaiverPaymentResult> {
    // Create clinical payment record for waiver
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: PaymentMethod.WAIVER,
        payment_type: paymentData.payment_type,
        notes: paymentData.notes || 'Payment waiver',
        status: PaymentStatus.PAID,
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
      },
      { transaction }
    );

    return {
      payment,
      method: 'WAIVER' as const,
      waiver_reason: paymentData.waiver_reason || 'Not specified',
    };
  }

  /**
   * Process individual payment method within mixed payment
   */
  private static async processMixedPaymentMethod(
    paymentId: number,
    breakdownItem: any,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      switch (breakdownItem.method) {
        case PaymentMethod.CASH:
          // Create cash transaction record
          if (breakdownItem.cash_register_id) {
            await CashTransaction.create(
              {
                payment_id: paymentId,
                cash_register_id: breakdownItem.cash_register_id,
                amount: breakdownItem.amount,
                movement_type: 'PAYMENT_RECEIVED',
                reference: breakdownItem.reference || `MIX-CASH-${Date.now()}`,
                notes: breakdownItem.notes || 'Cash portion of mixed payment',
                created_by: staffId,
              },
              { transaction }
            );
          }
          break;

        case PaymentMethod.DEPOSIT:
          // Update deposit balance
          if (breakdownItem.deposit_id) {
            const deposit = await PatientDeposit.findByPk(breakdownItem.deposit_id);
            if (deposit && deposit.current_balance >= breakdownItem.amount) {
              await deposit.update(
                {
                  current_balance: deposit.current_balance - breakdownItem.amount,
                  last_activity_date: new Date(),
                },
                { transaction }
              );
            }
          }
          break;

        case PaymentMethod.CARD:
          // Create POS transaction record
          await POSTerminalTransaction.create(
            {
              payment_id: paymentId,
              terminal_id: 1, // Default terminal, should be configurable
              amount: breakdownItem.amount,
              card_type: breakdownItem.card_type || 'UNKNOWN',
              transaction_status: 'COMPLETED',
              authorization_code: `MIX-POS-${Date.now()}`,
              reference: breakdownItem.reference || `MIX-POS-${Date.now()}`,
              notes: breakdownItem.notes || 'POS portion of mixed payment',
              created_by: staffId,
            },
            { transaction }
          );
          break;

        case PaymentMethod.BANK_TRANSFER:
          // Create bank transfer record
          if (breakdownItem.bank_account_id) {
            await BankTransfer.create(
              {
                payment_id: paymentId,
                bank_account_id: breakdownItem.bank_account_id,
                amount: breakdownItem.amount,
                transfer_date: new Date(),
                expected_settlement_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                transfer_status: 'PENDING_CONFIRMATION',
                reference: breakdownItem.reference || `MIX-BANK-${Date.now()}`,
                notes: breakdownItem.notes || 'Bank transfer portion of mixed payment',
                created_by: staffId,
              },
              { transaction }
            );
          }
          break;

        case PaymentMethod.INSURANCE:
          // Create insurance claim record
          if (breakdownItem.insurance_provider) {
            await InsuranceClaim.create(
              {
                payment_id: paymentId,
                insurance_provider: breakdownItem.insurance_provider,
                claim_amount: breakdownItem.amount,
                claim_status: 'PENDING_APPROVAL',
                claim_reference: breakdownItem.reference || `MIX-INS-${Date.now()}`,
                notes: breakdownItem.notes || 'Insurance portion of mixed payment',
                created_by: staffId,
              },
              { transaction }
            );
          }
          break;

        case PaymentMethod.MOBILE_MONEY:
          // Create mobile money transaction record
          await this.createMobileMoneyTransaction(paymentId, breakdownItem, staffId, transaction);
          break;

        case PaymentMethod.WAIVER:
          // Create waiver record
          await this.createWaiverRecord(paymentId, breakdownItem, staffId, transaction);
          break;

        default:
          throw new BadException(
            'Unsupported Payment Method',
            400,
            `Payment method ${breakdownItem.method} is not supported in mixed payments`
          );
      }
    } catch (error) {
      throw new BadException(
        `Failed to process ${breakdownItem.method} payment method`,
        500,
        error.message
      );
    }
  }

  /**
   * Create mobile money transaction record for mixed payments
   */
  private static async createMobileMoneyTransaction(
    paymentId: number,
    breakdownItem: any,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    // For now, we'll create a simple record
    // In a full implementation, this would integrate with mobile money providers
    logger.info(`Mobile money transaction created for mixed payment: ${paymentId}`, {
      paymentId,
      amount: breakdownItem.amount,
      provider: breakdownItem.mobile_money_provider || 'UNKNOWN',
    });
  }

  /**
   * Create waiver record for mixed payments
   */
  private static async createWaiverRecord(
    paymentId: number,
    breakdownItem: any,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    // For now, we'll create a simple record
    // In a full implementation, this would create proper waiver documentation
    logger.info(`Waiver record created for mixed payment: ${paymentId}`, {
      paymentId,
      amount: breakdownItem.amount,
      reason: breakdownItem.waiver_reason || 'Not specified',
    });
  }

  /**
   * Create journal entries for mixed payment
   */
  private static async createMixedPaymentJournalEntries(
    payment: ClinicalPayment,
    breakdown: any[],
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get required chart of accounts
      const cashAccount = await ChartOfAccount.findOne({
        where: { code: '1001' }, // Cash account
        transaction,
      });
      const depositAccount = await ChartOfAccount.findOne({
        where: { code: '2001' }, // Patient Deposits Payable
        transaction,
      });
      const posAccount = await ChartOfAccount.findOne({
        where: { code: '1003' }, // POS Terminal Receivables
        transaction,
      });
      const bankAccount = await ChartOfAccount.findOne({
        where: { code: '1002' }, // Bank Account
        transaction,
      });
      const insuranceAccount = await ChartOfAccount.findOne({
        where: { code: '1101' }, // Insurance Receivables
        transaction,
      });
      const revenueAccount = await ChartOfAccount.findOne({
        where: { code: '4001' }, // Service Revenue
        transaction,
      });

      if (
        !cashAccount ||
        !depositAccount ||
        !posAccount ||
        !bankAccount ||
        !insuranceAccount ||
        !revenueAccount
      ) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Required chart of accounts not found for mixed payment'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          transaction_date: new Date(),
          reference: `MIX-${payment.id}`,
          description: `Mixed payment for bill ${payment.bill_id}`,
          patient_id: payment.patient_id,
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
        },
        { transaction }
      );

      // Create journal entry lines for each payment method
      const journalLines = [];

      for (const item of breakdown) {
        let debitAccountId: number;
        let description: string;

        switch (item.method) {
          case PaymentMethod.CASH:
            debitAccountId = cashAccount.id;
            description = `Cash received: ${item.amount}`;
            break;
          case PaymentMethod.DEPOSIT:
            debitAccountId = depositAccount.id;
            description = `Deposit used: ${item.amount}`;
            break;
          case PaymentMethod.CARD:
            debitAccountId = posAccount.id;
            description = `POS payment: ${item.amount}`;
            break;
          case PaymentMethod.BANK_TRANSFER:
            debitAccountId = bankAccount.id;
            description = `Bank transfer: ${item.amount}`;
            break;
          case PaymentMethod.INSURANCE:
            debitAccountId = insuranceAccount.id;
            description = `Insurance claim: ${item.amount}`;
            break;
          default:
            continue;
        }

        // Debit the specific payment method account
        journalLines.push({
          journal_entry_id: journalEntry.id,
          account_id: debitAccountId,
          debit: item.amount,
          credit: 0,
          description: description,
        });
      }

      // Credit the revenue account with total amount
      journalLines.push({
        journal_entry_id: journalEntry.id,
        account_id: revenueAccount.id,
        debit: 0,
        credit: payment.amount,
        description: `Revenue from services: ${payment.amount}`,
      });

      // Create all journal entry lines
      await JournalEntryLine.bulkCreate(journalLines, { transaction });
    } catch (error) {
      throw new BadException('Failed to create mixed payment journal entries', 500, error.message);
    }
  }

  /**
   * Create journal entries for payment
   *
   * @deprecated This method creates duplicate journal entries and violates accounting principles.
   * Each payment method service already creates its own journal entries properly.
   * DO NOT USE - this method is kept only for reference and should be removed in future versions.
   */
  private static async createPaymentJournalEntries(
    paymentResult: PaymentResult,
    paymentData: PaymentData,
    staffId: number,
    transaction?: Transaction
  ) {
    const { payment, method } = paymentResult;

    // Fetch all required chart of accounts in a single batch query for maximum performance
    const requiredAccountCodes = ['1001', '1003', '1004', '1100', '1101', '1102', '2001', '4001'];
    const accounts = await ChartOfAccount.findAll({
      where: {
        code: requiredAccountCodes,
        is_active: true,
      },
      transaction,
    });

    // Map accounts by code for easy access
    const accountsByCode = accounts.reduce((acc, account) => {
      acc[account.code] = account;
      return acc;
    }, {} as Record<string, ChartOfAccount>);

    // Extract individual accounts
    const cashAccount = accountsByCode['1001']; // Cash on Hand
    const posTerminalAccount = accountsByCode['1003']; // POS Terminal Receivables
    const cashRegisterAccount = accountsByCode['1004']; // Cash Register
    const accountsReceivableAccount = accountsByCode['1100']; // Accounts Receivable
    const insuranceAccount = accountsByCode['1101']; // Insurance Receivables
    const bankTransferAccount = accountsByCode['1102']; // Bank Transfer Receivables
    const patientDepositsAccount = accountsByCode['2001']; // Patient Deposits Payable
    const revenueAccount = accountsByCode['4001']; // Service Revenue

    // Validate all required accounts exist
    const requiredAccounts = [
      { name: 'Cash on Hand', account: cashAccount, code: '1001' },
      { name: 'Cash Register', account: cashRegisterAccount, code: '1004' },
      { name: 'POS Terminal Receivables', account: posTerminalAccount, code: '1003' },
      { name: 'Bank Transfer Receivables', account: bankTransferAccount, code: '1102' },
      { name: 'Insurance Receivables', account: insuranceAccount, code: '1101' },
      { name: 'Accounts Receivable', account: accountsReceivableAccount, code: '1100' },
      { name: 'Patient Deposits Payable', account: patientDepositsAccount, code: '2001' },
      { name: 'Service Revenue', account: revenueAccount, code: '4001' },
    ];

    const missingAccounts = requiredAccounts.filter(acc => !acc.account);
    if (missingAccounts.length > 0) {
      const missingCodes = missingAccounts.map(acc => acc.code).join(', ');
      throw new BadException(
        'Required Chart of Accounts Missing',
        500,
        `Missing required chart of accounts: ${missingCodes}. Please run accounting initialization.`
      );
    }

    // Create journal entry
    const journalEntry = await JournalEntry.create(
      {
        transaction_date: paymentData.payment_date,
        reference: `PAY-${payment.id}`,
        description: `Payment for bill ${payment.bill_id} via ${method}`,
        patient_id: payment.patient_id,
        status: JournalEntryStatus.POSTED,
        created_by: staffId,
        period_id: paymentData.period_id,
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    // Create journal entry lines based on payment method
    const journalLines = [];

    switch (method) {
      case 'CASH':
        // DR: Cash Register, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: cashRegisterAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Cash received at cash register',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'CARD':
        // DR: POS Terminal Receivables, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: posTerminalAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Card payment received via POS terminal',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'BANK_TRANSFER':
        // DR: Bank Transfer Receivables, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: bankTransferAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Bank transfer payment received',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'INSURANCE':
        // DR: Insurance Receivables, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: insuranceAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Insurance claim receivable',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'DEPOSIT':
        // DR: Patient Deposits Payable (reduction), CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: patientDepositsAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Patient deposit used for services',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'MOBILE_MONEY':
        // DR: Accounts Receivable, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: accountsReceivableAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Mobile money payment receivable',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      case 'WAIVER':
        // DR: General Revenue (4000), CR: Service Revenue
        const generalRevenueAccount = await ChartOfAccount.findOne({
          where: { code: '4000' }, // General Revenue
          transaction,
        });
        if (!generalRevenueAccount) {
          throw new BadException(
            'Required Chart of Accounts Missing',
            500,
            'General Revenue account (4000) not found. Please run accounting initialization.'
          );
        }
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: generalRevenueAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Revenue waiver adjustment',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
        break;
      default:
        // Default: DR: Cash Register, CR: Service Revenue
        journalLines.push(
          {
            journal_entry_id: journalEntry.id,
            account_id: cashRegisterAccount.id,
            debit: payment.amount,
            credit: 0,
            description: 'Payment received (default method)',
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: revenueAccount.id,
            debit: 0,
            credit: payment.amount,
            description: 'Revenue from medical services',
          }
        );
    }

    // Create journal entry lines
    await JournalEntryLine.bulkCreate(journalLines, { transaction });
  }

  /**
   * Update bank account balance after payment
   */
  private static async updateBankAccountBalance(
    bankAccountId: number,
    amount: number,
    transaction?: Transaction
  ) {
    try {
      const bankAccount = await BankAccount.findByPk(bankAccountId, { transaction });
      if (!bankAccount) {
        throw new BadException(
          'Bank Account Not Found',
          404,
          'The requested bank account could not be found'
        );
      }

      // Update current balance
      await bankAccount.update(
        {
          current_balance: bankAccount.current_balance + amount,
          updated_by: bankAccount.updated_by || bankAccount.created_by,
        },
        { transaction }
      );
    } catch (error) {
      throw new BadException('Failed to update bank account balance', 500, error.message);
    }
  }

  /**
   * Update bill and item statuses after payment
   */
  private static async updateBillAndItemStatuses(
    bill: ClinicalBill,
    selectedItems: ClinicalBillItem[],
    paymentResult: PaymentResult,
    transaction?: Transaction
  ) {
    // Determine payment status based on payment method
    const isInsurancePayment = paymentResult.method === 'INSURANCE';
    const itemPaymentStatus = isInsurancePayment ? 'CLEARED' : 'PAID';
    const billPaymentStatus = isInsurancePayment ? PaymentStatus.CLEARED : PaymentStatus.PAID;

    // Update selected items to appropriate status
    for (const item of selectedItems) {
      await item.update(
        {
          payment_status: itemPaymentStatus,
          paid_amount: item.total_price || item.unit_price,
          paid_at: new Date(),
        },
        { transaction }
      );
    }

    // Update prescribed order payment statuses based on item_type and payment method
    await this.updatePrescribedOrderPaymentStatuses(
      selectedItems,
      paymentResult.method,
      transaction
    );

    // Check if all bill items are paid or cleared
    const allBillItems = await ClinicalBillItem.findAll({
      where: { bill_id: bill.id },
      transaction,
    });

    const allItemsPaidOrCleared = allBillItems.every(
      item => item.payment_status === 'PAID' || item.payment_status === 'CLEARED'
    );

    if (allItemsPaidOrCleared) {
      // Check if any items are CLEARED (insurance)
      const hasInsuranceItems = allBillItems.some(item => item.payment_status === 'CLEARED');

      // Update bill status
      await bill.update(
        {
          payment_status: hasInsuranceItems ? PaymentStatus.CLEARED : billPaymentStatus,
          status: BillingStatus.APPROVED, // APPROVED allows service delivery
          paid_at: hasInsuranceItems ? null : new Date(), // No paid_at for cleared items
        },
        { transaction }
      );
    } else {
      // Update bill status to partially paid/cleared
      await bill.update(
        {
          payment_status: PaymentStatus.PARTIAL,
          status: BillingStatus.PENDING,
        },
        { transaction }
      );
    }
  }

  /**
   * Update prescribed order payment statuses when bill items are paid or cleared
   */
  private static async updatePrescribedOrderPaymentStatuses(
    selectedItems: ClinicalBillItem[],
    paymentMethod: string,
    transaction?: Transaction
  ): Promise<void> {
    for (const item of selectedItems) {
      if (item.item_type && item.item_id) {
        try {
          // Map accounting payment status to prescribed order payment status
          // Insurance: CLEARED → 'Cleared' (service authorized but not financially settled)
          // Other payments: PAID → 'Paid' (fully paid)
          const isInsurancePayment = paymentMethod === 'INSURANCE';
          const prescribedOrderStatus = isInsurancePayment ? 'Cleared' : 'Paid';

          switch (item.item_type) {
            case BillItemTypeEnum.DRUG: {
              const prescribedDrug = await PrescribedDrug.findOne({
                where: { id: item.item_id },
                transaction,
              });
              await PrescribedDrug.update(
                { payment_status: prescribedOrderStatus },
                {
                  where: { id: item.item_id },
                  transaction,
                }
              );
              await DrugPrescription.update(
                { has_paid: true },
                {
                  where: {
                    id: prescribedDrug.drug_prescription_id,
                  },
                  transaction,
                }
              );
              break;
            }
            case BillItemTypeEnum.TEST: {
              const prescribedTest = await PrescribedTest.findOne({
                where: { id: item.item_id },
                transaction,
              });

              await PrescribedTest.update(
                { payment_status: prescribedOrderStatus },
                {
                  where: { id: item.item_id },
                  transaction,
                }
              );
              await TestPrescription.update(
                { has_paid: true },
                {
                  where: {
                    id: prescribedTest.test_prescription_id,
                  },
                  transaction,
                }
              );
              break;
            }
            case BillItemTypeEnum.INVESTIGATION: {
              const prescribedInvestigation = await PrescribedInvestigation.findOne({
                where: { id: item.item_id },
                transaction,
              });
              await PrescribedInvestigation.update(
                { payment_status: prescribedOrderStatus },
                {
                  where: { id: item.item_id },
                  transaction,
                }
              );
              await InvestigationPrescription.update(
                { has_paid: true },
                {
                  where: { id: prescribedInvestigation.investigation_prescription_id },
                  transaction,
                }
              );
              break;
            }
            case BillItemTypeEnum.SERVICE: {
              // Handle prescribed services if they exist
              await PrescribedService.update(
                { payment_status: prescribedOrderStatus },
                { where: { id: item.item_id }, transaction }
              );
              break;
            }
            case BillItemTypeEnum.ADDITIONAL_ITEM: {
              const prescribedItem = await PrescribedAdditionalItem.findOne({
                where: { id: item.item_id },
                transaction,
              });
              // Handle prescribed additional items if they exist
              await PrescribedAdditionalItem.update(
                { payment_status: prescribedOrderStatus },
                { where: { id: item.item_id }, transaction }
              );
              await DrugPrescription.update(
                { has_paid: true },
                {
                  where: {
                    id: prescribedItem.drug_prescription_id,
                  },
                  transaction,
                }
              );
              break;
            }

            default:
              // Log unknown item type for debugging
              console.log(`Unknown item type: ${item.item_type} for item ID: ${item.item_id}`);
              break;
          }
        } catch (error) {
          // Log error but don't fail the entire payment process
          console.error(
            `Failed to update payment status for ${item.item_type} ID ${item.item_id}:`,
            error
          );
        }
      }
    }
  }

  /**
   * Get payment options for a specific bill and patient
   */
  static async getPaymentOptions(billId: number, patientId: number) {
    // Import repository to avoid circular dependencies
    const { AccountingRepository } = await import('../accounting.repository');

    // Get bill information
    const bill = await AccountingRepository.getClinicalBillById(billId);
    if (!bill) {
      throw new BadException('Bill Not Found', 404, 'The requested bill could not be found');
    }

    // Get patient deposit information
    const patientDeposit = await AccountingRepository.getPatientDepositByPatientId(patientId);

    // Get available bank accounts for transfers
    const bankAccounts = await AccountingRepository.getActiveBankAccounts();

    // Get available POS terminals for card payments
    const posTerminals = await AccountingRepository.getActivePOSTerminals();

    // Build payment options
    return {
      payment_methods: [
        {
          value: 'CASH',
          text: 'Cash',
          description: 'Cash payment',
          available: true,
          requires_additional_info: false,
        },
        {
          value: 'CARD',
          text: 'Card',
          description: 'Credit/Debit card payment',
          available: posTerminals.length > 0,
          requires_additional_info: true,
          additional_fields: ['pos_terminal_id'],
          available_terminals: posTerminals.map(terminal => ({
            id: terminal.id,
            name: terminal.terminal_id,
            location: terminal.location,
            bank_account: terminal.bank_account_id,
          })),
        },
        {
          value: 'BANK_TRANSFER',
          text: 'Bank Transfer',
          description: 'Bank transfer payment',
          available: bankAccounts.length > 0,
          requires_additional_info: true,
          additional_fields: ['bank_account_id', 'bank_reference'],
          available_banks: bankAccounts.map(account => ({
            id: account.id,
            name: account.bank_name,
            account_number: account.account_number,
            account_name: account.account_name,
          })),
        },
        {
          value: 'INSURANCE',
          text: 'Insurance',
          description: 'Insurance claim payment',
          available: true,
          requires_additional_info: true,
          additional_fields: ['insurance_provider', 'policy_number', 'copay_amount'],
        },
        {
          value: 'DEPOSIT',
          text: 'Patient Deposit',
          description: 'Use patient deposit',
          available: patientDeposit && patientDeposit.amount > 0,
          requires_additional_info: true,
          additional_fields: ['deposit_usage'],
          deposit_info: patientDeposit
            ? {
                available_balance: patientDeposit.amount,
                currency: 'NGN',
              }
            : null,
        },
        {
          value: 'OTHER',
          text: 'Other Payment',
          description: 'Other payment methods',
          available: true,
          requires_additional_info: false,
        },
      ],
      payment_types: [
        { value: 'FULL', text: 'Full Payment', description: 'Pay full amount' },
        { value: 'PARTIAL', text: 'Partial Payment', description: 'Pay partial amount' },
        {
          value: 'ADVANCE',
          text: 'Advance Payment',
          description: 'Advance payment for future services',
        },
      ],
      bill_info: {
        bill_id: billId,
        patient_id: patientId,
        bill_number: bill.bill_number,
        total_amount: bill.total_amount,
        billing_status: bill.billing_status,
        payment_status: bill.payment_status,
        due_date: bill.due_date,
        created_at: bill.createdAt,
      },
      patient_deposit: patientDeposit
        ? {
            available: true,
            balance: patientDeposit.amount,
            currency: 'NGN',
          }
        : {
            available: false,
            balance: 0,
            currency: 'NGN',
          },
      available_bank_accounts: bankAccounts.length,
      available_pos_terminals: posTerminals.length,
    };
  }

  /**
   * Get payment status for a specific payment
   */
  static async getPaymentStatus(paymentId: number) {
    // Import repository to avoid circular dependencies
    const { AccountingRepository } = await import('../accounting.repository');

    // Get payment by ID with related data
    const payment = await AccountingRepository.getClinicalPaymentById(paymentId);

    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The requested payment could not be found');
    }

    // Get bill information
    const bill = await AccountingRepository.getClinicalBillById(payment.bill_id);

    return {
      payment_id: payment.id,
      bill_id: payment.bill_id,
      patient_id: payment.patient_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      status: payment.status,
      processed_at: payment.createdAt,
      processed_by: payment.processed_by,
      bill_info: bill
        ? {
            bill_number: bill.bill_number,
            total_amount: bill.total_amount,
            billing_status: bill.billing_status,
            payment_status: bill.payment_status,
          }
        : null,
      notes: payment.notes,
      reference: `PAY-${payment.id}`,
    };
  }

  /**
   * Get payment receipt for a specific payment
   */
  static async getPaymentReceipt(paymentId: number) {
    // Import repository to avoid circular dependencies
    const { AccountingRepository } = await import('../accounting.repository');

    // Get payment by ID with related data
    const payment = await AccountingRepository.getClinicalPaymentById(paymentId);

    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The requested payment could not be found');
    }

    // Get bill with items
    const billWithItems = await AccountingRepository.getClinicalBillWithItems(payment.bill_id);

    // Extract bill and items from the result
    const bill = billWithItems?.bill;
    const items = billWithItems?.items || [];

    return {
      receipt_number: `RCP-${payment.id}`,
      generated_at: new Date(),
      payment_details: {
        payment_id: payment.id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_type: payment.payment_type,
        payment_date: payment.createdAt,
        status: payment.status,
        reference: `PAY-${payment.id}`,
      },
      bill_details: bill
        ? {
            bill_id: bill.id,
            bill_number: bill.bill_number,
            total_amount: bill.total_amount,
            billing_status: bill.billing_status,
            payment_status: bill.payment_status,
            created_at: bill.createdAt,
          }
        : null,
      bill_items: items,
      patient_info: {
        patient_id: payment.patient_id,
        // Add more patient details when patient repository is available
      },
      hospital_info: {
        name: 'Caroline Hospital', // This should come from configuration
        address: 'Hospital Address', // This should come from configuration
        phone: 'Hospital Phone', // This should come from configuration
        email: 'hospital@email.com', // This should come from configuration
      },
      notes: payment.notes,
      processed_by: payment.processed_by,
    };
  }
}
