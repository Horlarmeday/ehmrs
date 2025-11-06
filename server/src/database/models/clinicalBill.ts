import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Patient } from './patient';
import { Visit } from './visit';
import { Staff } from './staff';
import { ClinicalBillItem } from './clinicalBillItem';
import { ClinicalPayment } from './clinicalPayment';
import { HMO } from './hmo';
import { PatientInsurance } from './patientInsurance';
import { FinancialPeriod } from './financialPeriod';
import {
  PaymentStatus,
  BillingStatus,
  PaymentCollectionMethod,
  BillingMode,
} from '../../modules/Accounting/enums';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/lib/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true, tableName: 'clinical_bills' })
export class ClinicalBill extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  bill_number: string;

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

  @ForeignKey(() => FinancialPeriod)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  period_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  total_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  discount_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  tax_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  })
  final_amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(BillingMode)),
    allowNull: false,
  })
  billing_mode: BillingMode;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  patient_co_pay_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      // msg: 'HMO billed amount must be greater than or equal to 0',
    },
  })
  hmo_billed_amount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  hmo_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  patient_insurance_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({
    type: DataType.ENUM(...Object.values(BillingStatus)),
    allowNull: false,
    defaultValue: BillingStatus.DRAFT,
  })
  billing_status: BillingStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentCollectionMethod)),
    allowNull: false,
    defaultValue: PaymentCollectionMethod.POINT_OF_SERVICE,
  })
  payment_collection_method: PaymentCollectionMethod;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  payment_collection_point: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  due_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  auto_deposit_attempted: boolean;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'created by staff id is required',
      },
    },
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  updated_by: number;

  // Relationships
  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff, { foreignKey: 'created_by', as: 'createdByStaff' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by', as: 'updatedByStaff' })
  updatedByStaff: Staff;

  @HasMany(() => ClinicalBillItem)
  billItems: ClinicalBillItem[];

  @HasMany(() => ClinicalPayment)
  payments: ClinicalPayment[];

  @BelongsTo(() => HMO, { foreignKey: 'hmo_id' })
  hmo: HMO;

  @BelongsTo(() => PatientInsurance, { foreignKey: 'patient_insurance_id' })
  patientInsurance: PatientInsurance;

  @BelongsTo(() => FinancialPeriod, { foreignKey: 'period_id' })
  financialPeriod: FinancialPeriod;

  static async paginate(param: {
    paginate: number;
    attributes?: FindAttributeOptions;
    where?: WhereOptions;
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
