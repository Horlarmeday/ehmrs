import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from '../staff';
import { GeneralStoreItem } from './generalStoreItem';
import { MovementType } from './types';

@Table({
  timestamps: true,
  tableName: 'General_Store_Movements',
  indexes: [
    {
      name: 'idx_general_store_movement_item',
      fields: ['item_id'],
    },
    {
      name: 'idx_general_store_movement_type',
      fields: ['movement_type'],
    },
    {
      name: 'idx_general_store_movement_date',
      fields: ['movement_date'],
    },
    {
      name: 'idx_general_store_movement_staff',
      fields: ['staff_id'],
    },
    {
      name: 'idx_general_store_movement_reference',
      fields: ['reference_type', 'reference_id'],
    },
    {
      name: 'idx_general_store_movement_composite_item_date',
      fields: ['item_id', 'movement_date'],
    },
  ],
})
export class GeneralStoreMovement extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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
    type: DataType.ENUM(...Object.values(MovementType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Movement type is required',
      },
    },
  })
  movement_type: MovementType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity must be at least 1',
      },
    },
  })
  quantity: number;

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
    validate: {
      min: {
        args: [0],
        msg: 'Total cost cannot be negative',
      },
    },
  })
  total_cost: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Reference type is required',
      },
    },
  })
  reference_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Reference ID must be at least 1',
      },
    },
  })
  reference_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  from_location: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  to_location: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  movement_date: Date;

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
  @BelongsTo(() => GeneralStoreItem, { foreignKey: 'item_id' })
  item: GeneralStoreItem;

  @BelongsTo(() => Staff, { foreignKey: 'staff_id' })
  staff: Staff;

  // Helper methods
  isStockIn(): boolean {
    return this.movement_type === MovementType.IN;
  }

  isStockOut(): boolean {
    return this.movement_type === MovementType.OUT;
  }

  isTransfer(): boolean {
    return this.movement_type === MovementType.TRANSFER;
  }

  isAdjustment(): boolean {
    return this.movement_type === MovementType.ADJUSTMENT;
  }

  getMovementDescription(): string {
    switch (this.movement_type) {
      case MovementType.IN:
        return `Stock received: ${this.quantity} units`;
      case MovementType.OUT:
        return `Stock issued: ${this.quantity} units`;
      case MovementType.TRANSFER:
        return `Stock transferred: ${this.quantity} units from ${this.from_location} to ${this.to_location}`;
      case MovementType.ADJUSTMENT:
        return `Stock adjusted: ${this.quantity} units`;
      default:
        return `Movement: ${this.quantity} units`;
    }
  }

  calculateTotalCost(): void {
    this.total_cost = this.quantity * this.unit_cost;
  }

  getFormattedMovementDate(): string {
    return this.movement_date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getReferenceDescription(): string {
    return `${this.reference_type} #${this.reference_id}`;
  }
}
