import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Test } from './test';
import { Staff } from './staff';
import { Visit } from './visit';
import { Patient } from './patient';
import { BillingStatus, PaymentStatus } from './prescribedDrug';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Sample } from './sample';
import { Source, TestPrescription } from './testPrescription';
import { TestResult } from './testResult';
import { Antenatal } from './antenatal';
import { SurgeryRequest } from './surgeryRequest';
import { NHISApprovalStatus } from '../../core/helpers/general';

export enum PrescriptionType {
  CASH = 'Cash',
  NHIS = 'NHIS',
  OTHER = 'Other',
  PRIVATE = 'Private',
}

export enum TestStatus {
  PENDING = 'Pending',
  REFERRED = 'Referred',
  COMPLETED = 'Completed',
  RESULT_ADDED = 'Result Added',
  SAMPLE_COLLECTED = 'Sample Collected',
  VERIFIED = 'Verified',
  APPROVED = 'Approved',
}

export enum ResultStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  PENDING = 'Pending',
}

@Table({ timestamps: true, tableName: 'Prescribed_Tests' })
export class PrescribedTest extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Test)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test id is required',
      },
    },
  })
  test_id: number;

  @ForeignKey(() => Sample)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'sample id is required',
      },
    },
  })
  sample_id: number;

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

  @ForeignKey(() => TestResult)
  @Column({
    type: DataType.INTEGER,
  })
  result_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_urgent: boolean;

  @Column({
    type: DataType.ENUM(
      PrescriptionType.CASH,
      PrescriptionType.NHIS,
      PrescriptionType.OTHER,
      PrescriptionType.PRIVATE
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test type is required',
      },
    },
  })
  test_type: PrescriptionType;

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
    type: DataType.ENUM(
      PaymentStatus.CLEARED,
      PaymentStatus.PAID,
      PaymentStatus.PENDING,
      PaymentStatus.PERMITTED
    ),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({
    type: DataType.ENUM(BillingStatus.BILLED, BillingStatus.UNBILLED),
    allowNull: false,
    defaultValue: BillingStatus.UNBILLED,
  })
  billing_status: BillingStatus;

  @Column({
    type: DataType.ENUM(
      TestStatus.PENDING,
      TestStatus.COMPLETED,
      TestStatus.REFERRED,
      TestStatus.SAMPLE_COLLECTED,
      TestStatus.RESULT_ADDED,
      TestStatus.VERIFIED,
      TestStatus.APPROVED
    ),
    allowNull: false,
    defaultValue: TestStatus.PENDING,
  })
  status: TestStatus;

  @Column({
    type: DataType.ENUM(ResultStatus.ACCEPTED, ResultStatus.REJECTED, ResultStatus.PENDING),
    defaultValue: ResultStatus.PENDING,
  })
  result_status: ResultStatus;

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
    type: DataType.ENUM(
      NHISApprovalStatus.APPROVED,
      NHISApprovalStatus.DECLINED,
      NHISApprovalStatus.PENDING
    ),
  })
  nhis_status: NHISApprovalStatus;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @ForeignKey(() => SurgeryRequest)
  @Column({
    type: DataType.INTEGER,
  })
  surgery_id: number;

  @Column({
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @Column({
    type: DataType.STRING,
  })
  auth_code: string;

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

  @BelongsTo(() => Sample)
  sample: Sample;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => TestPrescription)
  test_prescription: TestPrescription;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => TestResult)
  result: TestResult;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

  @BelongsTo(() => SurgeryRequest)
  surgeryRequest: SurgeryRequest;

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
