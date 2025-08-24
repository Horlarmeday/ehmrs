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
import { GeneralStoreCategory } from './generalStoreCategory';
import { GeneralStoreItem } from './generalStoreItem';

@Table({ 
  timestamps: true, 
  tableName: 'General_Store_Subcategories',
  indexes: [
    {
      name: 'idx_general_store_subcategory_category',
      fields: ['category_id']
    },
    {
      name: 'idx_general_store_subcategory_active',
      fields: ['is_active']
    },
    {
      name: 'idx_general_store_subcategory_name',
      fields: ['name']
    }
  ]
})
export class GeneralStoreSubcategory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subcategory name is required',
      },
    },
  })
  name: string;

  @ForeignKey(() => GeneralStoreCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: { model: 'General_Store_Categories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  category_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

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

  @HasMany(() => GeneralStoreItem, { foreignKey: 'subcategory_id' })
  items: GeneralStoreItem[];

  @BelongsTo(() => Staff, { as: 'creator', foreignKey: 'created_by' })
  creator: Staff;

  @BelongsTo(() => Staff, { as: 'updater', foreignKey: 'updated_by' })
  updater: Staff;

  // Helper methods
  getFullPath(): string {
    return `${this.category?.name} > ${this.name}`;
  }

  hasItems(): boolean {
    return this.items && this.items.length > 0;
  }

  canBeDeleted(): boolean {
    return !this.hasItems();
  }

  getActiveItemsCount(): number {
    return this.items ? this.items.filter(item => item.status === 'ACTIVE').length : 0;
  }
}
