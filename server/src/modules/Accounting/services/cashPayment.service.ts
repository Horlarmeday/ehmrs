import { Op, Transaction } from 'sequelize';
import { BadException } from '../../../common/util/api-error';
import {
  CashRegister,
  CashMovement,
  ClinicalPayment,
  Staff,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
} from '../../../database/models';
import { PaymentType, PaymentStatus, JournalEntryStatus, CashMovementType } from '../enums';
import { logger } from '../../../core/helpers/logger';
import dayjs from 'dayjs';

// ===== CASH PAYMENT INTERFACES =====

export interface CashPaymentData {
  bill_id: number;
  patient_id: number;
  amount: number;
  cash_received: number;
  change_given: number;
  register_id: number;
  notes?: string;
  payment_date?: Date;
  payment_reference?: string; // Payment reference for tracking
  period_id?: number; // Financial period ID for accounting
  visit_id?: number;
}

export interface CashRegisterData {
  register_code: string;
  register_name: string;
  location: string;
  assigned_staff_id: number;
  minimum_balance: number;
  maximum_balance: number;
  notes?: string;
}

export interface CashMovementData {
  register_id: number;
  movement_type: string;
  amount: number;
  description: string;
  reference_number?: string;
  transaction_reference?: string;
  notes?: string;
  requires_approval?: boolean;
}

export interface CashReconciliationData {
  register_id: number;
  expected_amount: number;
  actual_amount: number;
  notes?: string;
}

export interface CashRegisterSummary {
  id: number;
  register_code: string;
  register_name: string;
  location: string;
  status: string;
  current_balance: number;
  opening_balance: number;
  expected_closing_balance: number;
  actual_closing_balance: number;
  total_cash_received: number;
  total_cash_disbursed: number;
  total_change_given: number;
  total_payments_processed: number;
  transaction_count: number;
  assigned_staff: {
    id: number;
    name: string;
  };
  last_opened_at: Date;
  last_closed_at: Date;
  last_reconciled_at: Date;
  variance?: number;
  is_balanced: boolean;
}

// ===== CASH PAYMENT SERVICE =====

/**
 * Cash Payment Service
 *
 * This service handles all cash payment operations including:
 * - Cash register management
 * - Cash movement tracking
 * - Cash payment processing
 * - Cash reconciliation
 * - Journal entry creation for double-entry accounting
 */
export class CashPaymentService {
  // ===== CASH REGISTER MANAGEMENT =====

  /**
   * Create a new cash register
   */
  static async createCashRegister(
    registerData: CashRegisterData,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    try {
      // Validate register code uniqueness
      const existingRegister = await CashRegister.findOne({
        where: { register_code: registerData.register_code },
        transaction,
      });

      if (existingRegister) {
        throw new BadException(
          'Register Code Already Exists',
          400,
          'A register with this code already exists'
        );
      }

      // Validate assigned staff
      const assignedStaff = await Staff.findByPk(registerData.assigned_staff_id, { transaction });
      if (!assignedStaff) {
        throw new BadException(
          'Assigned Staff Not Found',
          404,
          'The assigned staff member could not be found'
        );
      }

      // Validate balance limits
      if (registerData.minimum_balance < 0) {
        throw new BadException(
          'Invalid Minimum Balance',
          400,
          'Minimum balance cannot be negative'
        );
      }

      if (registerData.maximum_balance <= registerData.minimum_balance) {
        throw new BadException(
          'Invalid Maximum Balance',
          400,
          'Maximum balance must be greater than minimum balance'
        );
      }

      // Create cash register
      const cashRegister = await CashRegister.create(
        {
          ...registerData,
          current_balance: 0,
          opening_balance: 0,
          expected_closing_balance: 0,
          actual_closing_balance: 0,
          total_cash_received: 0,
          total_cash_disbursed: 0,
          total_change_given: 0,
          total_payments_processed: 0,
          transaction_count: 0,
          status: 'CLOSED',
          is_active: true,
          is_in_use: false,
        },
        { transaction }
      );

      logger.info(`Cash register created: ${cashRegister.register_code}`, {
        registerId: cashRegister.id,
        staffId,
        location: registerData.location,
      });

      return cashRegister;
    } catch (error) {
      if (error instanceof BadException) throw error;
      throw new BadException('Failed to create cash register', 500, error.message);
    }
  }

  /**
   * Get cash register by ID
   */
  static async getCashRegisterById(
    registerId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    const register = await CashRegister.findByPk(registerId, {
      include: [
        { model: Staff, as: 'assignedStaff' },
        { model: Staff, as: 'openedByStaff' },
        { model: Staff, as: 'closedByStaff' },
        { model: Staff, as: 'reconciledByStaff' },
      ],
      transaction,
    });

    if (!register) {
      throw new BadException(
        'Cash Register Not Found',
        404,
        'The requested cash register could not be found'
      );
    }

    return register;
  }

  /**
   * Get all cash registers with filters
   */
  static async getCashRegisters(
    filters: any = {}
  ): Promise<{
    registers: CashRegister[];
    total: number;
    summary: any;
  }> {
    const {
      search,
      status,
      location,
      assigned_staff_id,
      is_active,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { register_code: { [Op.like]: `%${search}%` } },
        { register_name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (location) where.location = location;
    if (assigned_staff_id) where.assigned_staff_id = assigned_staff_id;
    if (typeof is_active === 'boolean') where.is_active = is_active;

    const offset = (page - 1) * limit;

    const { count, rows } = await CashRegister.findAndCountAll({
      where,
      include: [{ model: Staff, as: 'assignedStaff' }],
      order: [['register_code', 'ASC']],
      limit,
      offset,
    });

    // Calculate summary
    const summary = {
      total_registers: count,
      open_registers: rows.filter(r => r.status === 'OPEN').length,
      closed_registers: rows.filter(r => r.status === 'CLOSED').length,
      total_balance: rows.reduce((sum, r) => sum + parseFloat(r.current_balance.toString()), 0),
      total_transactions: rows.reduce((sum, r) => sum + r.transaction_count, 0),
    };

    return {
      registers: rows,
      total: count,
      summary,
    };
  }

  /**
   * Update cash register
   */
  static async updateCashRegister(
    registerId: number,
    updateData: Partial<CashRegisterData>,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    const register = await this.getCashRegisterById(registerId, transaction);

    // Validate register code uniqueness if being changed
    if (updateData.register_code && updateData.register_code !== register.register_code) {
      const existingRegister = await CashRegister.findOne({
        where: { register_code: updateData.register_code },
        transaction,
      });

      if (existingRegister) {
        throw new BadException(
          'Register Code Already Exists',
          400,
          'A register with this code already exists'
        );
      }
    }

    // Validate balance limits if being changed
    if (updateData.minimum_balance !== undefined || updateData.maximum_balance !== undefined) {
      const minBalance = updateData.minimum_balance ?? register.minimum_balance;
      const maxBalance = updateData.maximum_balance ?? register.maximum_balance;

      if (minBalance < 0) {
        throw new BadException(
          'Invalid Minimum Balance',
          400,
          'Minimum balance cannot be negative'
        );
      }

      if (maxBalance <= minBalance) {
        throw new BadException(
          'Invalid Maximum Balance',
          400,
          'Maximum balance must be greater than minimum balance'
        );
      }

      // Check if current balance would violate new limits
      if (register.current_balance < minBalance || register.current_balance > maxBalance) {
        throw new BadException(
          'Balance Limit Violation',
          400,
          'Current balance would violate new balance limits'
        );
      }
    }

    await register.update(updateData, { transaction });

    logger.info(`Cash register updated: ${register.register_code}`, {
      registerId: register.id,
      staffId,
      changes: Object.keys(updateData),
    });

    return register;
  }

  // ===== CASH REGISTER OPERATIONS =====

  /**
   * Open cash register
   */
  static async openCashRegister(
    registerId: number,
    openingAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    const register = await this.getCashRegisterById(registerId, transaction);

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can open this register'
      );
    }

    // Validate opening amount
    if (openingAmount < register.minimum_balance) {
      throw new BadException(
        'Insufficient Opening Amount',
        400,
        `Opening amount must be at least ${register.minimum_balance}`
      );
    }

    if (openingAmount > register.maximum_balance) {
      throw new BadException(
        'Excessive Opening Amount',
        400,
        `Opening amount cannot exceed ${register.maximum_balance}`
      );
    }

    // Open the register
    await CashRegister.openRegister(registerId, openingAmount, staffId);

    logger.info(`Cash register opened: ${register.register_code}`, {
      registerId: register.id,
      staffId,
      openingAmount,
    });

    return register;
  }

  /**
   * Close cash register
   */
  static async closeCashRegister(
    registerId: number,
    closingAmount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    const register = await this.getCashRegisterById(registerId, transaction);

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can close this register'
      );
    }

    // Validate closing amount
    if (closingAmount < 0) {
      throw new BadException('Invalid Closing Amount', 400, 'Closing amount cannot be negative');
    }

    // Calculate expected closing balance
    const expectedClosing =
      register.opening_balance + register.total_cash_received - register.total_cash_disbursed;

    // Check for significant variance
    const variance = Math.abs(closingAmount - expectedClosing);
    if (variance > 10) {
      // Allow $10 variance
      logger.warn(`Significant cash variance detected: ${variance}`, {
        registerId: register.id,
        expected: expectedClosing,
        actual: closingAmount,
        staffId,
      });
    }

    // Close the register
    await CashRegister.closeRegister(registerId, closingAmount, staffId);

    logger.info(`Cash register closed: ${register.register_code}`, {
      registerId: register.id,
      staffId,
      closingAmount,
      variance,
    });

    return register;
  }

  // ===== CASH MOVEMENTS =====

  /**
   * Add cash to register
   */
  static async addCashToRegister(
    movementData: CashMovementData,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashMovement> {
    const register = await this.getCashRegisterById(movementData.register_id, transaction);

    // Validate register status
    if (register.status !== 'OPEN') {
      throw new BadException('Register Not Open', 400, 'Cash register must be open to add cash');
    }

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can add cash to this register'
      );
    }

    // Add cash to register
    await CashRegister.addCash(
      movementData.register_id,
      movementData.amount,
      movementData.description,
      staffId
    );

    // Create cash movement record
    const cashMovement = await CashMovement.create(
      {
        ...movementData,
        previous_balance: register.current_balance - movementData.amount,
        new_balance: register.current_balance,
        processed_by: staffId,
        processed_at: new Date(),
        status: 'COMPLETED',
      },
      { transaction }
    );

    logger.info(`Cash added to register: ${register.register_code}`, {
      registerId: register.id,
      amount: movementData.amount,
      staffId,
      movementId: cashMovement.id,
    });

    return cashMovement;
  }

  /**
   * Remove cash from register
   */
  static async removeCashFromRegister(
    movementData: CashMovementData,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashMovement> {
    const register = await this.getCashRegisterById(movementData.register_id, transaction);

    // Validate register status
    if (register.status !== 'OPEN') {
      throw new BadException('Register Not Open', 400, 'Cash register must be open to remove cash');
    }

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can remove cash from this register'
      );
    }

    // Remove cash from register
    await CashRegister.removeCash(
      movementData.register_id,
      movementData.amount,
      movementData.description,
      staffId
    );

    // Create cash movement record
    const cashMovement = await CashMovement.create(
      {
        ...movementData,
        previous_balance: register.current_balance + movementData.amount,
        new_balance: register.current_balance,
        processed_by: staffId,
        processed_at: new Date(),
        status: 'COMPLETED',
      },
      { transaction }
    );

    logger.info(`Cash removed from register: ${register.register_code}`, {
      registerId: register.id,
      amount: movementData.amount,
      staffId,
      movementId: cashMovement.id,
    });

    return cashMovement;
  }

  // ===== CASH PAYMENT PROCESSING =====

  /**
   * Process cash payment
   */
  static async processCashPayment(
    paymentData: CashPaymentData,
    staffId: number,
    transaction?: Transaction
  ): Promise<{
    payment: ClinicalPayment;
    cashMovement: CashMovement;
    register: CashRegister;
  }> {
    const register = await this.getCashRegisterById(paymentData.register_id, transaction);

    // Validate register status
    if (register.status !== 'OPEN') {
      throw new BadException(
        'Register Not Open',
        400,
        'Cash register must be open to process payments'
      );
    }

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can process payments on this register'
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

    if (paymentData.cash_received < paymentData.amount) {
      throw new BadException(
        'Insufficient Cash Received',
        400,
        'Cash received must be greater than or equal to payment amount'
      );
    }

    const calculatedChange = paymentData.cash_received - paymentData.amount;
    if (Math.abs(paymentData.change_given - calculatedChange) > 0.01) {
      throw new BadException(
        'Invalid Change Amount',
        400,
        'Change given does not match calculated change'
      );
    }

    // Process payment on register
    await CashRegister.processPayment(
      paymentData.register_id,
      paymentData.amount,
      paymentData.cash_received,
      paymentData.change_given,
      staffId
    );

    // Create clinical payment record
    const payment = await ClinicalPayment.create(
      {
        payment_reference: paymentData.payment_reference, // Use the generated payment reference
        bill_id: paymentData.bill_id,
        patient_id: paymentData.patient_id,
        amount: paymentData.amount,
        payment_method: 'CASH',
        payment_type: PaymentType.FULL,
        payment_date: paymentData.payment_date || new Date(),
        notes: paymentData.notes,
        cash_received: paymentData.cash_received,
        change_given: paymentData.change_given,
        status: PaymentStatus.PAID,
        processed_by: staffId,
        processed_at: new Date(),
        period_id: paymentData.period_id, // Use the financial period ID
        visit_id: paymentData.visit_id,
      },
      { transaction }
    );

    // Create cash movement record
    const cashMovement = await CashMovement.create(
      {
        register_id: paymentData.register_id,
        movement_type: CashMovementType.PAYMENT_RECEIVED,
        amount: paymentData.amount,
        description: `Payment received: ${paymentData.amount}, Change given: ${paymentData.change_given}`,
        reference_number: `PAY-${payment.id}`,
        transaction_reference: payment.payment_reference,
        previous_balance: register.current_balance,
        new_balance: register.current_balance,
        processed_by: staffId,
        processed_at: new Date(),
        status: 'COMPLETED',
      },
      { transaction }
    );

    // Create journal entries for double-entry accounting
    await this.createCashPaymentJournalEntries(
      payment,
      register,
      paymentData.amount,
      staffId,
      transaction
    );

    logger.info(`Cash payment processed: ${payment.payment_reference}`, {
      paymentId: payment.id,
      registerId: register.id,
      amount: paymentData.amount,
      staffId,
    });

    return {
      payment,
      cashMovement,
      register,
    };
  }

  // ===== CASH RECONCILIATION =====

  /**
   * Reconcile cash register
   */
  static async reconcileCashRegister(
    reconciliationData: CashReconciliationData,
    staffId: number,
    transaction?: Transaction
  ): Promise<CashRegister> {
    const register = await this.getCashRegisterById(reconciliationData.register_id, transaction);

    // Validate register status
    if (register.status !== 'CLOSED') {
      throw new BadException(
        'Register Not Closed',
        400,
        'Cash register must be closed to reconcile'
      );
    }

    // Validate staff permissions
    if (register.assigned_staff_id !== staffId) {
      throw new BadException(
        'Unauthorized Access',
        403,
        'Only assigned staff can reconcile this register'
      );
    }

    // Reconcile the register
    await CashRegister.reconcile(
      reconciliationData.register_id,
      reconciliationData.expected_amount,
      reconciliationData.actual_amount,
      staffId,
      reconciliationData.notes
    );

    logger.info(`Cash register reconciled: ${register.register_code}`, {
      registerId: register.id,
      expected: reconciliationData.expected_amount,
      actual: reconciliationData.actual_amount,
      staffId,
    });

    return register;
  }

  // ===== JOURNAL ENTRIES =====

  /**
   * Create journal entries for cash payment
   */
  private static async createCashPaymentJournalEntries(
    payment: ClinicalPayment,
    register: CashRegister,
    amount: number,
    staffId: number,
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Get chart of accounts
      const cashRegisterAccount = await ChartOfAccount.findOne({
        where: { code: '1004' }, // Cash Register account
        transaction,
      });

      const serviceRevenueAccount = await ChartOfAccount.findOne({
        where: { code: '4001' }, // Service Revenue account
        transaction,
      });

      if (!cashRegisterAccount || !serviceRevenueAccount) {
        throw new BadException(
          'Required Chart of Accounts Missing',
          500,
          'Cash Register or Service Revenue accounts not found'
        );
      }

      // Create journal entry
      const journalEntry = await JournalEntry.create(
        {
          entry_date: payment.createdAt || new Date(),
          reference: payment.payment_reference,
          description: `Cash payment received: ${payment.notes || 'Patient payment'}`,
          entry_type: 'CASH_PAYMENT',
          status: JournalEntryStatus.POSTED,
          created_by: staffId,
          period_id: payment?.period_id || null, // Will be set by financial period middleware
          transaction_date: dayjs().toDate(),
          visit_id: payment.visit_id,
          patient_id: payment.patient_id,
        },
        { transaction }
      );

      // Create journal entry lines
      const journalEntryLines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: cashRegisterAccount.id,
          debit: amount,
          credit: 0,
          description: `Cash received for payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: serviceRevenueAccount.id,
          debit: 0,
          credit: amount,
          description: `Revenue from cash payment ${payment.payment_reference}`,
          cost_center_id: null,
        },
      ];

      await JournalEntryLine.bulkCreate(journalEntryLines, { transaction });

      logger.info(`Journal entries created for cash payment: ${payment.payment_reference}`, {
        paymentId: payment.id,
        journalEntryId: journalEntry.id,
        amount,
      });
    } catch (error) {
      console.error(error);
      logger.error('Failed to create journal entries for cash payment:', error);
      throw new BadException(
        'Journal Entry Creation Failed',
        500,
        `Failed to create accounting entries for cash payment, ${error}`
      );
    }
  }

  // ===== REPORTING =====

  /**
   * Get cash register summary
   */
  static async getCashRegisterSummary(registerId: number): Promise<CashRegisterSummary> {
    const register = await this.getCashRegisterById(registerId);

    const summary = await CashRegister.getSummary(registerId);
    const variance = summary.actual_closing_balance - summary.expected_closing_balance;
    const isBalanced = Math.abs(variance) <= 0.01;

    return {
      ...summary,
      variance,
      is_balanced: isBalanced,
      location: register?.location || 'N/A',
    };
  }

  /**
   * Get cash movement history
   */
  static async getCashMovementHistory(
    registerId: number,
    filters: any = {}
  ): Promise<{
    movements: CashMovement[];
    total: number;
    summary: any;
  }> {
    const { movement_type, start_date, end_date, page = 1, limit = 50 } = filters;

    const where: any = { register_id: registerId };

    if (movement_type) where.movement_type = movement_type;
    if (start_date || end_date) {
      where.processed_at = {};
      if (start_date) where.processed_at[Op.gte] = new Date(start_date);
      if (end_date) where.processed_at[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await CashMovement.findAndCountAll({
      where,
      include: [
        { model: Staff, as: 'processedByStaff' },
        { model: Staff, as: 'approvedByStaff' },
      ],
      order: [['processed_at', 'DESC']],
      limit,
      offset,
    });

    // Calculate summary
    const summary = {
      total_movements: count,
      total_cash_in: rows
        .filter(m => ['CASH_IN', 'PAYMENT_RECEIVED', 'OPENING_BALANCE'].includes(m.movement_type))
        .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0),
      total_cash_out: rows
        .filter(m => ['CASH_OUT', 'CHANGE_GIVEN', 'CLOSING_BALANCE'].includes(m.movement_type))
        .reduce((sum, m) => sum + parseFloat(m.amount.toString()), 0),
      pending_approvals: rows.filter(m => CashMovement.needsApproval(m.id)).length,
    };

    return {
      movements: rows,
      total: count,
      summary,
    };
  }
}

export default CashPaymentService;
