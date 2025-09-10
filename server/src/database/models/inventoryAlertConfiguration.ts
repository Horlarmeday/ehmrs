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
import { InventoryAlert } from './inventoryAlert';
import { AlertType, AlertSeverity, StoreType } from './inventoryAlert';

export type ThresholdType = 'ABSOLUTE' | 'PERCENTAGE';

@Table({
  timestamps: true,
  tableName: 'inventory_alert_configurations',
  indexes: [
    {
      name: 'idx_alert_config_type_severity',
      fields: ['alert_type', 'severity'],
    },
    {
      name: 'idx_alert_config_store_active',
      fields: ['store_type', 'is_active'],
    },
  ],
})
export class InventoryAlertConfiguration extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

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

  @Column({ type: DataType.INTEGER, allowNull: true })
  department_id?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  category_id?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  item_id?: number;

  @Column({
    type: DataType.ENUM('ABSOLUTE', 'PERCENTAGE'),
    allowNull: true,
  })
  stock_threshold_type?: ThresholdType;

  @Column({ type: DataType.INTEGER, allowNull: true })
  stock_threshold_value?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  expiry_days_warning?: number;

  @Column({ type: DataType.STRING, allowNull: true })
  title_template?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  message_template?: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  escalation_enabled: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true })
  escalation_delay_minutes?: number;

  @Column({ type: DataType.JSON, allowNull: true })
  escalation_roles?: string[];

  @Column({ type: DataType.JSON, allowNull: false, defaultValue: ['WEBSOCKET', 'POPUP'] })
  notification_channels: string[];

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 5 })
  priority: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  auto_resolve_enabled: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  sound_notification: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  requires_acknowledgment: boolean;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: false })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: true })
  updated_by?: number;

  // Associations
  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

  @HasMany(() => InventoryAlert)
  alerts: InventoryAlert[];

  // Business logic methods
  public shouldTriggerForItem(itemData: any): boolean {
    // Basic matching logic - can be enhanced
    if (this.item_id && this.item_id !== itemData.itemId) {
      return false;
    }

    if (this.category_id && this.category_id !== itemData.categoryId) {
      return false;
    }

    if (this.department_id && this.department_id !== itemData.departmentId) {
      return false;
    }

    return true;
  }

  public checkStockLevelTrigger(currentStock: number, minimumStock?: number): boolean {
    if (!this.stock_threshold_value) return false;

    if (this.stock_threshold_type === 'ABSOLUTE') {
      return currentStock <= this.stock_threshold_value;
    }

    if (this.stock_threshold_type === 'PERCENTAGE' && minimumStock) {
      const threshold = (minimumStock * this.stock_threshold_value) / 100;
      return currentStock <= threshold;
    }

    return currentStock === 0;
  }

  public checkExpiryTrigger(expiryDate: Date): boolean {
    if (!this.expiry_days_warning) return false;

    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff <= this.expiry_days_warning && daysDiff >= 0;
  }

  public generateAlertTitle(itemData: any): string {
    if (this.title_template) {
      return this.title_template
        .replace('{itemName}', itemData.itemName || '')
        .replace('{storeType}', this.store_type)
        .replace('{severity}', this.severity);
    }

    const severityIcon = this.getSeverityIcon();
    return `${severityIcon} ${this.alert_type.replace('_', ' ')} Alert - ${itemData.itemName}`;
  }

  public generateAlertMessage(itemData: any, triggerData: any): string {
    if (this.message_template) {
      return this.message_template
        .replace('{itemName}', itemData.itemName || '')
        .replace('{currentStock}', triggerData.currentStock?.toString() || '0')
        .replace('{minimumStock}', triggerData.minimumStock?.toString() || 'N/A')
        .replace(
          '{expiryDate}',
          triggerData.expiryDate ? triggerData.expiryDate.toLocaleDateString() : 'N/A'
        );
    }

    let message = '';
    switch (this.alert_type) {
      case 'STOCK_LEVEL':
        message = `Stock level for ${itemData.itemName} is ${triggerData.currentStock}`;
        if (triggerData.minimumStock) {
          message += ` (minimum: ${triggerData.minimumStock})`;
        }
        break;

      case 'EXPIRY':
        message = `${itemData.itemName} expires on ${triggerData.expiryDate?.toLocaleDateString() ||
          'unknown date'}`;
        break;

      case 'CRITICAL':
        message = `Critical inventory issue with ${itemData.itemName}`;
        break;

      default:
        message = `${this.alert_type.replace('_', ' ')} alert for ${itemData.itemName}`;
    }

    return message + '. Immediate attention required.';
  }

  private getSeverityIcon(): string {
    const icons = {
      LOW: '🔵',
      MEDIUM: '🟡',
      HIGH: '🟠',
      CRITICAL: '🔴',
    };
    return icons[this.severity] || '⚪';
  }

  public getPriorityScore(): number {
    const basePriority = this.priority;
    const severityMultiplier = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };

    return basePriority * (severityMultiplier[this.severity] || 1);
  }

  public isEscalationDue(triggeredAt: Date): boolean {
    if (!this.escalation_enabled || !this.escalation_delay_minutes) {
      return false;
    }

    const now = new Date();
    const timeDiff = now.getTime() - triggeredAt.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return minutesDiff >= this.escalation_delay_minutes;
  }

  public validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.length < 3) {
      errors.push('Configuration name must be at least 3 characters');
    }

    if (this.alert_type === 'STOCK_LEVEL' && !this.stock_threshold_value) {
      errors.push('Stock threshold value is required for stock level alerts');
    }

    if (this.alert_type === 'EXPIRY' && !this.expiry_days_warning) {
      errors.push('Expiry days warning is required for expiry alerts');
    }

    if (this.escalation_enabled && !this.escalation_delay_minutes) {
      errors.push('Escalation delay is required when escalation is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public clone(newName: string): Partial<InventoryAlertConfiguration> {
    return {
      name: newName,
      description: this.description,
      alert_type: this.alert_type,
      severity: this.severity,
      store_type: this.store_type,
      department_id: this.department_id,
      category_id: this.category_id,
      item_id: this.item_id,
      stock_threshold_type: this.stock_threshold_type,
      stock_threshold_value: this.stock_threshold_value,
      expiry_days_warning: this.expiry_days_warning,
      title_template: this.title_template,
      message_template: this.message_template,
      escalation_enabled: this.escalation_enabled,
      escalation_delay_minutes: this.escalation_delay_minutes,
      escalation_roles: this.escalation_roles,
      notification_channels: this.notification_channels,
      priority: this.priority,
      auto_resolve_enabled: this.auto_resolve_enabled,
      sound_notification: this.sound_notification,
      requires_acknowledgment: this.requires_acknowledgment,
    };
  }

  public toSummary(): any {
    return {
      id: this.id,
      name: this.name,
      alert_type: this.alert_type,
      severity: this.severity,
      store_type: this.store_type,
      is_active: this.is_active,
      priority: this.priority,
      escalation_enabled: this.escalation_enabled,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
