import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { CashRegister } from './cashRegister';
import { CashMovementType } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'Cash_Movement' })
export class CashMovement extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => CashRegister)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Cash register where movement occurred',
  })
  register_id: number;

  @Column({
    type: DataType.ENUM(
      'CASH_IN',
      'CASH_OUT',
      'PAYMENT_RECEIVED',
      'CHANGE_GIVEN',
      'OPENING_BALANCE',
      'CLOSING_BALANCE',
      'RECONCILIATION',
      'ADJUSTMENT',
      'REFUND',
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER_IN',
      'TRANSFER_OUT'
    ),
    allowNull: false,
    comment: 'Type of cash movement',
  })
  movement_type: CashMovementType;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount of cash movement',
  })
  amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Balance before movement',
  })
  previous_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Balance after movement',
  })
  new_balance: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Description of the movement',
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Reference number for the movement',
  })
  reference_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Related transaction ID or payment reference',
  })
  transaction_reference: string;

  @Column({
    type: DataType.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'COMPLETED',
    comment: 'Status of the cash movement',
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about the movement',
  })
  notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when movement was processed',
  })
  processed_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when movement was reversed (if applicable)',
  })
  reversed_at: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Reason for reversal (if applicable)',
  })
  reversal_reason: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this movement has been reversed',
  })
  is_reversed: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this movement requires approval',
  })
  requires_approval: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this movement has been approved',
  })
  is_approved: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when movement was approved',
  })
  approved_at: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Staff member who approved the movement',
  })
  approved_by: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Approval notes or comments',
  })
  approval_notes: string;

  // Foreign Keys
  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Staff member who processed the movement',
  })
  processed_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Staff member who reversed the movement',
  })
  reversed_by: number;

  // Relationships
  @BelongsTo(() => CashRegister, { as: 'cashRegister' })
  cashRegister: CashRegister;

  @BelongsTo(() => Staff, { as: 'processedByStaff' })
  processedByStaff: Staff;

  @BelongsTo(() => Staff, { as: 'approvedByStaff' })
  approvedByStaff: Staff;

  @BelongsTo(() => Staff, { as: 'reversedByStaff' })
  reversedByStaff: Staff;

  // Indexes for performance
  @Index(['register_id'])
  @Index(['movement_type'])
  @Index(['processed_by'])
  @Index(['status'])
  @Index(['processed_at'])
  @Index(['transaction_reference'])
  @Index(['is_reversed'])

  // Static methods (Sequelize best practice)
  /**
   * Reverse a cash movement
   */
  static async reverse(movementId: number, reason: string, staffId: number): Promise<void> {
    const movement = await CashMovement.findByPk(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }

    if (movement.is_reversed) {
      throw new Error('Movement has already been reversed');
    }

    if (movement.status !== 'COMPLETED') {
      throw new Error('Only completed movements can be reversed');
    }

    await movement.update({
      is_reversed: true,
      reversed_at: new Date(),
      reversed_by: staffId,
      reversal_reason: reason,
      status: 'CANCELLED',
    });
  }

  /**
   * Approve a cash movement
   */
  static async approve(movementId: number, staffId: number, notes?: string): Promise<void> {
    const movement = await CashMovement.findByPk(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }

    if (!movement.requires_approval) {
      throw new Error('Movement does not require approval');
    }

    if (movement.is_approved) {
      throw new Error('Movement has already been approved');
    }

    await movement.update({
      is_approved: true,
      approved_at: new Date(),
      approved_by: staffId,
      approval_notes: notes,
    });
  }

  /**
   * Get movement summary
   */
  static async getSummary(movementId: number) {
    const movement = await CashMovement.findByPk(movementId, {
      include: [
        { model: Staff, as: 'processedByStaff' },
        { model: Staff, as: 'approvedByStaff' },
      ],
    });

    if (!movement) {
      throw new Error('Movement not found');
    }

    return {
      id: movement.id,
      register_id: movement.register_id,
      movement_type: movement.movement_type,
      amount: movement.amount,
      previous_balance: movement.previous_balance,
      new_balance: movement.new_balance,
      description: movement.description,
      reference_number: movement.reference_number,
      transaction_reference: movement.transaction_reference,
      status: movement.status,
      processed_at: movement.processed_at,
      processed_by: movement.processedByStaff
        ? {
            id: movement.processedByStaff.id,
            name: `${movement.processedByStaff.firstname} ${movement.processedByStaff.lastname}`,
          }
        : null,
      is_reversed: movement.is_reversed,
      reversed_at: movement.reversed_at,
      reversal_reason: movement.reversal_reason,
      requires_approval: movement.requires_approval,
      is_approved: movement.is_approved,
      approved_at: movement.approved_at,
      approved_by: movement.approvedByStaff
        ? {
            id: movement.approvedByStaff.id,
            name: `${movement.approvedByStaff.firstname} ${movement.approvedByStaff.lastname}`,
          }
        : null,
      approval_notes: movement.approval_notes,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    };
  }

  /**
   * Check if movement can be reversed
   */
  static async canBeReversed(movementId: number): Promise<boolean> {
    const movement = await CashMovement.findByPk(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }
    return !movement.is_reversed && movement.status === 'COMPLETED';
  }

  /**
   * Check if movement requires approval
   */
  static async needsApproval(movementId: number): Promise<boolean> {
    const movement = await CashMovement.findByPk(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }
    return movement.requires_approval && !movement.is_approved;
  }

  /**
   * Get movement impact on register balance
   */
  static async getBalanceImpact(movementId: number): Promise<number> {
    const movement = await CashMovement.findByPk(movementId);
    if (!movement) {
      throw new Error('Movement not found');
    }

    switch (movement.movement_type) {
      case 'CASH_IN':
        return movement.amount;
      case 'CASH_OUT':
        return -movement.amount;
      case 'PAYMENT_RECEIVED':
        return 0; // No impact on register balance
      case 'RECONCILIATION':
        return movement.new_balance - movement.previous_balance;
      default:
        return 0;
    }
  }
}
