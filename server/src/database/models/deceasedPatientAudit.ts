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
import { Staff } from './staff';

export enum DeceasedPatientAction {
  MARKED_DECEASED = 'MARKED_DECEASED',
  REVIVED = 'REVIVED',
  CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED',
  DEPENDANTS_TRANSFERRED = 'DEPENDANTS_TRANSFERRED',
  APPOINTMENTS_CANCELLED = 'APPOINTMENTS_CANCELLED',
  INSURANCE_CLAIMS_PROCESSED = 'INSURANCE_CLAIMS_PROCESSED',
  MEDICATIONS_RETURNED = 'MEDICATIONS_RETURNED',
}

@Table({
  tableName: 'deceased_patient_audit',
  timestamps: false,
})
export class DeceasedPatientAudit extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({ type: DataType.INTEGER, allowNull: false })
  patient_id: number;

  @Column({
    type: DataType.ENUM(
      DeceasedPatientAction.MARKED_DECEASED,
      DeceasedPatientAction.REVIVED,
      DeceasedPatientAction.CERTIFICATE_GENERATED,
      DeceasedPatientAction.DEPENDANTS_TRANSFERRED,
      DeceasedPatientAction.APPOINTMENTS_CANCELLED,
      DeceasedPatientAction.INSURANCE_CLAIMS_PROCESSED,
      DeceasedPatientAction.MEDICATIONS_RETURNED
    ),
    allowNull: false,
  })
  action: DeceasedPatientAction;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER, allowNull: false })
  performed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  performed_at: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  details: any;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  ip_address: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  user_agent: string;

  // Associations
  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Staff)
  staff: Staff;
}
