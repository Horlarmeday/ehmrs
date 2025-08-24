import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { StockAudit } from './stockAudit';
import { Drug } from './drug';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ 
  timestamps: true, 
  tableName: 'Stock_Audit_Items',
  indexes: [
    {
      name: 'idx_stock_audit_item_audit',
      fields: ['stock_audit_id']
    },
    {
      name: 'idx_stock_audit_item_drug',
      fields: ['drug_id']
    },
    {
      name: 'idx_stock_audit_item_variance',
      fields: ['variance']
    },
    {
      name: 'idx_stock_audit_item_variance_value',
      fields: ['variance_value']
    }
  ]
})
export class StockAuditItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => StockAudit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'stock audit is required',
      },
    },
  })
  stock_audit_id: number;

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
      min: {
        args: [0],
        msg: 'System quantity cannot be negative',
      },
    },
  })
  system_quantity: number; // What system says

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Physical quantity cannot be negative',
      },
    },
  })
  physical_quantity: number; // What was physically counted

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  variance: number; // physical - system

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Variance value cannot be negative',
      },
    },
  })
  variance_value: number; // variance * unit_cost

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Unit cost cannot be negative',
      },
    },
  })
  unit_cost: number; // Cost per unit for variance calculation

  @Column({
    type: DataType.TEXT,
  })
  remarks: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'counted by is required',
      },
    },
  })
  counted_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'count date is required',
      },
    },
  })
  count_date: Date;

  @Column({
    type: DataType.STRING,
  })
  batch_number: string;

  @Column({
    type: DataType.STRING,
  })
  shelf_location: string;

  // Relationships
  @BelongsTo(() => StockAudit)
  stock_audit: StockAudit;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Staff)
  counter: Staff;

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
