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
import { JournalEntry } from './journalEntry';
import { DepositJournalEntryType } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'deposit_journal_entries' })
export class DepositJournalEntry extends Model {
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

  @ForeignKey(() => JournalEntry)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'journal entry id is required',
      },
    },
  })
  journal_entry_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(DepositJournalEntryType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'entry type is required',
      },
    },
  })
  entry_type: DepositJournalEntryType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      msg: 'amount must be greater than or equal to 0',
    },
  })
  amount: number;

  // Relationships
  @BelongsTo(() => PatientDeposit)
  deposit: PatientDeposit;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  // Model hooks for validation
  @BeforeCreate
  static async beforeCreateDepositJournalEntry(instance: DepositJournalEntry) {
    // Validate that amount is positive
    if (instance.amount <= 0) {
      throw new Error('Journal entry amount must be positive');
    }

    // Validate entry type based on amount
    switch (instance.entry_type) {
      case DepositJournalEntryType.DEPOSIT:
        // For deposits, amount should represent the deposit amount
        if (instance.amount <= 0) {
          throw new Error('Deposit amount must be positive');
        }
        break;
      case DepositJournalEntryType.USAGE:
        // For usage, amount should represent the amount used
        if (instance.amount <= 0) {
          throw new Error('Usage amount must be positive');
        }
        break;
      case DepositJournalEntryType.REFUND:
        // For refunds, amount should represent the refund amount
        if (instance.amount <= 0) {
          throw new Error('Refund amount must be positive');
        }
        break;
      case DepositJournalEntryType.ADJUSTMENT:
        // For adjustments, amount can be positive or negative
        // but we'll validate it's not zero
        if (instance.amount === 0) {
          throw new Error('Adjustment amount cannot be zero');
        }
        break;
    }
  }
}
