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
import { GeneralStoreSubcategory } from './generalStoreSubcategory';

@Table({ 
  timestamps: true, 
  tableName: 'General_Store_Categories',
  indexes: [
    {
      name: 'idx_general_store_category_parent',
      fields: ['parent_id']
    },
    {
      name: 'idx_general_store_category_active',
      fields: ['is_active']
    },
    {
      name: 'idx_general_store_category_name',
      fields: ['name']
    }
  ]
})
export class GeneralStoreCategory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category name is required',
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
    allowNull: true,
    references: { model: 'General_Store_Categories', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  parent_id: number;

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
  @BelongsTo(() => GeneralStoreCategory, { as: 'parent', foreignKey: 'parent_id' })
  parent: GeneralStoreCategory;

  @HasMany(() => GeneralStoreCategory, { as: 'children', foreignKey: 'parent_id' })
  children: GeneralStoreCategory[];

  @HasMany(() => GeneralStoreSubcategory, { foreignKey: 'category_id' })
  subcategories: GeneralStoreSubcategory[];

  @BelongsTo(() => Staff, { as: 'creator', foreignKey: 'created_by' })
  creator: Staff;

  @BelongsTo(() => Staff, { as: 'updater', foreignKey: 'updated_by' })
  updater: Staff;

  // Helper methods
  isRoot(): boolean {
    return this.parent_id === null;
  }

  hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  hasSubcategories(): boolean {
    return this.subcategories && this.subcategories.length > 0;
  }

  getFullPath(): string {
    if (this.isRoot()) {
      return this.name;
    }
    return `${this.parent?.getFullPath()} > ${this.name}`;
  }

  canBeDeleted(): boolean {
    return !this.hasChildren() && !this.hasSubcategories();
  }
}
