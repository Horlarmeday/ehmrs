import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { NhisTest } from './nhisTest';
import { Test } from './test';
import { Staff } from './staff';
import { Visit } from './visit';
import { Patient } from './patient';
import { BillingStatus, DispenseStatus, PaymentStatus } from './prescribedDrug';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum TestType {
  CASH = 'Cash',
  NHIS = 'NHIS',
}

@Table({ timestamps: true, tableName: 'Prescribed_Tests' })
export class PrescribedTest extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Test)
  @Column({
    type: DataType.INTEGER,
  })
  test_id: number;

  @ForeignKey(() => NhisTest)
  @Column({
    type: DataType.INTEGER,
  })
  nhis_test_id: number;

  @Column({
    type: DataType.ENUM(TestType.CASH, TestType.NHIS),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test type is required',
      },
    },
  })
  test_type: TestType;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  requester: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'price is required',
      },
    },
  })
  price: number;

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
    type: DataType.ENUM(PaymentStatus.CLEARED, PaymentStatus.PAID, PaymentStatus.PENDING),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  payment_status: DispenseStatus;

  @Column({
    type: DataType.ENUM(BillingStatus.BILLED, BillingStatus.UNBILLED),
    allowNull: false,
    defaultValue: BillingStatus.UNBILLED,
  })
  billing_status: BillingStatus;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_test_verified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_test_approved: boolean;

  @Column({
    type: DataType.DATE,
  })
  test_verified_date: Date;

  @Column({
    type: DataType.DATE,
  })
  test_approved_date: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  test_verified_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  test_approved_by: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_nhis_test_approved: boolean;

  @BelongsTo(() => Staff, {
    foreignKey: 'requester',
  })
  examiner: Staff;

  @BelongsTo(() => Staff, {
    foreignKey: 'test_verified_by',
  })
  test_verifier: Staff;

  @BelongsTo(() => Staff, {
    foreignKey: 'test_approved_by',
  })
  test_approver: Staff;

  @BelongsTo(() => Test)
  test: Test;

  @BelongsTo(() => NhisTest)
  nhis_test: NhisTest;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

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
