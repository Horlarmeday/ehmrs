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
import { BillingStatus, DispenseStatus, PaymentStatus } from './prescribedDrug';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Service } from './service';
import { Antenatal } from './antenatal';
import { SurgeryRequest } from './surgeryRequest';
import { NHISApprovalStatus } from '../../core/helpers/general';
import { PatientInsurance } from './patientInsurance';

export enum ServiceType {
  CASH = 'Cash',
  NHIS = 'NHIS',
  OTHER = 'Other',
  PRIVATE = 'Private',
}

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
}

@Table({ timestamps: true, tableName: 'Prescribed_Services' })
export class PrescribedService extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Service)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'service id is required',
      },
    },
  })
  service_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_urgent: boolean;

  @Column({
    type: DataType.ENUM(ServiceType.CASH, ServiceType.NHIS, ServiceType.OTHER, ServiceType.PRIVATE),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'service type is required',
      },
    },
  })
  service_type: ServiceType;

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
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  quantity: number;

  @Column({
    type: DataType.ENUM(
      NHISApprovalStatus.APPROVED,
      NHISApprovalStatus.DECLINED,
      NHISApprovalStatus.PENDING
    ),
  })
  nhis_status: NHISApprovalStatus;

  @Column({
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION, Source.THEATER),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @BelongsTo(() => Staff, {
    foreignKey: 'requester',
  })
  examiner: Staff;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @ForeignKey(() => PatientInsurance)
  @Column({
    type: DataType.INTEGER,
  })
  patient_insurance_id: number;

  @ForeignKey(() => SurgeryRequest)
  @Column({
    type: DataType.INTEGER,
  })
  surgery_id: number;

  @Column({
    type: DataType.STRING,
  })
  auth_code: string;

  @Column({
    type: DataType.INTEGER,
  })
  old_id: number;

  @BelongsTo(() => Service)
  service: Service;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

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
