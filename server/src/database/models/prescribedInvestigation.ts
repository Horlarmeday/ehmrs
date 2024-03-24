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
import { PrescriptionType } from './prescribedTest';
import { Investigation } from './investigation';
import { InvestigationResult } from './investigationResult';
import { InvestigationPrescription } from './investigationPrescription';
import { Antenatal } from './antenatal';
import { Imaging } from './imaging';
import { SurgeryRequest } from './surgeryRequest';
import { NHISApprovalStatus } from '../../core/helpers/general';
import { PatientInsurance } from './patientInsurance';

export enum InvestigationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  APPROVED = 'Approved',
  RESULT_ADDED = 'Result Added',
  REFERRED = 'Referred',
  COMPLETED = 'Completed',
}

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
}

@Table({ timestamps: true, tableName: 'Prescribed_Investigations' })
export class PrescribedInvestigation extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Investigation)
  @Column({
    type: DataType.INTEGER,
  })
  investigation_id: number;

  @ForeignKey(() => Imaging)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imaging id is required',
      },
    },
  })
  imaging_id: number;

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
        msg: 'investigation type is required',
      },
    },
  })
  investigation_type: PrescriptionType;

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

  @ForeignKey(() => InvestigationPrescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'investigation prescription id is required',
      },
    },
  })
  investigation_prescription_id: number;

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

  @ForeignKey(() => InvestigationResult)
  @Column({
    type: DataType.INTEGER,
  })
  result_id: number;

  @Column({
    type: DataType.ENUM(
      InvestigationStatus.PENDING,
      InvestigationStatus.RESULT_ADDED,
      InvestigationStatus.VERIFIED,
      InvestigationStatus.APPROVED,
      InvestigationStatus.REFERRED
    ),
    allowNull: false,
    defaultValue: InvestigationStatus.PENDING,
  })
  status: InvestigationStatus;

  @Column({
    type: DataType.DATE,
  })
  investigation_verified_date: Date;

  @Column({
    type: DataType.DATE,
  })
  investigation_approved_date: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  investigation_verified_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  investigation_approved_by: number;

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

  @ForeignKey(() => PatientInsurance)
  @Column({
    type: DataType.INTEGER,
  })
  patient_insurance_id: number;

  @BelongsTo(() => Staff, {
    foreignKey: 'requester',
  })
  examiner: Staff;

  @BelongsTo(() => Staff, {
    foreignKey: 'investigation_verified_by',
  })
  investigation_verifier: Staff;

  @BelongsTo(() => Staff, {
    foreignKey: 'investigation_approved_by',
  })
  investigation_approver: Staff;

  @BelongsTo(() => Investigation)
  investigation: Investigation;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => InvestigationResult)
  result: InvestigationResult;

  @BelongsTo(() => InvestigationPrescription)
  investigation_prescription: InvestigationPrescription;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

  @BelongsTo(() => Imaging)
  imaging: Imaging;

  @BelongsTo(() => SurgeryRequest)
  surgeryRequest: SurgeryRequest;

  @BelongsTo(() => PatientInsurance)
  patientInsurance: PatientInsurance;

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
