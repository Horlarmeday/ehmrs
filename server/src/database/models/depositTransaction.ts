import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BeforeCreate,
} from 'sequelize-typescript';
import { PatientDeposit } from './patientDeposit';
import { ClinicalBill } from './clinicalBill';
import { JournalEntry } from './journalEntry';
import { Staff } from './staff';
import { FinancialPeriod } from './financialPeriod';
import { DepositTransactionType } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'deposit_transactions' })
export class DepositTransaction extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => PatientDeposit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'deposit id is required',
      },
    },
  })
  deposit_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(DepositTransactionType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'transaction type is required',
      },
    },
  })
  transaction_type: DepositTransactionType;

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

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'previous balance is required',
      },
    },
  })
  previous_balance: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'new balance is required',
      },
    },
  })
  new_balance: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'reference number is required',
      },
    },
  })
  reference_number: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ForeignKey(() => ClinicalBill)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  bill_id: number;

  @ForeignKey(() => FinancialPeriod)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    references: {
      model: 'financial_periods',
      key: 'id',
    },
  })
  period_id: number;

  @ForeignKey(() => JournalEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  journal_entry_id: number;

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

  // Relationships
  @BelongsTo(() => PatientDeposit)
  deposit: PatientDeposit;

  @BelongsTo(() => ClinicalBill)
  bill: ClinicalBill;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => FinancialPeriod, { foreignKey: 'period_id' })
  financialPeriod: FinancialPeriod;

  // Model hooks for validation and auto-population
  @BeforeCreate
  static async beforeCreateDepositTransaction(instance: DepositTransaction) {
    // Validate that new_balance is never negative
    if (instance.new_balance < 0) {
      throw new Error('New balance cannot be negative');
    }

    // Validate that amount is positive for all transaction types
    if (instance.amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    // Validate balance consistency based on transaction type
    switch (instance.transaction_type) {
      case DepositTransactionType.CREATED:
        if (instance.new_balance !== instance.previous_balance + instance.amount) {
          throw new Error('Balance inconsistency for CREATED transaction');
        }
        break;
      case DepositTransactionType.USED:
        if (instance.new_balance !== instance.previous_balance - instance.amount) {
          throw new Error('Balance inconsistency for USED transaction');
        }
        break;
      case DepositTransactionType.REFUNDED:
        if (instance.new_balance !== instance.previous_balance - instance.amount) {
          throw new Error('Balance inconsistency for REFUNDED transaction');
        }
        break;
      case DepositTransactionType.ADJUSTED:
        // For adjustments, we just validate the new balance is non-negative
        break;
      case DepositTransactionType.EXPIRED:
        if (instance.new_balance !== instance.previous_balance - instance.amount) {
          throw new Error('Balance inconsistency for EXPIRED transaction');
        }
        break;
    }
  }
}
