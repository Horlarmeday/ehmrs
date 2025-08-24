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
  PrescribedAdditionalItem
} from '../../../database/models';
import { 
  PaymentType, 
  PaymentMethod, 
  PaymentStatus, 
  BillingStatus,
  JournalEntryStatus,
  DepositStatus,
  BillItemTypeEnum
} from '../enums';

// ===== PAYMENT RESULT INTERFACES =====

interface BasePaymentResult {
  payment: ClinicalPayment;
}

interface CashPaymentResult extends BasePaymentResult {
  method: 'CASH';
  cash_received?: number;
  change_given?: number;
}

interface CardPaymentResult extends BasePaymentResult {
  method: 'CARD';
  pos_terminal: POSTerminal;
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

type PaymentResult = 
  | CashPaymentResult 
  | CardPaymentResult 
  | BankTransferPaymentResult 
  | InsurancePaymentResult 
  | DepositPaymentResult 
  | OtherPaymentResult;

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
  // Method-specific data
  cash_received?: number;
  change_given?: number;
  bank_account_id?: number;
  pos_terminal_id?: number;
  insurance_provider?: string;
  policy_number?: string;
  copay_amount?: number;
  deposit_usage?: number;
  bank_reference?: string;
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
    transaction?: Transaction
  ): Promise<PaymentResult> {
    try {
      // Validate payment data
      await this.validatePaymentData(paymentData);

      // Get bill and items
      const bill = await ClinicalBill.findByPk(paymentData.bill_id, {
        include: [
          { model: ClinicalBillItem, as: 'billItems' },
          { model: PatientDeposit, as: 'patientDeposit' }
        ],
        transaction
      });

      if (!bill) {
        throw new BadException('Bill not found', 404);
      }

      // Validate selected items
      const selectedItems = bill.billItems.filter(item => 
        paymentData.selected_items.includes(item.id)
      );

      if (selectedItems.length === 0) {
        throw new BadException('No valid items selected for payment', 400);
      }

      // Calculate totals
      const totalAmount = selectedItems.reduce((sum, item) => 
        sum + (parseFloat(item.total_price.toFixed(2)) || parseFloat(item.unit_price.toFixed(2)) || 0), 0
      );

      if (Math.abs(paymentData.amount - totalAmount) > 0.01) {
        throw new BadException('Payment amount does not match selected items total', 400);
      }

      // Process payment based on method
      let paymentResult: PaymentResult;
      switch (paymentData.payment_method) {
        case PaymentMethod.CASH:
          paymentResult = await this.processCashPayment(paymentData, selectedItems, staffId, transaction);
          break;
        case PaymentMethod.CARD:
          paymentResult = await this.processCardPayment(paymentData, selectedItems, staffId, transaction);
          break;
        case PaymentMethod.BANK_TRANSFER:
          paymentResult = await this.processBankTransferPayment(paymentData, selectedItems, staffId, transaction);
          break;
        case PaymentMethod.INSURANCE:
          paymentResult = await this.processInsurancePayment(paymentData, selectedItems, staffId, transaction);
          break;
        case PaymentMethod.DEPOSIT:
          paymentResult = await this.processDepositPayment(paymentData, selectedItems, staffId, transaction);
          break;
        case PaymentMethod.OTHER:
          paymentResult = await this.processMixedPayment(paymentData, selectedItems, staffId, transaction);
          break;
        default:
          throw new BadException('Invalid payment method', 400);
      }

      // Create journal entries for double-entry accounting
      await this.createPaymentJournalEntries(paymentResult, paymentData, staffId, transaction);

      // Update bill and item statuses
      await this.updateBillAndItemStatuses(bill, selectedItems, paymentResult, transaction);

      return paymentResult;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to process payment', 500, error.message);
    }
  }

  /**
   * Validate payment data
   */
  private static async validatePaymentData(paymentData: PaymentData) {
    if (!paymentData.bill_id || !paymentData.patient_id || !paymentData.selected_items) {
      throw new BadException('Missing required payment data', 400);
    }

    if (paymentData.amount <= 0) {
      throw new BadException('Payment amount must be greater than zero', 400);
    }

    if (!paymentData.payment_method || !paymentData.payment_type) {
      throw new BadException('Payment method and type are required', 400);
    }

    if (!paymentData.payment_date) {
      throw new BadException('Payment date is required', 400);
    }

    // Method-specific validation
    switch (paymentData.payment_method) {
      case PaymentMethod.CASH:
        if (paymentData.cash_received && paymentData.cash_received < paymentData.amount) {
          throw new BadException('Cash received must be greater than or equal to payment amount', 400);
        }
        break;
      case PaymentMethod.CARD:
        if (!paymentData.pos_terminal_id) {
          throw new BadException('POS terminal is required for card payments', 400);
        }
        break;
      case PaymentMethod.BANK_TRANSFER:
        if (!paymentData.bank_account_id) {
          throw new BadException('Bank account is required for bank transfer payments', 400);
        }
        if (!paymentData.bank_reference) {
          throw new BadException('Bank reference is required for bank transfer payments', 400);
        }
        break;
      case PaymentMethod.INSURANCE:
        if (!paymentData.insurance_provider) {
          throw new BadException('Insurance provider is required for insurance payments', 400);
        }
        if (paymentData.copay_amount && paymentData.copay_amount < 0) {
          throw new BadException('Co-pay amount cannot be negative', 400);
        }
        break;
      case PaymentMethod.DEPOSIT:
        if (!paymentData.deposit_usage || paymentData.deposit_usage <= 0) {
          throw new BadException('Deposit usage amount is required and must be greater than zero', 400);
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
    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.CASH,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      cash_received: paymentData.cash_received,
      change_given: paymentData.change_given,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    return {
      payment,
      method: 'CASH' as const,
      cash_received: paymentData.cash_received,
      change_given: paymentData.change_given,
    };
  }

  /**
   * Process card payment
   */
  private static async processCardPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<CardPaymentResult> {
    // Validate POS terminal
    const posTerminal = await POSTerminal.findByPk(paymentData.pos_terminal_id, { transaction });
    if (!posTerminal || !posTerminal.is_active) {
      throw new BadException('Invalid or inactive POS terminal', 400);
    }

    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.CARD,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      pos_terminal_id: paymentData.pos_terminal_id,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    // Update POS terminal last used
    await posTerminal.update({ last_used_at: new Date() }, { transaction });

    // Update bank account balance
    await this.updateBankAccountBalance(posTerminal.bank_account_id, paymentData.amount, transaction);

    return {
      payment,
      method: 'CARD' as const,
      pos_terminal: posTerminal,
    };
  }

  /**
   * Process bank transfer payment
   */
  private static async processBankTransferPayment(
    paymentData: PaymentData,
    selectedItems: ClinicalBillItem[],
    staffId: number,
    transaction?: Transaction
  ): Promise<BankTransferPaymentResult> {
    // Validate bank account
    const bankAccount = await BankAccount.findByPk(paymentData.bank_account_id, { transaction });
    if (!bankAccount || !bankAccount.is_active) {
      throw new BadException('Invalid or inactive bank account', 400);
    }

    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.BANK_TRANSFER,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      bank_account_id: paymentData.bank_account_id,
      bank_reference: paymentData.bank_reference,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    // Update bank account balance
    await this.updateBankAccountBalance(paymentData.bank_account_id, paymentData.amount, transaction);

    return {
      payment,
      method: 'BANK_TRANSFER' as const,
      bank_account: bankAccount,
      bank_reference: paymentData.bank_reference,
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
    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.INSURANCE,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      insurance_provider: paymentData.insurance_provider,
      policy_number: paymentData.policy_number,
      copay_amount: paymentData.copay_amount,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    return {
      payment,
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
        status: DepositStatus.ACTIVE
      },
      transaction
    });

    if (!patientDeposit) {
      throw new BadException('No active patient deposit found', 400);
    }

    if (patientDeposit.amount < paymentData.deposit_usage) {
      throw new BadException('Insufficient deposit balance', 400);
    }

    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.DEPOSIT,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      deposit_usage: paymentData.deposit_usage,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    // Update deposit balance
    await patientDeposit.update({ 
      amount: patientDeposit.amount - paymentData.deposit_usage 
    }, { transaction });

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
  ): Promise<OtherPaymentResult> {
    // This would handle combinations like CASH + DEPOSIT
    // For now, we'll implement a basic mixed payment
    const payment = await ClinicalPayment.create({
      bill_id: paymentData.bill_id,
      patient_id: paymentData.patient_id,
      amount: paymentData.amount,
      payment_method: PaymentMethod.OTHER,
      payment_type: paymentData.payment_type,
      payment_date: paymentData.payment_date,
      notes: paymentData.notes,
      status: PaymentStatus.PAID,
      processed_by: staffId,
    }, { transaction });

    return {
      payment,
      method: 'OTHER' as const,
      // Additional mixed payment logic would go here
    };
  }

  /**
   * Create journal entries for payment
   */
  private static async createPaymentJournalEntries(
    paymentResult: PaymentResult,
    paymentData: PaymentData,
    staffId: number,
    transaction?: Transaction
  ) {
    const { payment, method } = paymentResult;

    // Get chart of accounts
    const cashAccount = await ChartOfAccount.findOne({ 
      where: { account_code: '1001' }, // Cash account
      transaction 
    });
    const accountsReceivableAccount = await ChartOfAccount.findOne({ 
      where: { account_code: '1100' }, // Accounts Receivable
      transaction 
    });
    const revenueAccount = await ChartOfAccount.findOne({ 
      where: { account_code: '4000' }, // Revenue account
      transaction 
    });

    if (!cashAccount || !accountsReceivableAccount || !revenueAccount) {
      throw new BadException('Required chart of accounts not found', 500);
    }

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      transaction_date: paymentData.payment_date,
      reference: `PAY-${payment.id}`,
      description: `Payment for bill ${payment.bill_id} via ${method}`,
      patient_id: payment.patient_id,
      status: JournalEntryStatus.POSTED,
      created_by: staffId,
    }, { transaction });

    // Create journal entry lines based on payment method
    const journalLines = [];

    switch (method) {
      case 'CASH':
        // DR: Cash, CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: cashAccount.id, debit: payment.amount, credit: 0, description: 'Cash received' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
        );
        break;
      case 'CARD':
        // DR: Bank Account (via POS), CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: paymentResult.pos_terminal.bank_account_id, debit: payment.amount, credit: 0, description: 'Card payment received' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
        );
        break;
      case 'BANK_TRANSFER':
        // DR: Bank Account, CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: paymentResult.bank_account.id, debit: payment.amount, credit: 0, description: 'Bank transfer received' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
        );
        break;
      case 'INSURANCE':
        // DR: Accounts Receivable, CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: accountsReceivableAccount.id, debit: payment.amount, credit: 0, description: 'Insurance claim receivable' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
        );
        break;
      case 'DEPOSIT':
        // DR: Patient Deposits, CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: cashAccount.id, debit: payment.amount, credit: 0, description: 'Patient deposit used' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
        );
        break;
      default:
        // Default: DR: Cash, CR: Revenue
        journalLines.push(
          { journal_entry_id: journalEntry.id, account_id: cashAccount.id, debit: payment.amount, credit: 0, description: 'Payment received' },
          { journal_entry_id: journalEntry.id, account_id: revenueAccount.id, debit: 0, credit: payment.amount, description: 'Revenue from services' }
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
        throw new BadException('Bank account not found', 404);
      }

      // Update current balance
      await bankAccount.update({
        current_balance: bankAccount.current_balance + amount,
        updated_by: bankAccount.updated_by || bankAccount.created_by,
      }, { transaction });
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
    // Update selected items to paid status
    for (const item of selectedItems) {
      await item.update({ 
        payment_status: 'PAID',
        paid_amount: item.total_price || item.unit_price,
        paid_at: new Date()
      }, { transaction });
    }

    // Update prescribed order payment statuses based on item_type
    await this.updatePrescribedOrderPaymentStatuses(selectedItems, transaction);

    // Check if all bill items are paid
    const allBillItems = await ClinicalBillItem.findAll({
      where: { bill_id: bill.id },
      transaction
    });

    const allItemsPaid = allBillItems.every(item => item.payment_status === 'PAID');

    if (allItemsPaid) {
      // Update bill status to fully paid
      await bill.update({ 
        payment_status: PaymentStatus.PAID,
        status: BillingStatus.APPROVED,
        paid_at: new Date()
      }, { transaction });
    } else {
      // Update bill status to partially paid
      await bill.update({ 
        payment_status: PaymentStatus.PARTIAL,
        status: BillingStatus.PENDING
      }, { transaction });
    }
  }

  /**
   * Update prescribed order payment statuses when bill items are paid
   */
  private static async updatePrescribedOrderPaymentStatuses(
    selectedItems: ClinicalBillItem[],
    transaction?: Transaction
  ): Promise<void> {

    for (const item of selectedItems) {
      if (item.item_type && item.item_id) {
        try {
          // Map accounting payment status to prescribed order payment status
          // Accounting: 'PAID' → Prescribed: 'Paid'
          const prescribedOrderStatus = 'Paid';

          switch (item.item_type) {
            case BillItemTypeEnum.DRUG:
              await PrescribedDrug.update(
                { payment_status: prescribedOrderStatus },
                { 
                  where: { id: item.item_id },
                  transaction 
                }
              );
              break;

            case BillItemTypeEnum.TEST:
              await PrescribedTest.update(
                { payment_status: prescribedOrderStatus },
                { 
                  where: { id: item.item_id },
                  transaction 
                }
              );
              break;

            case BillItemTypeEnum.INVESTIGATION:
              await PrescribedInvestigation.update(
                { payment_status: prescribedOrderStatus },
                { 
                  where: { id: item.item_id },
                  transaction 
                }
              );
              break;

            case BillItemTypeEnum.SERVICE:
              // Handle prescribed services if they exist
              await PrescribedService.update(
                { payment_status: prescribedOrderStatus },
                { where: { id: item.item_id }, transaction }
              );
              break;

            case BillItemTypeEnum.ADDITIONAL_ITEM:
              // Handle prescribed additional items if they exist
              await PrescribedAdditionalItem.update(
                { payment_status: prescribedOrderStatus },
                { where: { id: item.item_id }, transaction }
              );
              break;

            default:
              // Log unknown item type for debugging
              console.log(`Unknown item type: ${item.item_type} for item ID: ${item.item_id}`);
              break;
          }
        } catch (error) {
          // Log error but don't fail the entire payment process
          console.error(`Failed to update payment status for ${item.item_type} ID ${item.item_id}:`, error);
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
      throw new BadException('Bill not found', 404);
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
          requires_additional_info: false
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
            bank_account: terminal.bank_account_id
          }))
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
            account_name: account.account_name
          }))
        },
        { 
          value: 'INSURANCE', 
          text: 'Insurance', 
          description: 'Insurance claim payment',
          available: true,
          requires_additional_info: true,
          additional_fields: ['insurance_provider', 'policy_number', 'copay_amount']
        },
        { 
          value: 'DEPOSIT', 
          text: 'Patient Deposit', 
          description: 'Use patient deposit',
          available: patientDeposit && patientDeposit.amount > 0,
          requires_additional_info: true,
          additional_fields: ['deposit_usage'],
          deposit_info: patientDeposit ? {
            available_balance: patientDeposit.amount,
            currency: 'NGN'
          } : null
        },
        { 
          value: 'OTHER', 
          text: 'Other Payment', 
          description: 'Other payment methods',
          available: true,
          requires_additional_info: false
        },
      ],
      payment_types: [
        { value: 'FULL', text: 'Full Payment', description: 'Pay full amount' },
        { value: 'PARTIAL', text: 'Partial Payment', description: 'Pay partial amount' },
        { value: 'ADVANCE', text: 'Advance Payment', description: 'Advance payment for future services' },
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
      patient_deposit: patientDeposit ? {
        available: true,
        balance: patientDeposit.amount,
        currency: 'NGN'
      } : {
        available: false,
        balance: 0,
        currency: 'NGN'
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
      throw new BadException('Payment not found', 404);
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
      bill_info: bill ? {
        bill_number: bill.bill_number,
        total_amount: bill.total_amount,
        billing_status: bill.billing_status,
        payment_status: bill.payment_status,
      } : null,
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
      throw new BadException('Payment not found', 404);
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
      bill_details: bill ? {
        bill_id: bill.id,
        bill_number: bill.bill_number,
        total_amount: bill.total_amount,
        billing_status: bill.billing_status,
        payment_status: bill.payment_status,
        created_at: bill.createdAt,
      } : null,
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
