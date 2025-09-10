import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { ClinicalPayment } from './clinicalPayment';
import { ClinicalBillItem } from './clinicalBillItem';

export enum PaymentItemStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

@Table({
  tableName: 'ClinicalPaymentItems',
  timestamps: true,
})
export class ClinicalPaymentItem extends Model<ClinicalPaymentItem> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => ClinicalPayment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index
  payment_id!: number;

  @ForeignKey(() => ClinicalBillItem)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index
  bill_item_id!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  })
  amount_paid!: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentItemStatus)),
    allowNull: false,
    defaultValue: PaymentItemStatus.PENDING,
  })
  payment_status!: PaymentItemStatus;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Percentage of item total that was paid',
  })
  payment_percentage!: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string | null;

  // Associations
  @BelongsTo(() => ClinicalPayment, {
    foreignKey: 'payment_id',
    as: 'payment',
  })
  payment!: ClinicalPayment;

  @BelongsTo(() => ClinicalBillItem, {
    foreignKey: 'bill_item_id',
    as: 'billItem',
  })
  billItem!: ClinicalBillItem;
}

export default ClinicalPaymentItem;
