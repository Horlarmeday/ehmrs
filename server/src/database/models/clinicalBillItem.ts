import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ClinicalBill } from './clinicalBill';
import { BillItemPaymentStatus, BillItemTypeEnum } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'clinical_bill_items' })
export class ClinicalBillItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ClinicalBill)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bill id is required',
      },
    },
  })
  bill_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(BillItemTypeEnum)),
    allowNull: false,
  })
  item_type: BillItemTypeEnum;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'item id is required',
      },
    },
  })
  item_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'item name is required',
      },
    },
  })
  item_name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'item code is required',
      },
    },
  })
  item_code: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  unit_price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  total_price: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  })
  discount_percentage: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  discount_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  final_price: number;

  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
  })
  paid_at: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillItemPaymentStatus)),
    allowNull: false,
    defaultValue: BillItemPaymentStatus.PENDING,
  })
  payment_status: BillItemPaymentStatus;

  // Relationships
  @BelongsTo(() => ClinicalBill)
  bill: ClinicalBill;
}
