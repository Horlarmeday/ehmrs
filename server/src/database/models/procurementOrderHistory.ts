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
import { Staff } from './staff';
import { Op } from 'sequelize';

export enum HistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  AMOUNT_CHANGED = 'AMOUNT_CHANGED',
  VENDOR_CHANGED = 'VENDOR_CHANGED',
  DATE_CHANGED = 'DATE_CHANGED',
}

export enum ChangeType {
  FIELD_UPDATE = 'FIELD_UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  ITEM_ADDED = 'ITEM_ADDED',
  ITEM_REMOVED = 'ITEM_REMOVED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  APPROVAL = 'APPROVAL',
  CANCELLATION = 'CANCELLATION',
}

@Table({ 
  timestamps: true, 
  tableName: 'Procurement_Order_History',
  indexes: [
    {
      name: 'idx_procurement_order_history_order',
      fields: ['procurement_order_id']
    },
    {
      name: 'idx_procurement_order_history_action',
      fields: ['action']
    },
    {
      name: 'idx_procurement_order_history_staff',
      fields: ['staff_id']
    },
    {
      name: 'idx_procurement_order_history_date',
      fields: ['createdAt']
    },
    {
      name: 'idx_procurement_order_history_composite',
      fields: ['procurement_order_id', 'action', 'createdAt']
    }
  ]
})
export class ProcurementOrderHistory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ProcurementOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'procurement order is required' }
    }
  })
  procurement_order_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(HistoryAction)),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'action is required' }
    }
  })
  action: HistoryAction;

  @Column({
    type: DataType.ENUM(...Object.values(ChangeType)),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'change type is required' }
    }
  })
  change_type: ChangeType;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'staff is required' }
    }
  })
  staff_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  field_name: string; // Which field was changed (e.g., 'status', 'total_amount')

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  old_value: string; // Previous value (JSON string for complex objects)

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  new_value: string; // New value (JSON string for complex objects)

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reason: string; // Why the change was made

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string; // Additional context about the change

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any; // Additional structured data about the change

  // Relationships
  @BelongsTo(() => ProcurementOrder)
  procurement_order: ProcurementOrder;

  @BelongsTo(() => Staff)
  staff: Staff;

  /**
   * Create history record for procurement order creation
   */
  static async logCreation(orderId: number, staffId: number, orderData: any): Promise<ProcurementOrderHistory> {
    return await this.create({
      procurement_order_id: orderId,
      action: HistoryAction.CREATED,
      change_type: ChangeType.FIELD_UPDATE,
      staff_id: staffId,
      field_name: 'all',
      old_value: null,
      new_value: JSON.stringify(orderData),
      reason: 'Procurement order created',
      notes: 'Initial creation of procurement order'
    });
  }

  /**
   * Create history record for status change
   */
  static async logStatusChange(orderId: number, staffId: number, oldStatus: string, newStatus: string, reason?: string): Promise<ProcurementOrderHistory> {
    return await this.create({
      procurement_order_id: orderId,
      action: HistoryAction.STATUS_CHANGED,
      change_type: ChangeType.STATUS_CHANGE,
      staff_id: staffId,
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      reason: reason || `Status changed from ${oldStatus} to ${newStatus}`,
      notes: `Status transition: ${oldStatus} → ${newStatus}`
    });
  }

  /**
   * Create history record for field update
   */
  static async logFieldUpdate(orderId: number, staffId: number, fieldName: string, oldValue: any, newValue: any, reason?: string): Promise<ProcurementOrderHistory> {
    return await this.create({
      procurement_order_id: orderId,
      action: HistoryAction.UPDATED,
      change_type: ChangeType.FIELD_UPDATE,
      staff_id: staffId,
      field_name: fieldName,
      old_value: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      new_value: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      reason: reason || `Field ${fieldName} updated`,
      notes: `Field update: ${fieldName}`
    });
  }

  /**
   * Create history record for approval
   */
  static async logApproval(orderId: number, staffId: number, approvalData: any): Promise<ProcurementOrderHistory> {
    return await this.create({
      procurement_order_id: orderId,
      action: HistoryAction.APPROVED,
      change_type: ChangeType.APPROVAL,
      staff_id: staffId,
      field_name: 'approval',
      old_value: null,
      new_value: JSON.stringify(approvalData),
      reason: 'Procurement order approved',
      notes: 'Order approved for vendor processing'
    });
  }

  /**
   * Create history record for cancellation
   */
  static async logCancellation(orderId: number, staffId: number, cancellationReason: string): Promise<ProcurementOrderHistory> {
    return await this.create({
      procurement_order_id: orderId,
      action: HistoryAction.CANCELLED,
      change_type: ChangeType.CANCELLATION,
      staff_id: staffId,
      field_name: 'cancellation',
      old_value: null,
      new_value: cancellationReason,
      reason: 'Procurement order cancelled',
      notes: `Order cancelled: ${cancellationReason}`
    });
  }

  /**
   * Get complete history for a procurement order
   */
  static async getOrderHistory(orderId: number): Promise<ProcurementOrderHistory[]> {
    return await this.findAll({
      where: { procurement_order_id: orderId },
      include: [
        {
          model: Staff,
          attributes: ['first_name', 'last_name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Get history by action type
   */
  static async getHistoryByAction(action: HistoryAction, limit: number = 100): Promise<ProcurementOrderHistory[]> {
    return await this.findAll({
      where: { action },
      include: [
        {
          model: ProcurementOrder,
          attributes: ['po_number', 'total_amount', 'status']
        },
        {
          model: Staff,
          attributes: ['first_name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Get audit trail for compliance reporting
   */
  static async getAuditTrail(params: {
    date_from?: Date;
    date_to?: Date;
    staff_id?: number;
    action?: HistoryAction;
    order_id?: number;
  }): Promise<ProcurementOrderHistory[]> {
    const where: any = {};

    if (params.date_from || params.date_to) {
      where.createdAt = {};
      if (params.date_from) where.createdAt[Op.gte] = params.date_from;
      if (params.date_to) where.createdAt[Op.lte] = params.date_to;
    }

    if (params.staff_id) {
      where.staff_id = params.staff_id;
    }

    if (params.action) {
      where.action = params.action;
    }

    if (params.order_id) {
      where.procurement_order_id = params.order_id;
    }

    return await this.findAll({
      where,
      include: [
        {
          model: ProcurementOrder,
          attributes: ['po_number', 'total_amount', 'status', 'vendor_id']
        },
        {
          model: Staff,
          attributes: ['first_name', 'last_name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}
