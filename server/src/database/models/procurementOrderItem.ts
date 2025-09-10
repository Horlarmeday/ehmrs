import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ProcurementOrder } from './procurementOrder';
import { Drug } from './drug';
import { Unit } from './unit';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE',
}

@Table({ timestamps: true, tableName: 'Procurement_Order_Items' })
export class ProcurementOrderItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ProcurementOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'procurement order is required',
      },
    },
  })
  procurement_order_id: number;

  @ForeignKey(() => Drug)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug is required',
      },
    },
  })
  drug_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity ordered is required',
      },
    },
  })
  quantity_ordered: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_received: number;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'unit is required',
      },
    },
  })
  unit_id: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Unit price cannot be negative',
      },
    },
  })
  unit_price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Total price cannot be negative',
      },
    },
  })
  total_price: number;

  @Column({
    type: DataType.ENUM(ReceiptStatus.PENDING, ReceiptStatus.PARTIAL, ReceiptStatus.COMPLETE),
    defaultValue: ReceiptStatus.PENDING,
  })
  receipt_status: ReceiptStatus;

  @Column({
    type: DataType.DATE,
  })
  date_received: Date;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.STRING,
  })
  batch_number: string;

  @Column({
    type: DataType.DATE,
  })
  expiration_date: Date;

  // Relationships
  @BelongsTo(() => ProcurementOrder)
  procurement_order: ProcurementOrder;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Unit)
  unit: Unit;

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
