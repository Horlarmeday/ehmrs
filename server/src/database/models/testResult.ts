import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
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
import { TestPrescription } from './testPrescriptions';
import { Staff } from './staff';

export enum ResultStatus {
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  ACCEPTED = 'Accepted',
}

@Table({ timestamps: true, tableName: 'Test_Results' })
export class TestResult extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => PrescribedTest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'prescribed test id is required',
      },
    },
  })
  prescribed_test_id: number;

  @Column({
    type: DataType.TEXT,
  })
  result: string;

  @ForeignKey(() => TestPrescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test prescription id is required',
      },
    },
  })
  test_prescription_id: number;

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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'staff id is required',
      },
    },
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date requested is required',
      },
    },
  })
  date_created: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_abnormal: boolean;

  @Column({
    type: DataType.ENUM(ResultStatus.REJECTED, ResultStatus.ACCEPTED, ResultStatus.PENDING),
    defaultValue: ResultStatus.PENDING,
  })
  status: ResultStatus;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.TEXT,
  })
  institute_referred: string;

  @Column({
    type: DataType.STRING,
  })
  referral_reason: string;

  @BelongsTo(() => TestPrescription)
  prescription: TestPrescription;

  @BelongsTo(() => PrescribedTest)
  test: PrescribedTest;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Staff)
  staff: Staff;

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
