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
import { Staff } from './staff';
import { BankAccount } from './bankAccount';

@Table({ timestamps: true, tableName: 'bank_transfers' })
export class BankTransfer extends Model {
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

  @ForeignKey(() => BankAccount)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  bank_account_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Date when bank transfer was initiated',
  })
  transfer_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: new Date(),
    comment: 'Expected date when bank transfer will be settled',
  })
  expected_settlement_date: Date;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Bank transfer fee amount',
  })
  transfer_fee: number;

  @Column({
    type: DataType.ENUM('PENDING', 'CONFIRMED', 'SETTLED', 'FAILED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Status of the bank transfer process',
  })
  transfer_status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when bank transfer was confirmed',
  })
  confirmed_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Staff member who confirmed the bank transfer',
  })
  confirmed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when bank transfer was settled',
  })
  settled_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Staff member who settled the bank transfer',
  })
  settled_by: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference number for bank transfer settlement',
  })
  settlement_reference: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference from bank statement for reconciliation',
  })
  bank_statement_reference: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference number for bank transfer confirmation',
  })
  confirmation_reference: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about the bank transfer',
  })
  transfer_notes: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of transfer attempts made',
  })
  transfer_attempts: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date of last transfer attempt',
  })
  last_transfer_attempt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Error message from last transfer attempt',
  })
  transfer_error_message: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Name of the transfer processor used',
  })
  transfer_processor: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference from the transfer processor',
  })
  transfer_processor_reference: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    defaultValue: 'NGN',
    comment: 'Currency of the transfer',
  })
  transfer_currency: string;

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
    comment: 'Original currency of the transfer',
  })
  original_currency: string;

  // Relationships
  @BelongsTo(() => ClinicalPayment, { foreignKey: 'payment_id' })
  payment: ClinicalPayment;

  @BelongsTo(() => BankAccount, { foreignKey: 'bank_account_id' })
  bankAccount: BankAccount;

  @BelongsTo(() => Staff, { foreignKey: 'confirmed_by' })
  confirmedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'settled_by' })
  settledByStaff: Staff;
}
