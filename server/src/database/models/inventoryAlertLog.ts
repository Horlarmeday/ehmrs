import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { InventoryAlert } from './inventoryAlert';
import { Staff } from './staff';

export type AlertAction =
  | 'CREATED'
  | 'ACKNOWLEDGED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'NOTIFICATION_SENT'
  | 'AUTO_RESOLVED';
export type NotificationChannel = 'WEBSOCKET' | 'EMAIL' | 'SMS' | 'PUSH' | 'POPUP';

@Table({
  timestamps: false,
  tableName: 'inventory_alert_logs',
  indexes: [
    {
      fields: ['alert_id', 'created_at'],
    },
    {
      fields: ['action', 'created_at'],
    },
  ],
})
export class InventoryAlertLog extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => InventoryAlert)
  @Column({ type: DataType.INTEGER, allowNull: false })
  alert_id: number;

  @Column({
    type: DataType.ENUM(
      'CREATED',
      'ACKNOWLEDGED',
      'ESCALATED',
      'RESOLVED',
      'DISMISSED',
      'NOTIFICATION_SENT',
      'AUTO_RESOLVED'
    ),
    allowNull: false,
  })
  action: AlertAction;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: true })
  action_by?: number;

  @Column({
    type: DataType.ENUM('WEBSOCKET', 'EMAIL', 'SMS', 'PUSH', 'POPUP'),
    allowNull: true,
  })
  notification_channel?: NotificationChannel;

  @Column({ type: DataType.JSON, allowNull: true })
  details?: any;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @Column({ type: DataType.STRING(45), allowNull: true })
  ip_address?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  user_agent?: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  created_at: Date;

  // Associations
  @BelongsTo(() => InventoryAlert)
  alert: InventoryAlert;

  @BelongsTo(() => Staff, { foreignKey: 'action_by' })
  staff: Staff;

  // Static helper methods for creating log entries
  public static logAlertCreated(alertId: number, details?: any): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'CREATED',
      details: details || {},
    };
  }

  public static logAlertAcknowledged(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'ACKNOWLEDGED',
      action_by: staffId,
      notes,
      ip_address: ipAddress,
      user_agent: userAgent,
    };
  }

  public static logAlertEscalated(
    alertId: number,
    escalatedTo: any,
    details?: any
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'ESCALATED',
      details: {
        escalated_to: escalatedTo,
        ...details,
      },
    };
  }

  public static logAlertResolved(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'RESOLVED',
      action_by: staffId,
      notes,
      ip_address: ipAddress,
      user_agent: userAgent,
    };
  }

  public static logAlertDismissed(
    alertId: number,
    staffId: number,
    notes?: string,
    ipAddress?: string,
    userAgent?: string
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'DISMISSED',
      action_by: staffId,
      notes,
      ip_address: ipAddress,
      user_agent: userAgent,
    };
  }

  public static logNotificationSent(
    alertId: number,
    channel: NotificationChannel,
    details?: any
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'NOTIFICATION_SENT',
      notification_channel: channel,
      details: details || {},
    };
  }

  public static logAutoResolved(
    alertId: number,
    reason: string,
    details?: any
  ): Partial<InventoryAlertLog> {
    return {
      alert_id: alertId,
      action: 'AUTO_RESOLVED',
      details: {
        reason,
        ...details,
      },
    };
  }

  // Instance methods
  public getActionDescription(): string {
    const descriptions = {
      CREATED: 'Alert was created',
      ACKNOWLEDGED: 'Alert was acknowledged',
      ESCALATED: 'Alert was escalated',
      RESOLVED: 'Alert was resolved',
      DISMISSED: 'Alert was dismissed',
      NOTIFICATION_SENT: 'Notification was sent',
      AUTO_RESOLVED: 'Alert was automatically resolved',
    };

    return descriptions[this.action] || 'Unknown action';
  }

  public getChannelDescription(): string {
    if (!this.notification_channel) return 'N/A';

    const descriptions = {
      WEBSOCKET: 'WebSocket Notification',
      EMAIL: 'Email Notification',
      SMS: 'SMS Notification',
      PUSH: 'Push Notification',
      POPUP: 'Popup Modal',
    };

    return descriptions[this.notification_channel] || 'Unknown channel';
  }

  public isUserAction(): boolean {
    return ['ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'].includes(this.action);
  }

  public isSystemAction(): boolean {
    return ['CREATED', 'ESCALATED', 'NOTIFICATION_SENT', 'AUTO_RESOLVED'].includes(this.action);
  }

  public getFormattedTimestamp(): string {
    return this.created_at.toLocaleString();
  }

  public toAuditTrail(): any {
    return {
      id: this.id,
      alertId: this.alert_id,
      action: this.action,
      actionDescription: this.getActionDescription(),
      actionBy: this.action_by,
      notificationChannel: this.notification_channel,
      channelDescription: this.getChannelDescription(),
      details: this.details,
      notes: this.notes,
      ipAddress: this.ip_address,
      userAgent: this.user_agent,
      timestamp: this.created_at,
      formattedTimestamp: this.getFormattedTimestamp(),
      isUserAction: this.isUserAction(),
      isSystemAction: this.isSystemAction(),
    };
  }
}

export default InventoryAlertLog;
