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
import { Visit } from './visit';
import { Patient } from './patient';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { PrescribedTest } from './prescribedTest';
import { TestResult } from './testResult';
import { Antenatal } from './antenatal';

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
}

export enum TestStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  SAMPLE_COLLECTED = 'Sample Collected',
}

@Table({ timestamps: true, tableName: 'Test_Prescriptions' })
export class TestPrescription extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  requester: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit id is required',
      },
    },
  })
  visit_id: number;

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
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date requested is required',
      },
    },
  })
  date_requested: Date;

  @Column({
    type: DataType.DATE,
  })
  date_sample_received: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_billed: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_paid: boolean;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  accession_number: string;

  @Column({
    type: DataType.ENUM(TestStatus.PENDING, TestStatus.COMPLETED, TestStatus.SAMPLE_COLLECTED),
    allowNull: false,
    defaultValue: TestStatus.PENDING,
  })
  status: TestStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  sample_received_by: number;

  @Column({
    type: DataType.TEXT,
  })
  result_notes: string;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @BelongsTo(() => Staff, {
    foreignKey: 'requester',
  })
  examiner: Staff;

  @HasMany(() => TestResult)
  results: TestResult[];

  @HasMany(() => PrescribedTest)
  tests: PrescribedTest[];

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Staff, {
    foreignKey: 'sample_received_by',
  })
  sample_receiver: Staff;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

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
