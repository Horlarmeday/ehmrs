import { Op, Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  POSTerminal,
  ClinicalPayment,
  BankAccount,
  Staff,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  FinancialPeriod,
  Patient,
} from '../../../database/models';
import { PaymentType, PaymentStatus, JournalEntryStatus, FinancialPeriodStatus } from '../enums';
import { logger } from '../../../core/helpers/logger';
import dayjs from 'dayjs';

// ===== POS TERMINAL PAYMENT INTERFACES =====

export interface POSPaymentData {
  bill_id: number;
  patient_id: number;
  amount: number;
  pos_terminal_id: number;
  card_type?: string;
  card_last_four?: string;
  authorization_code?: string;
  transaction_id?: string;
  notes?: string;
  payment_date?: Date;
  payment_reference?: string; // Payment reference for tracking
  period_id?: number; // Financial period ID for accounting
  visit_id?: number;
}

export interface POSTerminalData {
  terminal_id: string;
  bank_account_id: number;
  location: string;
  terminal_type: 'MOBILE' | 'FIXED' | 'KIOSK';
  merchant_name?: string;
  merchant_id?: string;
  daily_transaction_limit?: number;
  daily_amount_limit?: number;
  description?: string;
  created_by: number;
}

export interface POSSettlementData {
  terminal_id: number;
  settlement_date: Date;
  total_transactions: number;
  total_amount: number;
  settlement_reference: string;
  notes?: string;
}

export interface POSTerminalSummary {
  id: number;
  terminal_id: string;
  location: string;
  terminal_type: string;
  merchant_name: string;
  is_active: boolean;
  daily_transaction_limit: number;
  daily_amount_limit: number;
  today_transactions: number;
  today_amount: number;
  last_used_at: Date;
  bank_account: {
    id: number;
    account_name: string;
    account_number: string;
  };
  status: string;
  utilization_percentage: number;
}

// ===== POS TERMINAL PAYMENT SERVICE =====

/**
 * POS Terminal Payment Service
 *
 * This service handles all POS terminal payment operations including:
 * - POS terminal management
 * - Card payment processing
 * - Terminal settlement
 * - Bank account integration
 * - Journal entry creation for double-entry accounting
 */
export class POSTerminalPaymentService {
  // ===== POS TERMINAL MANAGEMENT =====

  /**
   * Create a new POS terminal
   */
  static async createPOSTerminal(
    terminalData: POSTerminalData,
    staffId: number,
    transaction?: Transaction
  ): Promise<POSTerminal> {
    try {
      // Validate terminal ID uniqueness
      const existingTerminal = await POSTerminal.findOne({
        where: { terminal_id: terminalData.terminal_id },
        transaction,
      });

      if (existingTerminal) {
        throw new BadException(
          'Terminal ID Already Exists',
          400,
          'A POS terminal with this ID already exists'
        );
      }

      // Validate bank account
      const bankAccount = await BankAccount.findByPk(terminalData.bank_account_id, { transaction });
      if (!bankAccount || !bankAccount.is_active) {
        throw new BadException(
          'Invalid Bank Account',
          400,
          'The specified bank account is invalid or inactive'
        );
      }

      // Validate staff permissions
      const staff = await Staff.findByPk(staffId, { transaction });
      if (!staff) {
        throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
      }

      // Create POS terminal
      const posTerminal = await POSTerminal.create(
        {
          ...terminalData,
          is_active: true,
          last_used_at: null,
        },
        { transaction }
      );

      logger.info(`POS terminal created: ${posTerminal.terminal_id}`, {
        terminalId: posTerminal.id,
        staffId,
        location: terminalData.location,
      });

      return posTerminal;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to create POS terminal', 500, error.message);
    }
  }

  /**
   * Get POS terminal by ID
   */
  static async getPOSTerminalById(
    terminalId: number,
    transaction?: Transaction
  ): Promise<POSTerminal> {
    const terminal = await POSTerminal.findByPk(terminalId, {
      include: [
        { model: BankAccount, as: 'bankAccount' },
        { model: Staff, as: 'createdByStaff' },
        { model: Staff, as: 'updatedByStaff' },
      ],
      transaction,
    });

    if (!terminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The requested POS terminal could not be found'
      );
    }

    return terminal;
  }

  /**
   * Get all POS terminals with filters
   */
  static async getPOSTerminals(
    filters: any = {}
  ): Promise<{
    terminals: POSTerminal[];
    total: number;
    summary: any;
  }> {
    const {
      search,
      terminal_type,
      location,
      is_active,
      bank_account_id,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { terminal_id: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { merchant_name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (terminal_type) where.terminal_type = terminal_type;
    if (location) where.location = location;
    if (typeof is_active === 'boolean') where.is_active = is_active;
    if (bank_account_id) where.bank_account_id = bank_account_id;

    const offset = (page - 1) * limit;

    const { count, rows } = await POSTerminal.findAndCountAll({
      where,
      include: [{ model: BankAccount, as: 'bankAccount' }],
      order: [['terminal_id', 'ASC']],
      limit,
      offset,
    });

    // Calculate summary
    const summary = {
      total_terminals: count,
      active_terminals: rows.filter(t => t.is_active).length,
      inactive_terminals: rows.filter(t => !t.is_active).length,
      mobile_terminals: rows.filter(t => t.terminal_type === 'MOBILE').length,
      fixed_terminals: rows.filter(t => t.terminal_type === 'FIXED').length,
      kiosk_terminals: rows.filter(t => t.terminal_type === 'KIOSK').length,
    };

    return {
      terminals: rows,
      total: count,
      summary,
    };
  }

  /**
   * Update POS terminal
   */
  static async updatePOSTerminal(
    terminalId: number,
    updateData: Partial<POSTerminalData>,
    staffId: number,
    transaction?: Transaction
  ): Promise<POSTerminal> {
    const terminal = await this.getPOSTerminalById(terminalId, transaction);

    // Validate terminal ID uniqueness if being changed
    if (updateData.terminal_id && updateData.terminal_id !== terminal.terminal_id) {
      const existingTerminal = await POSTerminal.findOne({
        where: { terminal_id: updateData.terminal_id },
        transaction,
      });

      if (existingTerminal) {
        throw new BadException(
          'Terminal ID Already Exists',
          400,
          'A POS terminal with this ID already exists'
        );
      }
    }

    // Validate bank account if being changed
    if (updateData.bank_account_id && updateData.bank_account_id !== terminal.bank_account_id) {
      const bankAccount = await BankAccount.findByPk(updateData.bank_account_id, { transaction });
      if (!bankAccount || !bankAccount.is_active) {
        throw new BadException(
          'Invalid Bank Account',
          400,
          'The specified bank account is invalid or inactive'
        );
      }
    }

    await terminal.update(
      {
        ...updateData,
        updated_by: staffId,
      },
      { transaction }
    );

    logger.info(`POS terminal updated: ${terminal.terminal_id}`, {
      terminalId: terminal.id,
      staffId,
      changes: Object.keys(updateData),
    });

    return terminal;
  }

  /**
   * Activate/deactivate POS terminal
   */
  static async togglePOSTerminalStatus(
    terminalId: number,
    isActive: boolean,
    staffId: number,
    transaction?: Transaction
  ): Promise<POSTerminal> {
    const terminal = await this.getPOSTerminalById(terminalId, transaction);

    if (terminal.is_active === isActive) {
      throw new BadException(
        'Status Already Set',
        400,
        `Terminal is already ${isActive ? 'active' : 'inactive'}`
      );
    }

    await terminal.update(
      {
        is_active: isActive,
        updated_by: staffId,
      },
      { transaction }
    );

    logger.info(`POS terminal status changed: ${terminal.terminal_id}`, {
      terminalId: terminal.id,
      newStatus: isActive ? 'ACTIVE' : 'INACTIVE',
      staffId,
    });

    return terminal;
  }

  // ===== POS PAYMENT PROCESSING =====

  /**
   * Record confirmed POS payment (for payment-first hospital)
   * Patient pays via card at POS terminal, cashier confirms payment received
   */
  static async recordPOSPayment(
    paymentData: POSPaymentData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    terminal: POSTerminal;
    bankAccount: BankAccount;
  }> {
    // Validate staff permissions
    const staff = await Staff.findByPk(staffId, { transaction });
    if (!staff) {
      throw new BadException('Staff Not Found', 404, 'The staff member could not be found');
    }

    // Validate POS terminal
    const terminal = await this.getPOSTerminalById(paymentData.pos_terminal_id, transaction);
    if (!terminal) {
      throw new BadException(
        'POS Terminal Not Found',
        404,
        'The specified POS terminal could not be found'
      );
    }

    // Validate terminal status
    if (!terminal.is_active) {
      throw new BadException(
        'Terminal Inactive',
        400,
        'Cannot process payment on inactive POS terminal'
      );
    }

    // Check daily amount limits
    if (terminal.daily_amount_limit) {
      const todayAmount = await ClinicalPayment.sum('amount', {
        where: {
          pos_terminal_id: terminal.id,
          payment_method: 'CARD',
          createdAt: {
            [Op.gte]: dayjs()
              .startOf('day')
              .toDate(),
          },
        },
        transaction,
      });

      if ((todayAmount || 0) + paymentData.amount > terminal.daily_amount_limit) {
        throw new BadException(
          'Daily Amount Limit Exceeded',
          400,
          `Daily amount limit (${terminal.daily_amount_limit}) exceeded for this terminal`
        );
      }
    }

    // Create clinical payment record - PAID status since payment is confirmed
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: 'CARD',
        payment_type: PaymentType.FULL,
        payment_date: paymentData.payment_date || new Date(),
        notes: paymentData.notes,
        pos_terminal_id: terminal.id,
        status: PaymentStatus.PAID, // ✅ PAID since payment is confirmed
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    // Update POS terminal last used
    await terminal.update({ last_used_at: new Date() }, { transaction });

    // Get bank account for journal entries and balance update
    const bankAccount = await BankAccount.findByPk(terminal.bank_account_id, { transaction });
    if (!bankAccount) {
      throw new BadException('Bank Account Not Found', 500, 'Associated bank account not found');
    }

    // ✅ Update bank account balance since POS payment is confirmed
    await BankAccount.increment(
      {
        current_balance: +paymentData.amount,
      },
      {
        where: { id: terminal.bank_account_id },
        transaction,
      }
    );

    // Create journal entries for confirmed POS payment (DR Bank Account, CR Service Revenue)
    await this.createConfirmedPOSPaymentJournalEntries(
      payment,
      terminal,
      bankAccount,
      paymentData.amount,
      staffId,
      transaction
    );

    logger.info(`Confirmed POS payment recorded: ${payment.payment_reference}`, {
      paymentId: payment.id,
      terminalId: terminal.id,
      amount: paymentData.amount,
      bankAccountBalance: bankAccount.current_balance + paymentData.amount,
      staffId,
    });

    return {
      payment,
      terminal,
      bankAccount,
    };
  }

  // ===== POS TERMINAL SETTLEMENT =====

  /**
   * Process POS terminal settlement
   */
  static async processPOSTerminalSettlement(
    settlementData: POSSettlementData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    settlement: any;
    terminal: POSTerminal;
    bankAccount: BankAccount;
  }> {
    const terminal = await this.getPOSTerminalById(settlementData.terminal_id, transaction);

    // Validate terminal status
    if (!terminal.is_active) {
      throw new BadException('Terminal Inactive', 400, 'Cannot settle inactive POS terminal');
    }

    // Get today's transactions for this terminal
    const todayStart = dayjs(settlementData.settlement_date)
      .startOf('day')
      .toDate();
    const todayEnd = dayjs(todayStart)
      .endOf('day')
      .toDate();

    const todayTransactions = await ClinicalPayment.findAll({
      where: {
        pos_terminal_id: terminal.id,
        payment_method: 'CARD',
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
      transaction,
    });

    const actualTransactions = todayTransactions.length;
    const actualAmount = todayTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount.toString()),
      0
    );

    // Validate settlement data
    if (actualTransactions !== settlementData.total_transactions) {
      throw new BadException(
        'Transaction Count Mismatch',
        400,
        `Expected ${settlementData.total_transactions} transactions, but found ${actualTransactions}`
      );
    }

    if (Math.abs(actualAmount - settlementData.total_amount) > 0.01) {
      throw new BadException(
        'Amount Mismatch',
        400,
        `Expected amount ${settlementData.total_amount}, but actual amount is ${actualAmount}`
      );
    }

    // Get bank account
    const bankAccount = await BankAccount.findByPk(terminal.bank_account_id, { transaction });
    if (!bankAccount) {
      throw new BadException('Bank Account Not Found', 500, 'Associated bank account not found');
    }

    // Create settlement record (you might want to create a separate settlement model)
    const settlement = {
      terminal_id: terminal.id,
      settlement_date: settlementData.settlement_date,
      total_transactions: actualTransactions,
      total_amount: actualAmount,
      settlement_reference: settlementData.settlement_reference,
      notes: settlementData.notes,
      processed_by: staffId,
      processed_at: dayjs().toDate(),
    };

    // Create journal entries for settlement
    await this.createPOSSettlementJournalEntries(
      settlement,
      terminal,
      bankAccount,
      actualAmount,
      staffId,
      transaction
    );

    logger.info(`POS terminal settlement processed: ${settlementData.settlement_reference}`, {
      terminalId: terminal.id,
      transactions: actualTransactions,
      amount: actualAmount,
      staffId,
    });

    return {
      settlement,
      terminal,
      bankAccount,
    };
  }

  // ===== JOURNAL ENTRIES =====

  /**
   * Create journal entries for POS payment
   *
   * @deprecated This method is no longer used. Use createConfirmedPOSPaymentJournalEntries instead.
   * This method was for pending payments, but POS payments are now confirmed immediately.
   */
  private static async createPOSPaymentJournalEntries(
    payment: ClinicalPayment,
    terminal: POSTerminal,
    bankAccount: BankAccount,
    amount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
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
          entry_date: payment.createdAt || dayjs().toDate(),
          reference: payment.payment_reference,
          description: `POS payment received via ${terminal.terminal_id}: ${payment.notes ||
            'Patient payment'}`,
          entry_type: 'POS_PAYMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment.period_id,
          visit_id: payment.visit_id,
          transaction_date: new Date(),
          patient_id: payment.patient_id,
        },
        { transaction }
      );

      // Create journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: amount,
          credit: 0,
          description: `POS payment received via ${terminal.terminal_id}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: amount,
          description: `Revenue from POS payment via ${terminal.terminal_id}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(`Journal entries created for POS payment: ${payment.payment_reference}`, {
        paymentId: payment.id,
        journalEntryId: journalEntry.id,
        amount,
      });
    } catch (error) {
      logger.error('Failed to create journal entries for POS payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for POS payment'
      );
    }
  }

  /**
   * Create journal entries for POS settlement
   */
  private static async createPOSSettlementJournalEntries(
    settlement: any,
    terminal: POSTerminal,
    bankAccount: BankAccount,
    amount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get chart of accounts
      const bankAccountGL = await ChartOfAccount.findOne({
        where: { code: '1002' }, // Bank Account account
        transaction,
      });

      const posSettlementAccount = await ChartOfAccount.findOne({
        where: { code: '1003' }, // POS Settlement account
        transaction,
      });

      if (!bankAccountGL || !posSettlementAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Bank Account or POS Settlement accounts not found'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: settlement.settlement_date,
          reference: settlement.settlement_reference,
          description: `POS terminal settlement: ${terminal.terminal_id} - ${settlement.total_transactions} transactions`,
          entry_type: 'POS_SETTLEMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: null, // Will be set by financial period middleware
        },
        { transaction }
      );

      // Create journal entry lines for settlement
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: posSettlementAccount.id,
          debit: amount,
          credit: 0,
          description: `POS settlement from ${terminal.terminal_id}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: 0,
          credit: amount,
          description: `Bank settlement for ${terminal.terminal_id}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for POS settlement: ${settlement.settlement_reference}`,
        {
          terminalId: terminal.id,
          journalEntryId: journalEntry.id,
          amount,
        }
      );
    } catch (error) {
      logger.error('Failed to create journal entries for POS settlement:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for POS settlement'
      );
    }
  }

  /**
   * Create journal entries for confirmed POS payment
   */
  private static async createConfirmedPOSPaymentJournalEntries(
    payment: ClinicalPayment,
    terminal: POSTerminal,
    bankAccount: BankAccount,
    amount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
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
          entry_date: payment.createdAt || dayjs().toDate(),
          reference: payment.payment_reference,
          description: `POS payment received via ${terminal.terminal_id}: ${payment.notes ||
            'Patient payment'}`,
          entry_type: 'POS_PAYMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment.period_id,
          visit_id: payment.visit_id,
          transaction_date: new Date(),
          patient_id: payment.patient_id,
        },
        { transaction }
      );

      // Create journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccountGL.id,
          debit: amount,
          credit: 0,
          description: `POS payment received via ${terminal.terminal_id}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: amount,
          description: `Revenue from POS payment via ${terminal.terminal_id}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(
        `Journal entries created for confirmed POS payment: ${payment.payment_reference}`,
        {
          paymentId: payment.id,
          journalEntryId: journalEntry.id,
          amount,
        }
      );
    } catch (error) {
      logger.error('Failed to create journal entries for confirmed POS payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        'Failed to create accounting entries for confirmed POS payment'
      );
    }
  }

  // ===== REPORTING =====

  /**
   * Get POS terminal summary
   */
  static async getPOSTerminalSummary(terminalId: number): Promise<POSTerminalSummary> {
    const terminal = await this.getPOSTerminalById(terminalId);

    // Calculate today's usage
    const todayStart = dayjs()
      .startOf('day')
      .toDate();
    const todayEnd = dayjs(todayStart)
      .endOf('day')
      .toDate();

    const todayTransactions = await ClinicalPayment.count({
      where: {
        pos_terminal_id: terminal.id,
        payment_method: 'CARD',
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
    });

    const todayAmount = await ClinicalPayment.sum('amount', {
      where: {
        pos_terminal_id: terminal.id,
        payment_method: 'CARD',
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
    });

    // Calculate utilization percentage
    let utilizationPercentage = 0;
    if (terminal.daily_transaction_limit > 0) {
      utilizationPercentage = Math.round(
        (todayTransactions / terminal.daily_transaction_limit) * 100
      );
    }

    return {
      id: terminal.id,
      terminal_id: terminal.terminal_id,
      location: terminal.location,
      terminal_type: terminal.terminal_type_display,
      merchant_name: terminal.merchant_name || 'N/A',
      is_active: terminal.is_active,
      daily_transaction_limit: terminal.daily_transaction_limit || 0,
      daily_amount_limit: terminal.daily_amount_limit || 0,
      today_transactions: todayTransactions,
      today_amount: todayAmount || 0,
      last_used_at: terminal.last_used_at,
      bank_account: {
        id: terminal.bankAccount.id,
        account_name: terminal.bankAccount.account_name,
        account_number: terminal.bankAccount.account_number,
      },
      status: terminal.status_display,
      utilization_percentage: utilizationPercentage,
    };
  }

  /**
   * Get POS terminal transaction history
   */
  static async getPOSTerminalTransactionHistory(
    terminalId: number,
    filters: any = {}
  ): Promise<{
    transactions: ClinicalPayment[];
    total: number;
    summary: any;
  }> {
    const { start_date, end_date, page = 1, limit = 50 } = filters;

    const where: any = {
      pos_terminal_id: terminalId,
      payment_method: 'CARD',
    };

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = dayjs(start_date).toDate();
      if (end_date) where.createdAt[Op.lte] = dayjs(end_date).toDate();
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ClinicalPayment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'processedByStaff' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Calculate summary
    const summary = {
      total_transactions: count,
      total_amount: rows.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
      average_amount:
        count > 0 ? rows.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) / count : 0,
      unique_patients: new Set(rows.map(t => t.patient_id)).size,
    };

    return {
      transactions: rows,
      total: count,
      summary,
    };
  }
}

export default POSTerminalPaymentService;
