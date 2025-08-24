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
import { Patient } from './patient';
import { PatientDeposit } from './patientDeposit';
import { Staff } from './staff';
import { PaymentMethod, PaymentType, PaymentStatus } from '../../modules/Accounting/enums';

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

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      msg: 'amount must be greater than or equal to 0',
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
}
