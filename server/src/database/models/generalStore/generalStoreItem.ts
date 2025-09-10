import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { Staff } from '../staff';
import { Vendor } from '../vendor';
import { Unit } from '../unit';
import { GeneralStoreCategory } from './generalStoreCategory';
import { GeneralStoreSubcategory } from './generalStoreSubcategory';
import { GeneralStoreMovement } from './generalStoreMovement';
import { GeneralStoreRequestItem } from './generalStoreRequestItem';
import { ItemStatus } from './types';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../../core/helpers/helper';

@Table({
  timestamps: true,
  tableName: 'General_Store_Items',
  indexes: [
    {
      name: 'idx_general_store_item_code',
      fields: ['item_code'],
      unique: true,
    },
    {
      name: 'idx_general_store_item_category',
      fields: ['category_id'],
    },
    {
      name: 'idx_general_store_item_subcategory',
      fields: ['subcategory_id'],
    },
    {
      name: 'idx_general_store_item_status',
      fields: ['status'],
    },
    {
      name: 'idx_general_store_item_supplier',
      fields: ['supplier_id'],
    },
    {
      name: 'idx_general_store_item_stock',
      fields: ['current_stock'],
    },
    {
      name: 'idx_general_store_item_expiry',
      fields: ['expiry_date'],
    },
    {
      name: 'idx_general_store_item_unit',
      fields: ['unit_id'],
    },
    {
      name: 'idx_general_store_item_composite_category_subcategory',
      fields: ['category_id', 'subcategory_id'],
    },
  ],
})
export class GeneralStoreItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Item code is required',
      },
    },
  })
  item_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Item name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ForeignKey(() => GeneralStoreCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Categories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  category_id: number;

  @ForeignKey(() => GeneralStoreSubcategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Subcategories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  subcategory_id: number;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'units', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  unit_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  manufacturer: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  model_number: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specifications: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Minimum stock cannot be negative',
      },
    },
  })
  minimum_stock: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1000,
    validate: {
      min: {
        args: [1],
        msg: 'Maximum stock must be at least 1',
      },
    },
  })
  maximum_stock: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Current stock cannot be negative',
      },
    },
  })
  current_stock: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Reserved stock cannot be negative',
      },
    },
  })
  reserved_stock: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
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
  })
  total_value: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Location is required',
      },
    },
  })
  location: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shelf_number: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiry_date: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_expirable: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_serialized: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_lot_tracked: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(ItemStatus)),
    allowNull: false,
    defaultValue: ItemStatus.ACTIVE,
  })
  status: ItemStatus;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    references: { model: 'vendors', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  supplier_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'staffs', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  updated_by: number;

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
  @BelongsTo(() => GeneralStoreCategory, { foreignKey: 'category_id' })
  category: GeneralStoreCategory;

  @BelongsTo(() => GeneralStoreSubcategory, { foreignKey: 'subcategory_id' })
  subcategory: GeneralStoreSubcategory;

  @BelongsTo(() => Unit, { foreignKey: 'unit_id' })
  unit: Unit;

  @BelongsTo(() => Vendor, { foreignKey: 'supplier_id' })
  supplier: Vendor;

  @BelongsTo(() => Staff, { as: 'creator', foreignKey: 'created_by' })
  creator: Staff;

  @BelongsTo(() => Staff, { as: 'updater', foreignKey: 'updated_by' })
  updater: Staff;

  @HasMany(() => GeneralStoreMovement, { foreignKey: 'item_id' })
  movements: GeneralStoreMovement[];

  @HasMany(() => GeneralStoreRequestItem, { foreignKey: 'item_id' })
  requestItems: GeneralStoreRequestItem[];

  // Helper methods
  getAvailableStock(): number {
    return this.current_stock - this.reserved_stock;
  }

  isLowStock(): boolean {
    return this.current_stock <= this.minimum_stock;
  }

  isOutOfStock(): boolean {
    return this.current_stock === 0;
  }

  isExpiringSoon(days = 30): boolean {
    if (!this.is_expirable || !this.expiry_date) {
      return false;
    }
    const expiryDate = new Date(this.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  }

  isExpired(): boolean {
    if (!this.is_expirable || !this.expiry_date) {
      return false;
    }
    return new Date(this.expiry_date) < new Date();
  }

  canReserve(quantity: number): boolean {
    return this.getAvailableStock() >= quantity;
  }

  updateTotalValue(): void {
    this.total_value = this.current_stock * this.unit_cost;
  }

  getFullPath(): string {
    return `${this.category?.name} > ${this.subcategory?.name} > ${this.name}`;
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
}
