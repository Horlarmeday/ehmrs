import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { Patient } from './patient';
import { Staff } from './staff';
import { BankAccount } from './bankAccount';
import { POSTerminal } from './posTerminal';
import { DepositType, DepositStatus } from '../../modules/Accounting/enums';
import { FinancialPeriod } from './financialPeriod';
import { FindAttributeOptions, GroupOption, Includeable, Order, WhereOptions } from 'sequelize';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true, tableName: 'patient_deposits' })
export class PatientDeposit extends Model<PatientDeposit> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'patient id is required',
      },
    },
  })
  patient_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'amount is required',
      },
    },
  })
  amount: number;

  @ForeignKey(() => BankAccount)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  bank_account_id: number;

  @ForeignKey(() => POSTerminal)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  pos_terminal_id: number;

  @ForeignKey(() => FinancialPeriod)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  period_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  initial_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  current_balance: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  refundable_amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  deposit_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_activity_date: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  payment_method: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  payment_reference: string;

  @Column({
    type: DataType.ENUM(...Object.values(DepositType)),
    allowNull: false,
  })
  deposit_type: DepositType;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  reference_number: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(DepositStatus)),
    allowNull: false,
    defaultValue: DepositStatus.ACTIVE,
  })
  status: DepositStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'created by staff id is required',
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
  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => BankAccount)
  bankAccount: BankAccount;

  @BelongsTo(() => POSTerminal)
  posTerminal: POSTerminal;

  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

  @BelongsTo(() => FinancialPeriod, { foreignKey: 'period_id' })
  financialPeriod: FinancialPeriod;

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

  // Model hooks for validation and auto-population
  @BeforeCreate
  static beforeCreatePatientDeposit(instance: any) {
    // Set initial amount equal to amount on creation
    if (!instance.initial_amount) {
      instance.initial_amount = instance.amount;
    }
    
    // Set current balance equal to amount on creation
    if (!instance.current_balance) {
      instance.current_balance = instance.amount;
    }
    
    // Set refundable amount equal to amount on creation
    if (!instance.refundable_amount) {
      instance.refundable_amount = instance.amount;
    }
    
    // Set deposit date to current date if not provided
    if (!instance.deposit_date) {
      instance.deposit_date = new Date();
    }
    
    // Set last activity date to current date
    instance.last_activity_date = new Date();
  }

  @BeforeUpdate
  static beforeUpdatePatientDeposit(instance: any) {
    // Update last activity date on any change
    instance.last_activity_date = new Date();
    
    // Validate that current_balance is never negative
    if (instance.current_balance < 0) {
      throw new Error('Current balance cannot be negative');
    }
    
    // Validate that refundable_amount never exceeds current_balance
    if (instance.refundable_amount > instance.current_balance) {
      throw new Error('Refundable amount cannot exceed current balance');
    }
  }
}
