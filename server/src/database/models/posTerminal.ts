import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { BankAccount } from './bankAccount';

@Table({ timestamps: true, tableName: 'pos_terminals' })
export class POSTerminal extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Terminal ID is required',
      },
    },
  })
  terminal_id: string;

  @ForeignKey(() => BankAccount)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Bank account is required',
      },
    },
  })
  bank_account_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Location is required',
      },
    },
  })
  location: string;

  @Column({
    type: DataType.ENUM('MOBILE', 'FIXED', 'KIOSK'),
    allowNull: false,
    defaultValue: 'FIXED',
  })
  terminal_type: 'MOBILE' | 'FIXED' | 'KIOSK';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  merchant_name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  merchant_id: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  daily_transaction_limit: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  daily_amount_limit: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_used_at: Date;

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
  @BelongsTo(() => BankAccount, { foreignKey: 'bank_account_id' })
  bankAccount: BankAccount;

  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

  // Virtual fields for computed values
  get display_name(): string {
    return `${this.terminal_id} - ${this.location}`;
  }

  get status_display(): string {
    return this.is_active ? 'Active' : 'Inactive';
  }

  get terminal_type_display(): string {
    const typeMap = {
      MOBILE: 'Mobile POS',
      FIXED: 'Fixed POS',
      KIOSK: 'POS Kiosk',
    };
    return typeMap[this.terminal_type] || this.terminal_type;
  }
}
