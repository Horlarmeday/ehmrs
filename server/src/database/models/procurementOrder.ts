import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Vendor } from './vendor';
import { Staff } from './staff';
import { ProcurementOrderItem } from './procurementOrderItem';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum ProcurementOrderStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

@Table({ 
  timestamps: true, 
  tableName: 'Procurement_Orders',
  indexes: [
    {
      name: 'idx_procurement_order_vendor',
      fields: ['vendor_id']
    },
    {
      name: 'idx_procurement_order_status',
      fields: ['status']
    },
    {
      name: 'idx_procurement_order_date',
      fields: ['order_date']
    },
    {
      name: 'idx_procurement_order_expected_delivery',
      fields: ['expected_delivery_date']
    },
    {
      name: 'idx_procurement_order_po_number_unique',
      fields: ['po_number'],
      unique: true
    }
  ]
})
export class ProcurementOrder extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'PO number is required',
      },
    },
  })
  po_number: string; // PO-2024-001

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'vendor is required',
      },
    },
  })
  vendor_id: number;

  @Column({
    type: DataType.ENUM(
      ProcurementOrderStatus.DRAFT,
      ProcurementOrderStatus.APPROVED,
      ProcurementOrderStatus.SENT,
      ProcurementOrderStatus.RECEIVED,
      ProcurementOrderStatus.CANCELLED
    ),
    defaultValue: ProcurementOrderStatus.DRAFT,
  })
  status: ProcurementOrderStatus;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Total amount cannot be negative',
      },
    },
  })
  total_amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'order date is required',
      },
    },
  })
  order_date: Date;

  @Column({
    type: DataType.DATE,
  })
  expected_delivery_date: Date;

  @Column({
    type: DataType.DATE,
  })
  actual_delivery_date: Date;

  @Column({
    type: DataType.DATE,
  })
  received_date: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'created by is required',
      },
    },
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  approved_by: number;

  @Column({
    type: DataType.DATE,
  })
  approved_date: Date;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
  })
  delivery_address: string;

  @Column({
    type: DataType.STRING,
  })
  contact_person: string;

  @Column({
    type: DataType.STRING,
  })
  contact_phone: string;

  // Relationships
  @HasMany(() => ProcurementOrderItem)
  items: ProcurementOrderItem[];

  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @BelongsTo(() => Staff, { as: 'creator' })
  creator: Staff;

  @BelongsTo(() => Staff, { as: 'approver' })
  approver: Staff;

  static async paginate(param: {
    paginate: number;
    attributes?: FindAttributeOptions;
    where?: WhereOptions<any>;
    page?: number;
    order?: Order;
    group?: GroupOption;
    include?: Includeable | Includeable[];
  }) {
    const { limit, offset } = calcLimitAndOffset(param.page, param.paginate);
    const options = Object.assign({ limit, offset }, param);
    const data = await this.findAndCountAll(options);
    return paginate(data, param.page, limit);
  }
}
