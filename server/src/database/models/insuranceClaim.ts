import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ClinicalPayment } from './clinicalPayment';
import { Staff } from './staff';

@Table({ timestamps: true, tableName: 'insurance_claims' })
export class InsuranceClaim extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ClinicalPayment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  payment_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Unique claim reference number',
  })
  claim_reference: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Date when claim was submitted',
  })
  claim_date: Date;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Total claim amount',
  })
  claim_amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Co-payment amount required from patient',
  })
  copay_amount: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount covered by insurance',
  })
  insurance_coverage: number;

  @Column({
    type: DataType.ENUM(
      'PENDING',
      'SUBMITTED',
      'APPROVED',
      'REJECTED',
      'PAID',
      'PARTIALLY_APPROVED'
    ),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Status of the insurance claim',
  })
  claim_status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if claim is rejected',
  })
  rejection_reason: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when claim was approved',
  })
  approval_date: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Staff member who approved the claim',
  })
  approved_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when claim was settled',
  })
  settlement_date: Date;

  @Column({
    type: DataType.ENUM('BANK_TRANSFER', 'CHECK', 'CASH', 'ELECTRONIC'),
    allowNull: true,
    comment: 'Method used for claim settlement',
  })
  settlement_method: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Reference number for claim settlement',
  })
  settlement_reference: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Bank reference for settlement',
  })
  bank_reference: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: 'Check number if settlement is by check',
  })
  check_number: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Processing fee for the claim',
  })
  processing_fee: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Administrative fee for the claim',
  })
  administrative_fee: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Deductible amount for the claim',
  })
  deductible_amount: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Co-insurance percentage',
  })
  coinsurance_percentage: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Out-of-pocket maximum for the claim',
  })
  out_of_pocket_maximum: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Start of benefit period',
  })
  benefit_period_start: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'End of benefit period',
  })
  benefit_period_end: Date;

  @Column({
    type: DataType.ENUM('IN_NETWORK', 'OUT_OF_NETWORK', 'UNKNOWN'),
    allowNull: false,
    defaultValue: 'UNKNOWN',
    comment: 'Network status for the claim',
  })
  network_status: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether prior authorization is required',
  })
  prior_authorization_required: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date of prior authorization',
  })
  prior_authorization_date: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: 'Denial code if claim is denied',
  })
  denial_code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Description of denial reason',
  })
  denial_description: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Deadline for filing an appeal',
  })
  appeal_deadline: Date;

  @Column({
    type: DataType.ENUM('NOT_APPEALED', 'APPEALED', 'APPEAL_GRANTED', 'APPEAL_DENIED'),
    allowNull: false,
    defaultValue: 'NOT_APPEALED',
    comment: 'Status of any appeal filed',
  })
  appeal_status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when appeal was filed',
  })
  appeal_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Notes about the appeal',
  })
  appeal_notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Additional notes about the claim',
  })
  notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when claim was submitted',
  })
  submitted_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'Staff member who submitted the claim',
  })
  submitted_by: number;

  // Relationships
  @BelongsTo(() => ClinicalPayment, { foreignKey: 'payment_id' })
  payment: ClinicalPayment;

  @BelongsTo(() => Staff, { foreignKey: 'approved_by' })
  approvedByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'submitted_by' })
  submittedByStaff: Staff;
}
