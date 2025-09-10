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
import { Staff } from './staff';
import { GeneralStoreItem } from './generalStore/generalStoreItem';
import { PharmacyStore } from './pharmacyStore';
import { GeneralStoreDispensary } from './generalStore/generalStoreDispensary';
import { InventoryAlertConfiguration } from './inventoryAlertConfiguration';
import { InventoryAlertLog } from './inventoryAlertLog';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export type AlertType = 'STOCK_LEVEL' | 'EXPIRY' | 'PROCUREMENT' | 'CRITICAL' | 'FINANCIAL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type StoreType = 'PHARMACY' | 'GENERAL' | 'LABORATORY' | 'ALL';

@Table({
  timestamps: true,
  tableName: 'inventory_alerts',
  indexes: [
    {
      name: 'idx_inventory_alert_status_priority',
      fields: ['status', 'priority'],
    },
    {
      name: 'idx_inventory_alert_severity_triggered',
      fields: ['severity', 'triggered_at'],
    },
    {
      name: 'idx_inventory_alert_store_type',
      fields: ['store_type'],
    },
    {
      name: 'idx_inventory_alert_escalation',
      fields: ['escalation_level', 'escalated_at'],
    },
  ],
})
export class InventoryAlert extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => InventoryAlertConfiguration)
  @Column({ type: DataType.INTEGER, allowNull: false })
  configuration_id: number;

  @Column({
    type: DataType.ENUM('STOCK_LEVEL', 'EXPIRY', 'PROCUREMENT', 'CRITICAL', 'FINANCIAL'),
    allowNull: false,
  })
  alert_type: AlertType;

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  severity: AlertSeverity;

  @Column({
    type: DataType.ENUM('PHARMACY', 'GENERAL', 'LABORATORY', 'ALL'),
    allowNull: false,
  })
  store_type: StoreType;

  @ForeignKey(() => GeneralStoreItem)
  @Column({ type: DataType.INTEGER, allowNull: true })
  item_id?: number;

  @ForeignKey(() => PharmacyStore)
  @Column({ type: DataType.INTEGER, allowNull: true })
  pharmacy_item_id?: number;

  @ForeignKey(() => GeneralStoreDispensary)
  @Column({ type: DataType.INTEGER, allowNull: true })
  dispensary_id?: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  message: string;

  @Column({ type: DataType.JSON, allowNull: true })
  context_data?: any;

  @Column({ type: DataType.INTEGER, allowNull: true })
  trigger_value?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  threshold_value?: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 5 })
  priority: number;

  @Column({
    type: DataType.ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  })
  status: AlertStatus;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  auto_resolve_enabled: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  expires_at?: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  triggered_at: Date;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: true })
  acknowledged_by?: number;

  @Column({ type: DataType.DATE, allowNull: true })
  acknowledged_at?: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  acknowledgment_notes?: string;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: true })
  resolved_by?: number;

  @Column({ type: DataType.DATE, allowNull: true })
  resolved_at?: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  resolution_notes?: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  escalation_level: number;

  @Column({ type: DataType.DATE, allowNull: true })
  escalated_at?: Date;

  @Column({ type: DataType.JSON, allowNull: true })
  escalation_roles?: string[];

  @Column({ type: DataType.JSON, allowNull: true })
  escalation_departments?: string[];

  // Associations
  @BelongsTo(() => InventoryAlertConfiguration)
  configuration: InventoryAlertConfiguration;

  @BelongsTo(() => GeneralStoreItem)
  item: GeneralStoreItem;

  @BelongsTo(() => PharmacyStore)
  pharmacyItem: PharmacyStore;

  @BelongsTo(() => GeneralStoreDispensary)
  dispensary: GeneralStoreDispensary;

  @BelongsTo(() => Staff, { foreignKey: 'acknowledged_by' })
  acknowledgedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'resolved_by' })
  resolvedByStaff: Staff;

  @HasMany(() => InventoryAlertLog)
  logs: InventoryAlertLog[];

  // Business logic methods
  public acknowledge(staffId: number, notes?: string): void {
    this.status = 'ACKNOWLEDGED';
    this.acknowledged_by = staffId;
    this.acknowledged_at = new Date();
    if (notes) {
      this.acknowledgment_notes = notes;
    }
  }

  public resolve(staffId: number, notes?: string): void {
    this.status = 'RESOLVED';
    this.resolved_by = staffId;
    this.resolved_at = new Date();
    if (notes) {
      this.resolution_notes = notes;
    }
  }

  public dismiss(staffId: number, notes?: string): void {
    this.status = 'DISMISSED';
    this.resolved_by = staffId;
    this.resolved_at = new Date();
    if (notes) {
      this.resolution_notes = notes;
    }
  }

  public escalate(roles: string[]): void {
    this.escalation_level = (this.escalation_level || 0) + 1;
    this.escalated_at = new Date();
    this.escalation_roles = roles;
  }

  public shouldEscalate(escalationDelayMinutes: number): boolean {
    if (!this.triggered_at) return false;

    const now = new Date();
    const timeSinceTriggered = now.getTime() - this.triggered_at.getTime();
    const minutesSinceTriggered = Math.floor(timeSinceTriggered / (1000 * 60));

    return minutesSinceTriggered >= escalationDelayMinutes;
  }

  public getTimeRemaining(): number | null {
    if (!this.expires_at) return null;

    const now = new Date();
    const timeRemaining = this.expires_at.getTime() - now.getTime();
    return Math.max(0, Math.floor(timeRemaining / (1000 * 60))); // minutes
  }

  public getSeverityColor(): string {
    const colors = {
      LOW: '#28a745',
      MEDIUM: '#ffc107',
      HIGH: '#fd7e14',
      CRITICAL: '#dc3545',
    };
    return colors[this.severity] || '#6c757d';
  }

  public getStatusBadge(): string {
    const badges = {
      ACTIVE: 'danger',
      ACKNOWLEDGED: 'warning',
      RESOLVED: 'success',
      DISMISSED: 'secondary',
    };
    return badges[this.status] || 'primary';
  }

  public toNotificationPayload(): any {
    return {
      alertId: this.id,
      title: this.title,
      message: this.message,
      severity: this.severity,
      storeType: this.store_type,
      contextData: this.context_data,
      timestamp: this.triggered_at,
      priority: this.priority,
      requiresAcknowledgment: this.severity === 'CRITICAL',
      audioNotification: ['CRITICAL', 'HIGH'].includes(this.severity),
      escalationLevel: this.escalation_level || 0,
    };
  }

  // Static helper methods
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

  static async getActiveAlerts(filters?: {
    severity?: AlertSeverity;
    storeType?: StoreType;
    limit?: number;
  }) {
    const whereClause: any = { status: 'ACTIVE' };

    if (filters?.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters?.storeType) {
      whereClause.store_type = filters.storeType;
    }

    return await this.findAll({
      where: whereClause,
      order: [
        ['priority', 'ASC'],
        ['triggered_at', 'DESC'],
      ],
      limit: filters?.limit || 50,
      include: [
        {
          model: InventoryAlertConfiguration,
          as: 'configuration',
        },
      ],
    });
  }

  static async getDashboardCounts() {
    const [total, bySeverity, byStore] = await Promise.all([
      this.count({ where: { status: 'ACTIVE' } }),
      this.findAll({
        attributes: ['severity', [this.sequelize.fn('COUNT', '*'), 'count']],
        where: { status: 'ACTIVE' },
        group: ['severity'],
        raw: true,
      }),
      this.findAll({
        attributes: ['store_type', [this.sequelize.fn('COUNT', '*'), 'count']],
        where: { status: 'ACTIVE' },
        group: ['store_type'],
        raw: true,
      }),
    ]);

    return {
      total,
      bySeverity: bySeverity.reduce((acc: any, item: any) => {
        acc[item.severity.toLowerCase()] = parseInt(item.count);
        return acc;
      }, {}),
      byStore: byStore.reduce((acc: any, item: any) => {
        acc[item.store_type.toLowerCase()] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
