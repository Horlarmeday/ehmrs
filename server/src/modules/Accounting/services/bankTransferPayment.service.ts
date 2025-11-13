import { Op, Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  ClinicalPayment,
  Staff,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  FinancialPeriod,
  BankAccount,
  BankTransfer,
  Patient,
} from '../../../database/models';
import {
  PaymentType,
  PaymentStatus,
  BankTransferStatus,
  JournalEntryStatus,
  FinancialPeriodStatus,
} from '../enums';
import { BankTransferPaymentData } from '../types';
import { logger } from '../../../core/helpers/logger';

// ===== BANK TRANSFER PAYMENT INTERFACES =====

export interface BankTransferConfirmationData {
  payment_id: number;
  confirmation_reference: string;
  confirmation_date: Date;
  confirmed_amount: number;
  confirmation_notes?: string;
  confirmed_by: number;
}

export interface BankTransferSettlementData {
  payment_id: number;
  settlement_reference: string;
  settled_amount: number;
  settlement_date: Date;
  settlement_method: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'ELECTRONIC';
  bank_statement_reference?: string;
  check_number?: string;
  notes?: string;
  settled_by: number;
}

export interface BankStatementReconciliationData {
  bank_statement_reference: string;
  statement_date: Date;
  expected_credits: Array<{
    payment_id: number;
    expected_amount: number;
    expected_date: Date;
  }>;
  actual_credits: Array<{
    payment_id: number;
    actual_amount: number;
    actual_date: Date;
    bank_reference: string;
  }>;
  reconciled_by: number;
  reconciliation_notes?: string;
}

export interface BankTransferSummary {
  id: number;
  payment_reference: string;
  amount: number;
  bank_account: string;
  transfer_date: Date;
  expected_settlement_date?: Date; // Optional for Nigerian context
  days_to_settlement?: number; // Optional when expected_settlement_date is not provided
  is_overdue: boolean;
  transfer_status: string;
  transfer_fee?: number; // Optional for Nigerian context (defaults to 0)
  confirmed_at?: Date;
  settled_at?: Date;
}

// ===== BANK TRANSFER PAYMENT SERVICE =====

/**
 * Bank Transfer Payment Service
 *
 * This service handles all bank transfer payment operations including:
 * - Bank transfer payment processing
 * - Transfer confirmation workflow
 * - Settlement management
 * - Bank statement reconciliation
 * - Journal entry creation for double-entry accounting
 */
export class BankTransferPaymentService {
  // ===== BANK TRANSFER PAYMENT PROCESSING =====

  /**
   * Record confirmed bank transfer payment (for payment-first hospital)
   * Cashier confirms funds are already in hospital bank account before calling this method
   */
  static async recordBankTransferPayment(
    paymentData: BankTransferPaymentData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    bankTransfer: BankTransfer;
    journalEntry: JournalEntry;
  }> {
    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Validate bank account
    const bankAccount = await BankAccount.findByPk(paymentData.bank_account_id, { transaction });
    if (!bankAccount) {
      throw new BadException(
        'Bank Account Not Found',
        404,
        'The specified bank account could not be found'
      );
    }

    // Validate payment amounts
    if (paymentData.amount <= 0) {
      throw new BadException(
        'Invalid Payment Amount',
        400,
        'Payment amount must be greater than zero'
      );
    }

    // Validate transfer fee (optional for Nigerian context)
    if (paymentData.transfer_fee && paymentData.transfer_fee < 0) {
      throw new BadException('Invalid Transfer Fee', 400, 'Transfer fee cannot be negative');
    }

    // Validate transfer date
    if (paymentData.transfer_date > new Date()) {
      throw new BadException('Invalid Transfer Date', 400, 'Transfer date cannot be in the future');
    }

    // Validate expected settlement date (optional for Nigerian context)
    if (
      paymentData.expected_settlement_date &&
      paymentData.expected_settlement_date <= paymentData.transfer_date
    ) {
      throw new BadException(
        'Invalid Expected Settlement Date',
        400,
        'Expected settlement date must be after transfer date'
      );
    }

    // Use provided payment reference or generate one
    const paymentReference =
      paymentData.payment_reference ||
      `BT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;

    // Create clinical payment record - PAID status since cashier confirmed receipt
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentReference, // Use the payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: 'BANK_TRANSFER',
        payment_type: PaymentType.FULL,
        notes: paymentData.notes,
        bank_reference: paymentReference,
        status: PaymentStatus.PAID, // ✅ PAID since cashier confirmed receipt
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
        bank_account_id: paymentData.bank_account_id,
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    // Create bank transfer record - SETTLED status since funds are confirmed
    const bankTransfer = await BankTransfer.create(
      {
        payment_id: payment.id,
        bank_account_id: paymentData.bank_account_id,
        transfer_date: paymentData.transfer_date,
        expected_settlement_date: paymentData.expected_settlement_date || new Date(), // Optional for Nigerian context
        transfer_fee: paymentData.transfer_fee || 0, // Default to 0 for Nigerian bank transfers
        transfer_currency: paymentData.transfer_currency || 'NGN', // Default to Nigerian Naira
        exchange_rate: paymentData.exchange_rate || 1, // Default to 1:1 for NGN
        original_amount: paymentData.amount, // Use payment amount if not specified
        original_currency: paymentData.original_currency || 'NGN', // Default to Nigerian Naira
        transfer_processor: paymentData.transfer_processor || null, // Optional for Nigerian context
        transfer_processor_reference: paymentData.transfer_processor_reference || null, // Optional for Nigerian context
        transfer_status: BankTransferStatus.SETTLED, // ✅ SETTLED since cashier confirmed funds received
      },
      { transaction }
    );

    // ✅ Update bank account balance since funds are confirmed
    await bankAccount.increment(
      {
        current_balance: +paymentData.amount,
      },
      { transaction }
    );

    // Create journal entries for confirmed bank transfer (DR Bank Account, CR Service Revenue)
    const journalEntry = await this.createConfirmedBankTransferJournalEntries(
      payment,
      paymentData.amount,
      paymentData.transfer_fee || 0, // Use 0 if transfer_fee not provided
      staffId,
      transaction
    );

    logger.info(`Confirmed bank transfer payment recorded: ${payment.payment_reference}`, {
      paymentId: payment.id,
      bankTransferId: bankTransfer.id,
      amount: paymentData.amount,
      transferFee: paymentData.transfer_fee || 0,
      expectedSettlementDate: paymentData.expected_settlement_date || 'Not specified',
      currency: paymentData.transfer_currency || 'NGN',
      bankAccountBalance: bankAccount.current_balance + paymentData.amount,
      staffId,
    });

    return {
      payment,
      bankTransfer,
      journalEntry,
    };
  }

  // ===== BANK TRANSFER CONFIRMATION =====

  /**
   * Confirm bank transfer payment
   */
  static async confirmBankTransferPayment(
    confirmationData: BankTransferConfirmationData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    bankTransfer: BankTransfer;
    journalEntry: JournalEntry;
  }> {
    // Get the payment and bank transfer
    const payment = await ClinicalPayment.findByPk(confirmationData.payment_id, { transaction });
    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The specified payment could not be found');
    }

    const bankTransfer = await BankTransfer.findOne({
      where: { payment_id: confirmationData.payment_id },
      transaction,
    });

    if (!bankTransfer) {
      throw new BadException(
        'Bank Transfer Not Found',
        404,
        'The specified bank transfer could not be found'
      );
    }

    // Validate payment method
    if (payment.payment_method !== 'BANK_TRANSFER') {
      throw new BadException(
        'Invalid Payment Method',
        400,
        'Payment is not a bank transfer payment'
      );
    }

    // Validate payment status
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadException(
        'Invalid Payment Status',
        400,
        `Payment status is ${payment.status}, cannot confirm`
      );
    }

    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Update payment status to confirmed
    await payment.update(
      {
        status: PaymentStatus.CONFIRMED,
        notes: payment.notes
          ? `${payment.notes}\n\nConfirmed: ${confirmationData.confirmation_notes || ''}`
          : `Confirmed: ${confirmationData.confirmation_notes || ''}`,
      },
      { transaction }
    );

    // Update bank transfer status
    await bankTransfer.update(
      {
        transfer_status: BankTransferStatus.CONFIRMED,
        confirmed_at: confirmationData.confirmation_date,
        confirmed_by: staffId,
        confirmation_reference: confirmationData.confirmation_reference,
        transfer_notes: bankTransfer.transfer_notes
          ? `${bankTransfer.transfer_notes}\n\nConfirmed: ${confirmationData.confirmation_notes ||
              ''}`
          : `Confirmed: ${confirmationData.confirmation_notes || ''}`,
      },
      { transaction }
    );

    // Update journal entries to reflect confirmation
    const journalEntry = await this.updateBankTransferJournalEntries(
      payment,
      confirmationData.confirmed_amount,
      staffId,
      transaction
    );

    logger.info(`Bank transfer payment confirmed: ${payment.payment_reference}`, {
      paymentId: payment.id,
      bankTransferId: bankTransfer.id,
      confirmedAmount: confirmationData.confirmed_amount,
      staffId,
    });

    return {
      payment,
      bankTransfer,
      journalEntry,
    };
  }

  // ===== BANK TRANSFER SETTLEMENT =====

  /**
   * Settle bank transfer payment
   */
  static async settleBankTransferPayment(
    settlementData: BankTransferSettlementData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    bankTransfer: BankTransfer;
    journalEntry: JournalEntry;
  }> {
    // Get the payment and bank transfer
    const payment = await ClinicalPayment.findByPk(settlementData.payment_id, { transaction });
    if (!payment) {
      throw new BadException('Payment Not Found', 404, 'The specified payment could not be found');
    }

    const bankTransfer = await BankTransfer.findOne({
      where: { payment_id: settlementData.payment_id },
      transaction,
    });

    if (!bankTransfer) {
      throw new BadException(
        'Bank Transfer Not Found',
        404,
        'The specified bank transfer could not be found'
      );
    }

    // Validate payment method
    if (payment.payment_method !== 'BANK_TRANSFER') {
      throw new BadException(
        'Invalid Payment Method',
        400,
        'Payment is not a bank transfer payment'
      );
    }

    // Validate payment status
    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new BadException(
        'Invalid Payment Status',
        400,
        `Payment status is ${payment.status}, cannot settle`
      );
    }

    // Validate settlement amount
    if (Math.abs(settlementData.settled_amount - payment.amount) > 0.01) {
      throw new BadException(
        'Amount Mismatch',
        400,
        `Settled amount (${settlementData.settled_amount}) does not match payment amount (${payment.amount})`
      );
    }

    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Update payment status to settled
    await payment.update(
      {
        status: PaymentStatus.SETTLED,
        notes: payment.notes
          ? `${payment.notes}\n\nSettled: ${settlementData.notes || ''}`
          : `Settled: ${settlementData.notes || ''}`,
      },
      { transaction }
    );

    // Update bank transfer status
    await bankTransfer.update(
      {
        transfer_status: BankTransferStatus.SETTLED,
        settled_at: settlementData.settlement_date,
        settled_by: staffId,
        settlement_reference: settlementData.settlement_reference,
        bank_statement_reference: settlementData.bank_statement_reference,
        transfer_notes: bankTransfer.transfer_notes
          ? `${bankTransfer.transfer_notes}\n\nSettled: ${settlementData.notes || ''}`
          : `Settled: ${settlementData.notes || ''}`,
      },
      { transaction }
    );

    // Update journal entries to reflect settlement
    const journalEntry = await this.updateBankTransferSettlementJournalEntries(
      payment,
      settlementData.settled_amount,
      staffId,
      transaction
    );

    logger.info(`Bank transfer payment settled: ${payment.payment_reference}`, {
      paymentId: payment.id,
      bankTransferId: bankTransfer.id,
      settledAmount: settlementData.settled_amount,
      staffId,
    });

    return {
      payment,
      bankTransfer,
      journalEntry,
    };
  }

  // ===== BANK STATEMENT RECONCILIATION =====

  /**
   * Reconcile bank statement
   */
  static async reconcileBankStatement(
    reconciliationData: BankStatementReconciliationData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    reconciled_payments: ClinicalPayment[];
    reconciled_transfers: BankTransfer[];
    journalEntries: JournalEntry[];
  }> {
    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    const reconciledPayments: ClinicalPayment[] = [];
    const reconciledTransfers: BankTransfer[] = [];
    const journalEntries: JournalEntry[] = [];

    // Process each expected credit
    for (const expectedCredit of reconciliationData.expected_credits) {
      const payment = await ClinicalPayment.findByPk(expectedCredit.payment_id, { transaction });

      if (payment && payment.payment_method === 'BANK_TRANSFER') {
        const bankTransfer = await BankTransfer.findOne({
          where: { payment_id: expectedCredit.payment_id },
          transaction,
        });

        if (bankTransfer) {
          // Find matching actual credit
          const actualCredit = reconciliationData.actual_credits.find(
            ac => ac.payment_id === expectedCredit.payment_id
          );

          if (actualCredit) {
            // Update payment with bank statement reference
            await payment.update(
              {
                notes: payment.notes
                  ? `${payment.notes}\n\nReconciled: ${reconciliationData.reconciliation_notes ||
                      ''}`
                  : `Reconciled: ${reconciliationData.reconciliation_notes || ''}`,
              },
              { transaction }
            );

            // Update bank transfer with bank statement reference
            await bankTransfer.update(
              {
                bank_statement_reference: reconciliationData.bank_statement_reference,
                transfer_notes: bankTransfer.transfer_notes
                  ? `${
                      bankTransfer.transfer_notes
                    }\n\nReconciled: ${reconciliationData.reconciliation_notes || ''}`
                  : `Reconciled: ${reconciliationData.reconciliation_notes || ''}`,
              },
              { transaction }
            );

            reconciledPayments.push(payment);
            reconciledTransfers.push(bankTransfer);

            // Create reconciliation journal entries
            const journalEntry = await this.createBankReconciliationJournalEntries(
              payment,
              expectedCredit.expected_amount,
              actualCredit.actual_amount,
              staffId,
              transaction
            );

            journalEntries.push(journalEntry);
          }
        }
      }
    }

    logger.info(`Bank statement reconciled: ${reconciliationData.bank_statement_reference}`, {
      statementReference: reconciliationData.bank_statement_reference,
      reconciledPayments: reconciledPayments.length,
      reconciledTransfers: reconciledTransfers.length,
      staffId,
    });

    return {
      reconciled_payments: reconciledPayments,
      reconciled_transfers: reconciledTransfers,
      journalEntries,
    };
  }

  // ===== JOURNAL ENTRIES =====

  /**
   * Create journal entries for bank transfer payment
   */
  private static async createBankTransferJournalEntries(
    payment: ClinicalPayment,
    amount: number,
    transferFee: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get chart of accounts
      const bankTransferReceivablesAccount = await ChartOfAccount.findOne({
        where: { code: '1102' }, // Bank Transfer Receivables account
        transaction,
      });

      const serviceRevenueAccount = await ChartOfAccount.findOne({
        where: { code: '4001' }, // Service Revenue account
        transaction,
      });

      const bankFeesAccount = await ChartOfAccount.findOne({
        where: { code: '5000' }, // Bank Fees account
        transaction,
      });

      if (!bankTransferReceivablesAccount || !serviceRevenueAccount || !bankFeesAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Transfer Receivables, Service Revenue, or Bank Fees accounts not found'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: payment.payment_reference,
          description: `Bank transfer payment received: ${payment.notes ||
            'Patient bank transfer'}`,
          entry_type: 'BANK_TRANSFER_PAYMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment.period_id, // Will be set by financial period middleware
          visit_id: payment.visit_id,
          patient_id: payment.patient_id,
        },
        { transaction }
      );

      // Create journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankTransferReceivablesAccount.id,
          debit: amount,
          credit: 0,
          description: `Bank transfer receivable for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: amount - transferFee,
          description: `Revenue from bank transfer payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: bankFeesAccount.id,
          debit: 0,
          credit: transferFee,
          description: `Bank transfer fee for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for bank transfer payment: ${payment.payment_reference}`,
        {
          paymentId: payment.id,
          journalEntryId: journalEntry.id,
          amount,
          transferFee,
        }
      );

      return journalEntry;
    } catch (error) {
      logger.error('Failed to create journal entries for bank transfer payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for bank transfer payment'
      );
    }
  }

  /**
   * Update journal entries for bank transfer confirmation
   */
  private static async updateBankTransferJournalEntries(
    payment: ClinicalPayment,
    confirmedAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get the journal entry for this payment
      const journalEntry = await JournalEntry.findOne({
        where: { reference: payment.payment_reference },
        transaction,
      });

      if (journalEntry) {
        // Update journal entry description to reflect confirmation
        await journalEntry.update(
          {
            description: `Bank transfer payment confirmed: ${payment.notes ||
              'Patient bank transfer'}`,
          },
          { transaction }
        );

        logger.info(
          `Journal entry updated for bank transfer confirmation: ${payment.payment_reference}`,
          {
            paymentId: payment.id,
            journalEntryId: journalEntry.id,
          }
        );
      }

      return journalEntry!;
    } catch (error) {
      logger.error('Failed to update journal entries for bank transfer confirmation:', error);
      throw new BadException(
        'Journal Entry Update Failed',
        500,
        'Failed to update accounting entries for bank transfer confirmation'
      );
    }
  }

  /**
   * Update journal entries for bank transfer settlement
   */
  private static async updateBankTransferSettlementJournalEntries(
    payment: ClinicalPayment,
    settledAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get chart of accounts
      const bankAccountGL = await ChartOfAccount.findOne({
        where: { code: '1002' }, // Bank Account account
        transaction,
      });

      const bankTransferReceivablesAccount = await ChartOfAccount.findOne({
        where: { code: '1300' }, // Bank Transfer Receivables account
        transaction,
      });

      if (!bankAccountGL || !bankTransferReceivablesAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Account or Bank Transfer Receivables accounts not found'
        );
      }

      // Create settlement journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: `SETTLE-${payment.payment_reference}`,
          description: `Bank transfer settlement for payment ${payment.payment_reference}`,
          entry_type: 'BANK_TRANSFER_SETTLEMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: null, // Will be set by financial period middleware
        },
        { transaction }
      );

      // Create settlement journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: settledAmount,
          credit: 0,
          description: `Bank transfer settlement for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: bankTransferReceivablesAccount.id,
          debit: 0,
          credit: settledAmount,
          description: `Settlement of bank transfer receivable for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for bank transfer settlement: ${payment.payment_reference}`,
        {
          paymentId: payment.id,
          journalEntryId: journalEntry.id,
          amount: settledAmount,
        }
      );

      return journalEntry;
    } catch (error) {
      logger.error('Failed to create journal entries for bank transfer settlement:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for bank transfer settlement'
      );
    }
  }

  /**
   * Create journal entries for bank reconciliation
   */
  private static async createBankReconciliationJournalEntries(
    payment: ClinicalPayment,
    expectedAmount: number,
    actualAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get chart of accounts
      const bankAccountGL = await ChartOfAccount.findOne({
        where: { code: '1002' }, // Bank Account account
        transaction,
      });

      const bankTransferReceivablesAccount = await ChartOfAccount.findOne({
        where: { code: '1300' }, // Bank Transfer Receivables account
        transaction,
      });

      const varianceAccount = await ChartOfAccount.findOne({
        where: { code: '6000' }, // Variance account
        transaction,
      });

      if (!bankAccountGL || !bankTransferReceivablesAccount || !varianceAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Account, Bank Transfer Receivables, or Variance accounts not found'
        );
      }

      // Calculate variance
      const variance = actualAmount - expectedAmount;

      // Create reconciliation journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: `RECON-${payment.payment_reference}`,
          description: `Bank reconciliation for payment ${payment.payment_reference}`,
          entry_type: 'BANK_RECONCILIATION',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: null, // Will be set by financial period middleware
        },
        { transaction }
      );

      // Create reconciliation journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: actualAmount,
          credit: 0,
          description: `Actual bank credit for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: bankTransferReceivablesAccount.id,
          debit: 0,
          credit: expectedAmount,
          description: `Expected receivable for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
      ];

      // Add variance line if there's a difference
      if (Math.abs(variance) > 0.01) {
        if (variance > 0) {
          // Actual amount is higher than expected
          journalEntryLines.push({
            journal_entry_id: journalEntry.id,
            account_id: varianceAccount.id,
            debit: 0,
            credit: variance,
            description: `Variance adjustment for payment ${payment.payment_reference}`,
            cost_center_id: null,
          });
        } else {
          // Actual amount is lower than expected
          journalEntryLines.push({
            journal_entry_id: journalEntry.id,
            account_id: varianceAccount.id,
            debit: Math.abs(variance),
            credit: 0,
            description: `Variance adjustment for payment ${payment.payment_reference}`,
            cost_center_id: null,
          });
        }
      }

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(`Journal entries created for bank reconciliation: ${payment.payment_reference}`, {
        paymentId: payment.id,
        journalEntryId: journalEntry.id,
        expectedAmount,
        actualAmount,
        variance,
      });

      return journalEntry;
    } catch (error) {
      logger.error('Failed to create journal entries for bank reconciliation:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for bank reconciliation'
      );
    }
  }

  /**
   * Create journal entries for confirmed bank transfer payment (DR Bank Account, CR Service Revenue)
   */
  private static async createConfirmedBankTransferJournalEntries(
    payment: ClinicalPayment,
    amount: number,
    transferFee: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<JournalEntry> {
    try {
      // Get chart of accounts
      const bankAccountGL = await ChartOfAccount.findOne({
        where: { code: '1002' }, // Bank Account account
        transaction,
      });

      const serviceRevenueAccount = await ChartOfAccount.findOne({
        where: { code: '4001' }, // Service Revenue account
        transaction,
      });

      if (!bankAccountGL || !serviceRevenueAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Account or Service Revenue accounts not found'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: new Date(),
          reference: payment.payment_reference,
          description: `Confirmed bank transfer payment: ${payment.notes ||
            'Patient bank transfer'}`,
          entry_type: 'BANK_TRANSFER_CONFIRMATION',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment.period_id, // Will be set by financial period middleware
          visit_id: payment.visit_id,
          patient_id: payment.patient_id,
        },
        { transaction }
      );

      // Create journal entry lines for confirmed transfer (DR Bank Account, CR Service Revenue)
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: amount,
          credit: 0,
          description: `Bank transfer received and confirmed: ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: amount - transferFee,
          description: `Revenue from confirmed bank transfer: ${payment.payment_reference}`,
          cost_center_id: null,
        },
      ];

      // Add transfer fee entry if applicable
      if (transferFee > 0) {
        const bankFeesAccount = await ChartOfAccount.findOne({
          where: { code: '5001' }, // Bank Fees account (child of 5000)
          transaction,
        });

        if (bankFeesAccount) {
          journalEntryLines.push({
            journal_entry_id: journalEntry.id,
            account_id: bankFeesAccount.id,
            debit: 0,
            credit: transferFee,
            description: `Bank transfer fee for payment: ${payment.payment_reference}`,
            cost_center_id: null,
          });
        }
      }

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for confirmed bank transfer payment: ${payment.payment_reference}`,
        {
          paymentId: payment.id,
          journalEntryId: journalEntry.id,
          amount,
          transferFee,
        }
      );

      return journalEntry;
    } catch (error) {
      logger.error('Failed to create journal entries for confirmed bank transfer payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for confirmed bank transfer payment'
      );
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate expected settlement date (3-5 business days from transfer date)
   */
  private static calculateExpectedSettlementDate(transferDate: Date): Date {
    const settlementDate = new Date(transferDate);
    let businessDays = 0;
    const currentDate = new Date(transferDate);

    while (businessDays < 3) {
      currentDate.setDate(currentDate.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        businessDays++;
      }
    }

    settlementDate.setDate(settlementDate.getDate() + businessDays);
    return settlementDate;
  }

  /**
   * Get bank transfer payment summary
   */
  static async getBankTransferPaymentSummary(paymentId: number): Promise<BankTransferSummary> {
    const payment = await ClinicalPayment.findByPk(paymentId, {
      include: [
        {
          model: BankTransfer,
          as: 'bankTransfer',
          include: [{ model: BankAccount, as: 'bankAccount' }],
        },
      ],
    });

    if (!payment) {
      throw new BadException(
        'Bank Transfer Payment Not Found',
        404,
        'The specified bank transfer payment could not be found'
      );
    }

    if (payment.payment_method !== 'BANK_TRANSFER') {
      throw new BadException(
        'Invalid Payment Method',
        400,
        'Payment is not a bank transfer payment'
      );
    }

    const bankTransfer = (payment as any).bankTransfer;
    if (!bankTransfer) {
      throw new BadException(
        'Bank Transfer Details Not Found',
        404,
        'Bank transfer details could not be found'
      );
    }

    // Calculate days to settlement
    const today = new Date();
    const expectedSettlement = bankTransfer.expected_settlement_date || new Date();
    const daysToSettlement = Math.ceil(
      (expectedSettlement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysToSettlement < 0;

    return {
      id: payment.id,
      payment_reference: payment.payment_reference,
      amount: payment.amount,
      bank_account: bankTransfer.bankAccount?.account_name || 'N/A',
      transfer_date: bankTransfer.transfer_date || new Date(),
      expected_settlement_date: bankTransfer.expected_settlement_date || new Date(),
      days_to_settlement: daysToSettlement,
      is_overdue: isOverdue,
      transfer_status: bankTransfer.transfer_status || 'PENDING',
      transfer_fee: bankTransfer.transfer_fee || 0,
      confirmed_at: bankTransfer.confirmed_at,
      settled_at: bankTransfer.settled_at,
    };
  }

  /**
   * Get bank transfer transaction history
   */
  static async getBankTransferTransactionHistory(
    filters: any = {}
  ): Promise<{
    payments: ClinicalPayment[];
    bankTransfers: BankTransfer[];
    total: number;
    summary: any;
  }> {
    const {
      bank_account_id,
      transfer_status,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {
      payment_method: 'BANK_TRANSFER',
    };

    if (status) where.status = status;
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ClinicalPayment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'processedByStaff' },
        {
          model: BankTransfer,
          as: 'bankTransfer',
          where: bank_account_id ? { bank_account_id } : {},
          include: [{ model: BankAccount, as: 'bankAccount' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Filter by transfer status if specified
    let filteredRows = rows;
    if (transfer_status) {
      filteredRows = rows.filter(
        row => row.bankTransfer && row.bankTransfer.transfer_status === transfer_status
      );
    }

    // Calculate summary
    const summary = {
      total_payments: count,
      total_amount: filteredRows.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      total_transfer_fees: filteredRows.reduce(
        (sum, t) => sum + (t.bankTransfer?.transfer_fee || 0),
        0
      ),
      pending_payments: filteredRows.filter(t => t.bankTransfer?.transfer_status === 'PENDING')
        .length,
      confirmed_payments: filteredRows.filter(t => t.bankTransfer?.transfer_status === 'CONFIRMED')
        .length,
      settled_payments: filteredRows.filter(t => t.bankTransfer?.transfer_status === 'SETTLED')
        .length,
      failed_payments: filteredRows.filter(t => t.bankTransfer?.transfer_status === 'FAILED')
        .length,
      cancelled_payments: filteredRows.filter(t => t.bankTransfer?.transfer_status === 'CANCELLED')
        .length,
      overdue_payments: filteredRows.filter(t => {
        if (
          !t.bankTransfer?.expected_settlement_date ||
          t.bankTransfer?.transfer_status === 'SETTLED'
        )
          return false;
        return new Date(t.bankTransfer.expected_settlement_date) < new Date();
      }).length,
    };

    return {
      payments: filteredRows,
      bankTransfers: filteredRows.map(row => row.bankTransfer).filter(Boolean),
      total: count,
      summary,
    };
  }
}

export default BankTransferPaymentService;
