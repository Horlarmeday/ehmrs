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
import { Staff } from '../staff';
import { Department } from '../department';
import { GeneralStoreDispensaryItem } from './generalStoreDispensaryItem';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../../core/helpers/helper';

export enum AcceptedItemTypes {
  MEDICAL_SUPPLIES = 'medical_supplies',
  CONSUMABLES = 'consumables',
  EQUIPMENT = 'equipment',
  LABORATORY = 'laboratory',
  ALL = 'all',
}

export enum FundingSource {
  HOSPITAL = 'hospital',
  DONOR = 'donor',
  RESEARCH = 'research',
  DEPARTMENT_BUDGET = 'department_budget',
}

export enum DispensaryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Table({
  timestamps: true,
  tableName: 'General_Store_Dispensaries',
  indexes: [
    {
      name: 'idx_general_store_dispensary_department',
      fields: ['department_id'],
    },
    {
      name: 'idx_general_store_dispensary_manager',
      fields: ['manager_staff_id'],
    },
    {
      name: 'idx_general_store_dispensary_status',
      fields: ['status'],
    },
    {
      name: 'idx_general_store_dispensary_item_types',
      fields: ['accepted_item_types'],
    },
  ],
})
export class GeneralStoreDispensary extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Dispensary name is required',
      },
    },
  })
  name: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    references: { model: 'departments', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  department_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  location: string;

  @Column({
    type: DataType.ENUM(...Object.values(AcceptedItemTypes)),
    allowNull: false,
    defaultValue: AcceptedItemTypes.ALL,
  })
  accepted_item_types: AcceptedItemTypes;

  @Column({
    type: DataType.ENUM(...Object.values(FundingSource)),
    allowNull: false,
    defaultValue: FundingSource.HOSPITAL,
  })
  funding_source: FundingSource;

  @Column({
    type: DataType.ENUM(...Object.values(DispensaryStatus)),
    allowNull: false,
    defaultValue: DispensaryStatus.ACTIVE,
  })
  status: DispensaryStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  manager_staff_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: {
        args: [0],
        msg: 'Minimum stock level cannot be negative',
      },
    },
  })
  minimum_stock_level: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1000,
    validate: {
      min: {
        args: [1],
        msg: 'Maximum stock level must be at least 1',
      },
    },
  })
  maximum_stock_level: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  auto_replenish: boolean;

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
  @BelongsTo(() => Department, { foreignKey: 'department_id' })
  department: Department;

  @BelongsTo(() => Staff, { foreignKey: 'manager_staff_id' })
  manager: Staff;

  @HasMany(() => GeneralStoreDispensaryItem, { foreignKey: 'dispensary_id' })
  dispensaryItems: GeneralStoreDispensaryItem[];

  // Business Logic Methods
  canReceiveItemType(itemType: string): boolean {
    return (
      this.accepted_item_types === AcceptedItemTypes.ALL || this.accepted_item_types === itemType
    );
  }

  getTotalValue(): number {
    if (!this.dispensaryItems || this.dispensaryItems.length === 0) {
      return 0;
    }
    return this.dispensaryItems.reduce(
      (total, item) => total + parseFloat(item.total_value.toString()),
      0
    );
  }

  getTotalItems(): number {
    if (!this.dispensaryItems || this.dispensaryItems.length === 0) {
      return 0;
    }
    return this.dispensaryItems.reduce((total, item) => total + item.quantity_remaining, 0);
  }

  getLowStockItems(): GeneralStoreDispensaryItem[] {
    if (!this.dispensaryItems || this.dispensaryItems.length === 0) {
      return [];
    }
    return this.dispensaryItems.filter(item => item.quantity_remaining <= this.minimum_stock_level);
  }

  getExpiredItems(): GeneralStoreDispensaryItem[] {
    if (!this.dispensaryItems || this.dispensaryItems.length === 0) {
      return [];
    }
    const now = new Date();
    return this.dispensaryItems.filter(
      item => item.expiration_date && new Date(item.expiration_date) < now
    );
  }

  getExpiringSoonItems(days = 30): GeneralStoreDispensaryItem[] {
    if (!this.dispensaryItems || this.dispensaryItems.length === 0) {
      return [];
    }
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const now = new Date();

    return this.dispensaryItems.filter(item => {
      if (!item.expiration_date) return false;
      const expiryDate = new Date(item.expiration_date);
      return expiryDate > now && expiryDate <= futureDate;
    });
  }

  getStockStatus(): 'adequate' | 'low' | 'critical' | 'out_of_stock' {
    const totalItems = this.getTotalItems();
    const lowStockCount = this.getLowStockItems().length;
    const totalItemTypes = this.dispensaryItems?.length || 0;

    if (totalItems === 0) return 'out_of_stock';

    const lowStockPercentage = totalItemTypes > 0 ? lowStockCount / totalItemTypes : 0;

    if (lowStockPercentage >= 0.5) return 'critical';
    if (lowStockPercentage >= 0.25) return 'low';
    return 'adequate';
  }

  canAccommodateItem(itemId: number, quantity: number): boolean {
    const existingItem = this.dispensaryItems?.find(item => item.item_id === itemId);
    if (!existingItem) {
      // New item, check if we have space
      return this.getTotalItems() + quantity <= this.maximum_stock_level;
    } else {
      // Existing item, check if additional quantity fits
      return existingItem.quantity_remaining + quantity <= this.maximum_stock_level;
    }
  }

  needsReplenishment(): boolean {
    if (!this.auto_replenish) return false;

    const lowStockItems = this.getLowStockItems();
    return lowStockItems.length > 0;
  }

  // Helper method to get available stock for specific item
  getAvailableStock(itemId: number): number {
    const dispensaryItem = this.dispensaryItems?.find(item => item.item_id === itemId);
    return dispensaryItem ? dispensaryItem.getAvailableQuantity() : 0;
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

  // Static method to find dispensaries by item type
  static async findByItemType(itemType: AcceptedItemTypes | string) {
    return this.findAll({
      where: {
        [Op.or]: [
          { accepted_item_types: itemType },
          { accepted_item_types: AcceptedItemTypes.ALL },
        ],
        status: DispensaryStatus.ACTIVE,
      },
      include: [
        { model: Department, attributes: ['id', 'name'] },
        { model: Staff, as: 'manager', attributes: ['id', 'firstname', 'lastname'] },
      ],
    });
  }

  // Static method to find dispensaries needing replenishment
  static async findNeedingReplenishment() {
    return this.findAll({
      where: {
        auto_replenish: true,
        status: DispensaryStatus.ACTIVE,
      },
      include: [
        {
          model: GeneralStoreDispensaryItem,
          required: true,
          where: {
            quantity_remaining: {
              [Op.lte]: literal('minimum_stock_level'),
            },
          },
        },
      ],
    });
  }
}

// Import Op and literal for static methods
import { Op, literal } from 'sequelize';
