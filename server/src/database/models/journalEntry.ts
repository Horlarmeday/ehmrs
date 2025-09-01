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
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { JournalEntryLine } from './journalEntryLine';
import { Visit } from './visit';
import { Patient } from './patient';
import { FinancialPeriod } from './financialPeriod';
import { Staff } from './staff';
import { JournalEntryStatus } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'Journal_Entries' })
export class JournalEntry extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: new Date(),
    validate: {
      notEmpty: {
        msg: 'transaction date is required',
      },
    },
  })
  transaction_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'reference is required',
      },
    },
  })
  reference: string;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
  })
  visit_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
  })
  patient_id: number;

  @ForeignKey(() => FinancialPeriod)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  period_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(JournalEntryStatus)),
    defaultValue: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  entry_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  created_by: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  approved_by: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  posted_by: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reversed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approved_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  posted_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  reversed_at: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  approval_notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejection_reason: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reversal_reason: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  reversed_entry_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  unposted_at: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  unposted_by: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  unpost_reason: string;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => FinancialPeriod, { foreignKey: 'period_id' })
  financialPeriod: FinancialPeriod;

  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'approved_by' })
  approvedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'posted_by' })
  postedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'reversed_by' })
  reversedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'unposted_by' })
  unpostedByStaff: Staff;

  @BelongsTo(() => JournalEntry, { foreignKey: 'reversed_entry_id' })
  reversedEntry: JournalEntry;

  @HasMany(() => JournalEntryLine)
  lines: JournalEntryLine[];

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
