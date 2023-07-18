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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_urgent: boolean;

  @Column({
    type: DataType.ENUM(PrescriptionType.CASH, PrescriptionType.NHIS, PrescriptionType.OTHER),
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
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_investigation_verified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_investigation_approved: boolean;

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
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_nhis_investigation_approved: boolean;

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
