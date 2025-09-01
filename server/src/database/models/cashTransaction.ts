import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ClinicalPayment } from './clinicalPayment';
import { CashRegister } from './cashRegister';
import { Staff } from './staff';

@Table({ timestamps: true, tableName: 'cash_transactions' })
export class CashTransaction extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ClinicalPayment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  payment_id: number;

  @ForeignKey(() => CashRegister)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  register_id: number;

  @Column({
    type: DataType.ENUM('CASH_IN', 'CASH_OUT', 'PAYMENT_RECEIVED', 'REFUND_GIVEN', 'ADJUSTMENT'),
    allowNull: false,
    comment: 'Type of cash movement',
  })
  movement_type: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount of cash movement',
  })
  amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Balance before the movement',
  })
  previous_balance: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Balance after the movement',
  })
  new_balance: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference number for the transaction',
  })
  reference_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Transaction reference from payment system',
  })
  transaction_reference: string;

  @Column({
    type: DataType.ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REVERSED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Status of the cash transaction',
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Description of the cash movement',
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the transaction needs approval',
  })
  needs_approval: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the transaction has been approved',
  })
  is_approved: boolean;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Staff member who approved the transaction',
  })
  approved_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when transaction was approved',
  })
  approved_at: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the transaction can be reversed',
  })
  can_be_reversed: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the transaction has been reversed',
  })
  is_reversed: boolean;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Staff member who reversed the transaction',
  })
  reversed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when transaction was reversed',
  })
  reversed_at: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Reason for reversal',
  })
  reversal_reason: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Receipt number for the transaction',
  })
  receipt_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Invoice number for the transaction',
  })
  invoice_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Customer name for the transaction',
  })
  customer_name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Customer phone for the transaction',
  })
  customer_phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Customer email for the transaction',
  })
  customer_email: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Payment method used (CASH, CHECK, etc.)',
  })
  payment_method: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Check number if payment is by check',
  })
  check_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Bank name if payment is by check',
  })
  bank_name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Account number if payment is by check',
  })
  account_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Routing number if payment is by check',
  })
  routing_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Currency used for the transaction',
  })
  currency: string;

  @Column({
    type: DataType.DECIMAL(10, 6),
    allowNull: false,
    defaultValue: 1,
    comment: 'Exchange rate if different from base currency',
  })
  exchange_rate: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Original amount in original currency',
  })
  original_amount: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    comment: 'Original currency of the transaction',
  })
  original_currency: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about the transaction',
  })
  notes: string;

  // Relationships
  @BelongsTo(() => ClinicalPayment, { foreignKey: 'payment_id' })
  payment: ClinicalPayment;

  @BelongsTo(() => CashRegister, { foreignKey: 'register_id' })
  register: CashRegister;

  @BelongsTo(() => Staff, { foreignKey: 'approved_by' })
  approvedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'reversed_by' })
  reversedByStaff: Staff;
}
