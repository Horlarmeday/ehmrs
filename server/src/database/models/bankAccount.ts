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
import { BankAccountType } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'bank_accounts' })
export class BankAccount extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Bank name is required',
      },
    },
  })
  bank_name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Account number is required',
      },
    },
  })
  account_number: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Account name is required',
      },
    },
  })
  account_name: string;

  @Column({
    type: DataType.ENUM(...Object.values(BankAccountType)),
    allowNull: false,
    defaultValue: BankAccountType.CURRENT,
  })
  account_type: BankAccountType;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  current_balance: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Created by staff id is required',
      },
    },
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  updated_by: number;

  // Relationships
  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

  // Virtual fields for computed values
  get display_name(): string {
    return `${this.bank_name} - ${this.account_number}`;
  }

  get status_display(): string {
    return this.is_active ? 'Active' : 'Inactive';
  }
}
