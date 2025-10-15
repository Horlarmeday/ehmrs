import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { CashMovement } from './cashMovement';
import { CashRegisterStatus } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'Cash_Register' })
export class CashRegister extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Register code is required',
      },
    },
  })
  register_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Register name is required',
      },
    },
  })
  register_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Location or department where register is located',
  })
  location: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Current cash balance in register',
  })
  current_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Opening balance for the day',
  })
  opening_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Expected closing balance for the day',
  })
  expected_closing_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Actual closing balance for the day',
  })
  actual_closing_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total cash received today',
  })
  total_cash_received: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total cash disbursed today',
  })
  total_cash_disbursed: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total change given today',
  })
  total_change_given: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total cash payments processed today',
  })
  total_payments_processed: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of transactions processed today',
  })
  transaction_count: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when register was last opened',
  })
  last_opened_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when register was last closed',
  })
  last_closed_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when register was last reconciled',
  })
  last_reconciled_at: Date;

  @Column({
    type: DataType.ENUM(...Object.values(CashRegisterStatus)),
    allowNull: false,
    defaultValue: CashRegisterStatus.OPEN,
    comment: 'Current status of the cash register',
  })
  status: CashRegisterStatus;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether register is currently active',
  })
  is_active: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether register is currently in use',
  })
  is_in_use: boolean;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Minimum balance required to keep register open',
  })
  minimum_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Maximum balance allowed in register',
  })
  maximum_balance: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about the register',
  })
  notes: string;

  // Foreign Keys
  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Staff member currently assigned to this register',
  })
  assigned_staff_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Staff member who last opened the register',
  })
  opened_by_staff_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Staff member who last closed the register',
  })
  closed_by_staff_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Staff member who last reconciled the register',
  })
  reconciled_by_staff_id: number;

  // Relationships
  @BelongsTo(() => Staff, { as: 'assignedStaff' })
  assignedStaff: Staff;

  @BelongsTo(() => Staff, { as: 'openedByStaff' })
  openedByStaff: Staff;

  @BelongsTo(() => Staff, { as: 'closedByStaff' })
  closedByStaff: Staff;

  @BelongsTo(() => Staff, { as: 'reconciledByStaff' })
  reconciledByStaff: Staff;

  @HasMany(() => CashMovement, { as: 'cashMovements' })
  cashMovements: CashMovement[];

  // Indexes for performance
  @Index(['register_code'])
  @Index(['status'])
  @Index(['assigned_staff_id'])
  @Index(['is_active'])
  @Index(['location'])

  // Static methods (Sequelize best practice)
  /**
   * Open the cash register
   */
  static async openRegister(
    registerId: number,
    openingAmount: number,
    staffId: number
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'CLOSED') {
      throw new Error('Register must be closed before opening');
    }

    if (openingAmount < 0) {
      throw new Error('Opening amount cannot be negative');
    }

    await register.update({
      status: 'OPEN',
      opening_balance: openingAmount,
      current_balance: openingAmount,
      last_opened_at: new Date(),
      opened_by_staff_id: staffId,
      is_in_use: true,
      // Reset daily totals
      total_cash_received: 0,
      total_cash_disbursed: 0,
      total_change_given: 0,
      total_payments_processed: 0,
      transaction_count: 0,
    });
  }

  /**
   * Close the cash register
   */
  static async closeRegister(
    registerId: number,
    closingAmount: number,
    staffId: number
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'OPEN') {
      throw new Error('Register must be open before closing');
    }

    if (closingAmount < 0) {
      throw new Error('Closing amount cannot be negative');
    }

    await register.update({
      status: 'CLOSED',
      actual_closing_balance: closingAmount,
      last_closed_at: new Date(),
      closed_by_staff_id: staffId,
      is_in_use: false,
    });
  }

  /**
   * Add cash to register
   */
  static async addCash(
    registerId: number,
    amount: number,
    description: string,
    staffId: number
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'OPEN') {
      throw new Error('Register must be open to add cash');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const newBalance = parseFloat(register.current_balance.toString()) + amount;

    if (newBalance > register.maximum_balance) {
      throw new Error(
        `Adding ${amount} would exceed maximum balance of ${register.maximum_balance}`
      );
    }

    await register.update({
      current_balance: newBalance,
      total_cash_received: parseFloat(register.total_cash_received.toString()) + amount,
    });

    // Create cash movement record
    await CashMovement.create({
      register_id: register.id,
      movement_type: 'CASH_IN',
      amount: amount,
      description: description,
      previous_balance: register.current_balance,
      new_balance: newBalance,
      processed_by: staffId,
    });
  }

  /**
   * Remove cash from register
   */
  static async removeCash(
    registerId: number,
    amount: number,
    description: string,
    staffId: number
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'OPEN') {
      throw new Error('Register must be open to remove cash');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const newBalance = parseFloat(register.current_balance.toString()) - amount;

    if (newBalance < register.minimum_balance) {
      throw new Error(
        `Removing ${amount} would go below minimum balance of ${register.minimum_balance}`
      );
    }

    await register.update({
      current_balance: newBalance,
      total_cash_disbursed: parseFloat(register.total_cash_disbursed.toString()) + amount,
    });

    // Create cash movement record
    await CashMovement.create({
      register_id: register.id,
      movement_type: 'CASH_OUT',
      amount: amount,
      description: description,
      previous_balance: register.current_balance,
      new_balance: newBalance,
      processed_by: staffId,
    });
  }

  /**
   * Process cash payment
   */
  static async processPayment(
    registerId: number,
    paymentAmount: number,
    cashReceived: number,
    changeGiven: number,
    staffId: number
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'OPEN') {
      throw new Error('Register must be open to process payments');
    }

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (cashReceived < paymentAmount) {
      throw new Error('Cash received must be greater than or equal to payment amount');
    }

    if (changeGiven < 0) {
      throw new Error('Change given cannot be negative');
    }

    const calculatedChange = cashReceived - paymentAmount;
    if (Math.abs(changeGiven - calculatedChange) > 0.01) {
      throw new Error('Change given does not match calculated change');
    }

    // Update register totals
    await register.update({
      total_payments_processed:
        parseFloat(register.total_payments_processed.toString()) + paymentAmount,
      total_change_given: parseFloat(register.total_change_given.toString()) + changeGiven,
      transaction_count: register.transaction_count + 1,
    });

    // Create cash movement record for the payment
    await CashMovement.create({
      register_id: register.id,
      movement_type: 'PAYMENT_RECEIVED',
      amount: paymentAmount,
      description: `Payment received: ${paymentAmount}, Change given: ${changeGiven}`,
      previous_balance: register.current_balance,
      new_balance: register.current_balance,
      processed_by: staffId,
    });
  }

  /**
   * Reconcile register
   */
  static async reconcile(
    registerId: number,
    expectedAmount: number,
    actualAmount: number,
    staffId: number,
    notes?: string
  ): Promise<void> {
    const register = await CashRegister.findByPk(registerId);
    if (!register) {
      throw new Error('Register not found');
    }

    if (register.status !== 'CLOSED') {
      throw new Error('Register must be closed to reconcile');
    }

    const variance = Math.abs(expectedAmount - actualAmount);
    const isBalanced = variance <= 0.01;

    await register.update({
      last_reconciled_at: new Date(),
      reconciled_by_staff_id: staffId,
      notes:
        notes ||
        `Reconciled: Expected ${expectedAmount}, Actual ${actualAmount}, Variance ${variance}`,
    });

    // Create reconciliation record
    await CashMovement.create({
      register_id: register.id,
      movement_type: 'RECONCILIATION',
      amount: variance,
      description: `Reconciliation: Expected ${expectedAmount}, Actual ${actualAmount}, Variance ${variance}`,
      previous_balance: expectedAmount,
      new_balance: actualAmount,
      processed_by: staffId,
    });
  }

  /**
   * Get register summary
   */
  static async getSummary(registerId: number) {
    const register = await CashRegister.findByPk(registerId, {
      include: [{ model: Staff, as: 'assignedStaff' }],
    });

    if (!register) {
      throw new Error('Register not found');
    }

    return {
      id: register.id,
      register_code: register.register_code,
      register_name: register.register_name,
      status: register.status,
      current_balance: register.current_balance,
      opening_balance: register.opening_balance,
      expected_closing_balance: register.expected_closing_balance,
      actual_closing_balance: register.actual_closing_balance,
      total_cash_received: register.total_cash_received,
      total_cash_disbursed: register.total_cash_disbursed,
      total_change_given: register.total_change_given,
      total_payments_processed: register.total_payments_processed,
      transaction_count: register.transaction_count,
      assigned_staff: register.assignedStaff
        ? {
            id: register.assignedStaff.id,
            name: `${register.assignedStaff.firstname} ${register.assignedStaff.lastname}`,
          }
        : null,
      last_opened_at: register.last_opened_at,
      last_closed_at: register.last_closed_at,
      last_reconciled_at: register.last_reconciled_at,
    };
  }
}

export default CashRegister;
