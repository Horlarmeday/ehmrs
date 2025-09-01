import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ClinicalBill } from './clinicalBill';
import { ClinicalBillItem } from './clinicalBillItem';
import { ClinicalPaymentItem } from './clinicalPaymentItem';
import { Patient } from './patient';
import { PatientDeposit } from './patientDeposit';
import { Staff } from './staff';
import { FinancialPeriod } from './financialPeriod';
import { PaymentMethod, PaymentType, PaymentStatus } from '../../modules/Accounting/enums';
import { POSTerminalTransaction } from './posTerminalTransaction';
import { InsuranceClaim } from './insuranceClaim';
import { BankTransfer } from './bankTransfer';
import { CashTransaction } from './cashTransaction';
import { POSTerminal } from './posTerminal';
import { BankAccount } from './bankAccount';
import { PatientInsurance } from './patientInsurance';
import { Visit } from './visit';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/lib/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true, tableName: 'clinical_payments' })
export class ClinicalPayment extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  payment_reference: string;

  @ForeignKey(() => ClinicalBill)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bill id is required',
      },
    },
  })
  bill_id: number;

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
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false,
  })
  payment_method: PaymentMethod;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentType)),
    allowNull: false,
  })
  payment_type: PaymentType;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  collection_point: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  transaction_id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  bank_reference: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  card_type: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  mobile_money_provider: string;

  @ForeignKey(() => PatientDeposit)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  deposit_id: number;

  @ForeignKey(() => POSTerminal)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  pos_terminal_id: number;

  @ForeignKey(() => BankAccount)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  bank_account_id: number;

  @ForeignKey(() => PatientInsurance)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  patient_insurance_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Amount used from patient deposit for this payment',
  })
  deposit_usage: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  insurance_provider: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  insurance_claim_number: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'processed by staff id is required',
      },
    },
  })
  processed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  processed_at: Date;

  // Relationships
  @BelongsTo(() => ClinicalBill)
  bill: ClinicalBill;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => PatientDeposit)
  deposit: PatientDeposit;

  @BelongsTo(() => Staff, { foreignKey: 'processed_by' })
  processedByStaff: Staff;

  @BelongsTo(() => FinancialPeriod, { foreignKey: 'period_id' })
  financialPeriod: FinancialPeriod;

  @BelongsTo(() => Visit, {
    foreignKey: 'visit_id',
  })
  visit: Visit;

  // Payment items relationship
  @BelongsTo(() => ClinicalPaymentItem, {
    foreignKey: 'id',
    targetKey: 'payment_id',
  })
  paymentItems: ClinicalPaymentItem[];

  // Payment method specific relationships
  @BelongsTo(() => BankTransfer, {
    foreignKey: 'id',
    targetKey: 'payment_id',
  })
  bankTransfer: BankTransfer;

  @BelongsTo(() => InsuranceClaim, {
    foreignKey: 'id',
    targetKey: 'payment_id',
  })
  insuranceClaim: InsuranceClaim;

  @BelongsTo(() => POSTerminalTransaction, {
    foreignKey: 'id',
    targetKey: 'payment_id',
  })
  posTerminalTransaction: POSTerminalTransaction;

  @BelongsTo(() => CashTransaction, {
    foreignKey: 'id',
    targetKey: 'payment_id',
  })
  cashTransaction: CashTransaction;

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
