import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { GeneralStoreRequest } from './generalStoreRequest';
import { GeneralStoreItem } from './generalStoreItem';
import { ItemRequestStatus } from './types';

@Table({
  timestamps: true,
  tableName: 'General_Store_Request_Items',
  indexes: [
    {
      name: 'idx_general_store_request_item_request',
      fields: ['request_id'],
    },
    {
      name: 'idx_general_store_request_item_item',
      fields: ['item_id'],
    },
    {
      name: 'idx_general_store_request_item_status',
      fields: ['status'],
    },
    {
      name: 'idx_general_store_request_item_composite_request_item',
      fields: ['request_id', 'item_id'],
    },
  ],
})
export class GeneralStoreRequestItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => GeneralStoreRequest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Requests', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  request_id: number;

  @ForeignKey(() => GeneralStoreItem)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Items', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  item_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity requested must be at least 1',
      },
    },
  })
  quantity_requested: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity approved cannot be negative',
      },
    },
  })
  quantity_approved: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity issued cannot be negative',
      },
    },
  })
  quantity_issued: number;

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
  unit_cost: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Total cost cannot be negative',
      },
    },
  })
  total_cost: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.ENUM(...Object.values(ItemRequestStatus)),
    allowNull: false,
    defaultValue: ItemRequestStatus.PENDING,
  })
  status: ItemRequestStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => GeneralStoreRequest, { foreignKey: 'request_id' })
  request: GeneralStoreRequest;

  @BelongsTo(() => GeneralStoreItem, { foreignKey: 'item_id' })
  item: GeneralStoreItem;

  // Helper methods
  isPending(): boolean {
    return this.status === ItemRequestStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === ItemRequestStatus.APPROVED;
  }

  isIssued(): boolean {
    return this.status === ItemRequestStatus.ISSUED;
  }

  isPartiallyIssued(): boolean {
    return this.status === ItemRequestStatus.PARTIALLY_ISSUED;
  }

  getApprovalRate(): number {
    if (this.quantity_requested === 0) return 0;
    return ((this.quantity_approved || 0) / this.quantity_requested) * 100;
  }

  getIssuanceRate(): number {
    if (this.quantity_approved === 0) return 0;
    return (this.quantity_issued / this.quantity_approved) * 100;
  }

  isFullyApproved(): boolean {
    return this.quantity_approved === this.quantity_requested;
  }

  isFullyIssued(): boolean {
    return this.quantity_issued === this.quantity_approved;
  }

  getRemainingQuantity(): number {
    return (this.quantity_approved || 0) - this.quantity_issued;
  }

  canBeIssued(): boolean {
    return this.isApproved() && this.getRemainingQuantity() > 0;
  }

  updateTotalCost(): void {
    this.total_cost = (this.quantity_approved || 0) * this.unit_cost;
  }

  getFormattedUnitCost(): string {
    return `$${this.unit_cost.toFixed(2)}`;
  }

  getFormattedTotalCost(): string {
    return `$${this.total_cost.toFixed(2)}`;
  }

  getStatusDescription(): string {
    switch (this.status) {
      case ItemRequestStatus.PENDING:
        return 'Pending Approval';
      case ItemRequestStatus.APPROVED:
        return 'Approved';
      case ItemRequestStatus.ISSUED:
        return 'Fully Issued';
      case ItemRequestStatus.PARTIALLY_ISSUED:
        return 'Partially Issued';
      default:
        return 'Unknown Status';
    }
  }

  getStatusColor(): string {
    switch (this.status) {
      case ItemRequestStatus.PENDING:
        return 'warning';
      case ItemRequestStatus.APPROVED:
        return 'info';
      case ItemRequestStatus.ISSUED:
        return 'success';
      case ItemRequestStatus.PARTIALLY_ISSUED:
        return 'primary';
      default:
        return 'secondary';
    }
  }
}
