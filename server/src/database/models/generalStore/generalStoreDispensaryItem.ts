import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BeforeUpdate,
  BeforeSave,
} from 'sequelize-typescript';
import { GeneralStoreDispensary } from './generalStoreDispensary';
import { GeneralStoreItem } from './generalStoreItem';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../../core/helpers/helper';
import sequelize, { Op } from 'sequelize';

export enum DispensaryItemStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  RECALLED = 'recalled',
}

export enum ReceivedFromType {
  MAIN_STORE = 'main_store',
  OTHER_DISPENSARY = 'other_dispensary',
  PROCUREMENT = 'procurement',
  TRANSFER = 'transfer',
}

@Table({
  timestamps: true,
  tableName: 'General_Store_Dispensary_Items',
  indexes: [
    {
      name: 'idx_general_store_dispensary_item_dispensary',
      fields: ['dispensary_id'],
    },
    {
      name: 'idx_general_store_dispensary_item_item',
      fields: ['item_id'],
    },
    {
      name: 'idx_general_store_dispensary_item_batch',
      fields: ['batch_number'],
    },
    {
      name: 'idx_general_store_dispensary_item_expiry',
      fields: ['expiration_date'],
    },
    {
      name: 'idx_general_store_dispensary_item_status',
      fields: ['status'],
    },
    {
      name: 'unique_dispensary_item_batch',
      unique: true,
      fields: ['dispensary_id', 'item_id', 'batch_number'],
    },
  ],
})
export class GeneralStoreDispensaryItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => GeneralStoreDispensary)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Dispensaries', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  dispensary_id: number;

  @ForeignKey(() => GeneralStoreItem)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Items', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  item_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity received cannot be negative',
      },
    },
  })
  quantity_received: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity remaining cannot be negative',
      },
    },
  })
  quantity_remaining: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Quantity reserved cannot be negative',
      },
    },
  })
  quantity_reserved: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.0,
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
    defaultValue: 0.0,
  })
  total_value: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  batch_number: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiration_date: Date;

  @Column({
    type: DataType.ENUM(...Object.values(DispensaryItemStatus)),
    allowNull: false,
    defaultValue: DispensaryItemStatus.ACTIVE,
  })
  status: DispensaryItemStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_movement_date: Date;

  @Column({
    type: DataType.ENUM(...Object.values(ReceivedFromType)),
    allowNull: true,
  })
  received_from_type: ReceivedFromType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  received_from_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

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
  @BelongsTo(() => GeneralStoreDispensary, { foreignKey: 'dispensary_id' })
  dispensary: GeneralStoreDispensary;

  @BelongsTo(() => GeneralStoreItem, { foreignKey: 'item_id' })
  item: GeneralStoreItem;

  // Lifecycle hooks
  @BeforeSave
  static updateTotalValue(instance: GeneralStoreDispensaryItem) {
    if (instance.quantity_remaining && instance.unit_cost) {
      instance.total_value =
        instance.quantity_remaining * parseFloat(instance.unit_cost.toString());
    }
  }

  @BeforeUpdate
  static updateLastMovementDate(instance: GeneralStoreDispensaryItem) {
    if (instance.changed('quantity_remaining') || instance.changed('quantity_reserved')) {
      instance.last_movement_date = new Date();
    }
  }

  // Business Logic Methods
  getAvailableQuantity(): number {
    return this.quantity_remaining - this.quantity_reserved;
  }

  isLowStock(minimumLevel?: number): boolean {
    const threshold = minimumLevel || this.dispensary?.minimum_stock_level || 10;
    return this.quantity_remaining <= threshold;
  }

  isOutOfStock(): boolean {
    return this.quantity_remaining === 0;
  }

  isExpired(): boolean {
    if (!this.expiration_date) return false;
    return new Date(this.expiration_date) < new Date();
  }

  isExpiringSoon(days = 30): boolean {
    if (!this.expiration_date) return false;
    const expiryDate = new Date(this.expiration_date);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    return expiryDate > today && expiryDate <= futureDate;
  }

  canReserve(quantity: number): boolean {
    return this.getAvailableQuantity() >= quantity;
  }

  canDispense(quantity: number): boolean {
    return this.getAvailableQuantity() >= quantity && this.status === DispensaryItemStatus.ACTIVE;
  }

  reserve(quantity: number): boolean {
    if (!this.canReserve(quantity)) {
      return false;
    }
    this.quantity_reserved += quantity;
    return true;
  }

  unreserve(quantity: number): boolean {
    if (this.quantity_reserved < quantity) {
      return false;
    }
    this.quantity_reserved -= quantity;
    return true;
  }

  dispense(quantity: number): boolean {
    if (!this.canDispense(quantity)) {
      return false;
    }

    // If quantity was reserved, reduce from reserved first
    if (this.quantity_reserved >= quantity) {
      this.quantity_reserved -= quantity;
    }

    this.quantity_remaining -= quantity;
    this.last_movement_date = new Date();
    return true;
  }

  receive(quantity: number, unitCost?: number): void {
    this.quantity_received += quantity;
    this.quantity_remaining += quantity;

    if (unitCost && unitCost > 0) {
      // Calculate weighted average cost
      const currentValue = this.quantity_remaining * parseFloat(this.unit_cost.toString());
      const newValue = quantity * unitCost;
      const totalQuantity = this.quantity_remaining;

      if (totalQuantity > 0) {
        this.unit_cost = (currentValue + newValue) / totalQuantity;
      }
    }

    this.last_movement_date = new Date();
    this.updateTotalValue();
  }

  updateTotalValue(): void {
    this.total_value = this.quantity_remaining * parseFloat(this.unit_cost.toString());
  }

  getMovementHistory(): string {
    const movements = [];
    movements.push(`Received: ${this.quantity_received}`);
    movements.push(`Remaining: ${this.quantity_remaining}`);
    movements.push(`Reserved: ${this.quantity_reserved}`);
    movements.push(`Available: ${this.getAvailableQuantity()}`);
    return movements.join(' | ');
  }

  getExpiryStatus(): 'expired' | 'expiring_soon' | 'good' | 'no_expiry' {
    if (!this.expiration_date) return 'no_expiry';
    if (this.isExpired()) return 'expired';
    if (this.isExpiringSoon()) return 'expiring_soon';
    return 'good';
  }

  getStockLevel(): 'out_of_stock' | 'low' | 'adequate' {
    if (this.isOutOfStock()) return 'out_of_stock';
    if (this.isLowStock()) return 'low';
    return 'adequate';
  }

  // Validation methods
  validateQuantityOperation(
    operation: 'dispense' | 'reserve' | 'unreserve',
    quantity: number
  ): {
    valid: boolean;
    message?: string;
  } {
    if (quantity <= 0) {
      return { valid: false, message: 'Quantity must be greater than zero' };
    }

    switch (operation) {
      case 'dispense':
        if (!this.canDispense(quantity)) {
          return {
            valid: false,
            message: `Cannot dispense ${quantity}. Available: ${this.getAvailableQuantity()}`,
          };
        }
        break;
      case 'reserve':
        if (!this.canReserve(quantity)) {
          return {
            valid: false,
            message: `Cannot reserve ${quantity}. Available: ${this.getAvailableQuantity()}`,
          };
        }
        break;
      case 'unreserve':
        if (this.quantity_reserved < quantity) {
          return {
            valid: false,
            message: `Cannot unreserve ${quantity}. Reserved: ${this.quantity_reserved}`,
          };
        }
        break;
    }

    return { valid: true };
  }

  // Static methods for pagination
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

  // Static method to find items by dispensary
  static async findByDispensary(dispensaryId: number, includeExpired = false) {
    const whereClause: any = { dispensary_id: dispensaryId };

    if (!includeExpired) {
      whereClause.status = DispensaryItemStatus.ACTIVE;
    }

    return this.findAll({
      where: whereClause,
      include: [
        {
          model: GeneralStoreItem,
          attributes: ['id', 'name', 'item_code', 'unit_id'],
          include: ['unit', 'category', 'subcategory'],
        },
      ],
      order: [['item', 'name', 'ASC']],
    });
  }

  // Static method to find expiring items
  static async findExpiringItems(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.findAll({
      where: {
        expiration_date: {
          [Op.between]: [new Date(), futureDate],
        },
        status: DispensaryItemStatus.ACTIVE,
        quantity_remaining: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: GeneralStoreDispensary,
          attributes: ['id', 'name', 'location'],
        },
        {
          model: GeneralStoreItem,
          attributes: ['id', 'name', 'item_code'],
        },
      ],
      order: [['expiration_date', 'ASC']],
    });
  }

  // Static method to find low stock items
  static async findLowStockItems() {
    return this.findAll({
      where: {
        status: DispensaryItemStatus.ACTIVE,
      },
      include: [
        {
          model: GeneralStoreDispensary,
          where: {
            status: 'active',
          },
          attributes: ['id', 'name', 'minimum_stock_level'],
        },
        {
          model: GeneralStoreItem,
          attributes: ['id', 'name', 'item_code'],
        },
      ],
      having: sequelize.where(
        sequelize.col('quantity_remaining'),
        '<=',
        sequelize.col('dispensary.minimum_stock_level')
      ),
    });
  }
}
