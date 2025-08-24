import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { Inventory } from './inventory';
import { StockAuditItem } from './stockAuditItem';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum AuditStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
}

export enum StoreType {
  PHARMACY = 'PHARMACY',
  LABORATORY = 'LABORATORY',
  RADIOLOGY = 'RADIOLOGY',
}

@Table({ 
  timestamps: true, 
  tableName: 'Stock_Audits',
  indexes: [
    {
      name: 'idx_stock_audit_store_type',
      fields: ['store_type']
    },
    {
      name: 'idx_stock_audit_status',
      fields: ['status']
    },
    {
      name: 'idx_stock_audit_date',
      fields: ['audit_date']
    },
    {
      name: 'idx_stock_audit_inventory',
      fields: ['inventory_id']
    },
    {
      name: 'idx_stock_audit_created_by',
      fields: ['created_by']
    },
    {
      name: 'idx_stock_audit_approved_by',
      fields: ['approved_by']
    },
    {
      name: 'idx_stock_audit_number_unique',
      fields: ['audit_number'],
      unique: true
    }
  ]
})
export class StockAudit extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'audit number is required',
      },
    },
  })
  audit_number: string; // SA-2024-001

  @Column({
    type: DataType.ENUM(
      StoreType.PHARMACY,
      StoreType.LABORATORY,
      StoreType.RADIOLOGY
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'store type is required',
      },
    },
  })
  store_type: StoreType;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventory_id: number; // Optional: Specific inventory/dispensary

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'audit date is required',
      },
    },
  })
  audit_date: Date;

  @Column({
    type: DataType.ENUM(
      AuditStatus.DRAFT,
      AuditStatus.IN_PROGRESS,
      AuditStatus.COMPLETED,
      AuditStatus.APPROVED
    ),
    defaultValue: AuditStatus.DRAFT,
  })
  status: AuditStatus;

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
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  total_variance_value: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  total_items_audited: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  total_items_with_variance: number;

  // Relationships
  @HasMany(() => StockAuditItem)
  items: StockAuditItem[];

  @BelongsTo(() => Inventory)
  inventory: Inventory;

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
