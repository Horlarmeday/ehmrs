import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BeforeCreate,
} from 'sequelize-typescript';
import { PatientDeposit } from './patientDeposit';
import { Staff } from './staff';

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  BALANCE_CHANGE = 'BALANCE_CHANGE',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  USAGE_PROCESSED = 'USAGE_PROCESSED',
  ADJUSTMENT_MADE = 'ADJUSTMENT_MADE',
  RECONCILIATION = 'RECONCILIATION',
  EXPIRY_PROCESSED = 'EXPIRY_PROCESSED',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

@Table({ timestamps: true, tableName: 'deposit_audit_logs' })
export class DepositAuditLog extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => PatientDeposit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  deposit_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(AuditActionType)),
    allowNull: false,
  })
  action_type: AuditActionType;

  @Column({
    type: DataType.ENUM(...Object.values(AuditSeverity)),
    defaultValue: AuditSeverity.INFO,
  })
  severity: AuditSeverity;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  action_description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  details: string;

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
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  performed_by: number;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  ip_address: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  user_agent: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  session_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  request_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  endpoint: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  http_method: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  response_status: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  response_time_ms: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_system_action: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  error_message: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  stack_trace: string;

  // Relationships
  @BelongsTo(() => PatientDeposit)
  deposit: PatientDeposit;

  @BelongsTo(() => Staff, { foreignKey: 'performed_by' })
  performedByStaff: Staff;

  // Model hooks for validation and auto-population
  @BeforeCreate
  static async beforeCreateDepositAuditLog(instance: DepositAuditLog) {
    // Validate that action description is not empty
    if (!instance.action_description || instance.action_description.trim().length === 0) {
      throw new Error('Action description is required');
    }

    // Validate that performed_by is provided
    if (!instance.performed_by) {
      throw new Error('Performed by staff ID is required');
    }

    // Auto-generate request ID if not provided
    if (!instance.request_id) {
      instance.request_id = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    // Set default severity if not provided
    if (!instance.severity) {
      instance.severity = AuditSeverity.INFO;
    }
  }
}
