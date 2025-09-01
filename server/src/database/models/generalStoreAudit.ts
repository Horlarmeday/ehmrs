import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FULFILL = 'FULFILL',
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT = 'STOCK_OUT',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  STOCK_TRANSFER = 'STOCK_TRANSFER',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum AuditModule {
  CATEGORY = 'CATEGORY',
  SUBCATEGORY = 'SUBCATEGORY',
  ITEM = 'ITEM',
  MOVEMENT = 'MOVEMENT',
  REQUEST = 'REQUEST',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM',
  SETTINGS = 'SETTINGS',
}

@Table({
  timestamps: true,
  tableName: 'general_store_audit_logs',
})
export class GeneralStoreAuditLog extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'staff_id is required',
      },
    },
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @Column({
    type: DataType.ENUM(...Object.values(AuditModule)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'module is required',
      },
    },
  })
  module: AuditModule;

  @Column({
    type: DataType.ENUM(...Object.values(AuditAction)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'action is required',
      },
    },
  })
  action: AuditAction;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'entity_type is required',
      },
    },
  })
  entity_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  entity_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  old_values: any;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  new_values: any;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ip_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  user_agent: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  session_id: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_successful: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  error_message: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any;
}
