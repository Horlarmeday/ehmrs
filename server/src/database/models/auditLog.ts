import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

export enum AuditOperation {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  VIEW = 'view',
  APPROVE = 'approve',
  UPDATE = 'update',
  ACCESS = 'access',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
}

export interface AuditLogAttributes {
  id?: number;
  operation: AuditOperation;
  resource_type: string;
  resource_id?: number;
  user_id?: number;
  user_type?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  status: AuditStatus;
  error_message?: string;
  created_at?: Date;
}

@Table({
  tableName: 'audit_logs',
  timestamps: false,
})
export class AuditLog extends Model<AuditLogAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.ENUM(...Object.values(AuditOperation)),
    allowNull: false,
  })
  operation: AuditOperation;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  resource_type: string;

  @Column(DataType.INTEGER)
  resource_id?: number;

  @Column(DataType.INTEGER)
  user_id?: number;

  @Column(DataType.STRING(50))
  user_type?: string;

  @Column(DataType.STRING(45))
  ip_address?: string;

  @Column(DataType.TEXT)
  user_agent?: string;

  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @Column({
    type: DataType.ENUM(...Object.values(AuditStatus)),
    allowNull: false,
    defaultValue: AuditStatus.SUCCESS,
  })
  status: AuditStatus;

  @Column(DataType.TEXT)
  error_message?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  created_at: Date;
}

export default AuditLog;
