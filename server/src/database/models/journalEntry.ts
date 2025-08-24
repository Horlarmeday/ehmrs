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
import { JournalEntryStatus } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'Journal_Entries' })
export class JournalEntry extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
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

  @Column({
    type: DataType.ENUM(...Object.values(JournalEntryStatus)),
    defaultValue: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

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
