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
import { POSTerminal } from './posTerminal';
import { Staff } from './staff';

@Table({ timestamps: true, tableName: 'pos_terminal_transactions' })
export class POSTerminalTransaction extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ClinicalPayment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'clinical_payments',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  payment_id: number;

  @ForeignKey(() => POSTerminal)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: 'pos_terminals',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  terminal_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: 'Unique transaction ID from POS terminal',
  })
  transaction_id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Authorization code from payment processor',
  })
  authorization_code: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: 'Type of card used (VISA, MASTERCARD, etc.)',
  })
  card_type: string;

  @Column({
    type: DataType.STRING(4),
    allowNull: false,
    comment: 'Last four digits of the card',
  })
  card_last_four: string;

  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Status of the POS transaction',
  })
  transaction_status: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Transaction amount',
  })
  transaction_amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Transaction fee charged',
  })
  transaction_fee: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Merchant discount rate applied',
  })
  merchant_discount_rate: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference from payment processor',
  })
  processor_reference: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Batch number for settlement',
  })
  batch_number: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when transaction was settled',
  })
  settlement_date: Date;

  @Column({
    type: DataType.ENUM('PENDING', 'SETTLED', 'FAILED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Settlement status of the transaction',
  })
  settlement_status: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Settlement reference number',
  })
  settlement_reference: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Amount settled to merchant account',
  })
  settled_amount: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Error message if transaction failed',
  })
  error_message: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: 'Error code if transaction failed',
  })
  error_code: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Response code from payment processor',
  })
  response_code: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Response message from payment processor',
  })
  response_message: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'AVS (Address Verification System) result',
  })
  avs_result: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'CVV (Card Verification Value) result',
  })
  cvv_result: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Card issuer response',
  })
  issuer_response: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Card association response',
  })
  association_response: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Merchant category code',
  })
  merchant_category_code: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Terminal identification code',
  })
  terminal_identification_code: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Merchant identification number',
  })
  merchant_identification_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Acquirer institution identification',
  })
  acquirer_institution_id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Issuer institution identification',
  })
  issuer_institution_id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Cardholder authentication verification value',
  })
  cavv: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Electronic commerce indicator',
  })
  eci: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Universal cardholder authentication field',
  })
  ucaf: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Cardholder authentication verification response',
  })
  cavv_response: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'XID (Transaction ID) for 3D Secure',
  })
  xid: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional transaction notes',
  })
  notes: string;

  // Relationships
  @BelongsTo(() => ClinicalPayment, { foreignKey: 'payment_id' })
  payment: ClinicalPayment;

  @BelongsTo(() => POSTerminal, { foreignKey: 'terminal_id' })
  terminal: POSTerminal;
}
