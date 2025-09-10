import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { EmergencyVisit } from './emergencyVisit';
import { Staff } from './staff';

export enum ProcedureStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  COMPLICATED = 'COMPLICATED',
}

export enum ProcedureType {
  RESUSCITATION = 'RESUSCITATION',
  INTUBATION = 'INTUBATION',
  CENTRAL_LINE = 'CENTRAL_LINE',
  CHEST_TUBE = 'CHEST_TUBE',
  LACERATION_REPAIR = 'LACERATION_REPAIR',
  FRACTURE_REDUCTION = 'FRACTURE_REDUCTION',
  EMERGENCY_SURGERY = 'EMERGENCY_SURGERY',
  CARDIAC_ARREST = 'CARDIAC_ARREST',
  TRAUMA_SURVEY = 'TRAUMA_SURVEY',
  OTHER = 'OTHER',
}

@Table({
  timestamps: true,
  tableName: 'Emergency_Procedures',
  indexes: [
    { name: 'idx_emergency_procedure_visit', fields: ['emergency_visit_id'] },
    { name: 'idx_emergency_procedure_type', fields: ['procedure_type'] },
    { name: 'idx_emergency_procedure_status', fields: ['status'] },
    { name: 'idx_emergency_procedure_doctor', fields: ['performing_doctor_id'] },
    { name: 'idx_emergency_procedure_composite', fields: ['emergency_visit_id', 'status'] },
  ],
})
export class EmergencyProcedure extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => EmergencyVisit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { notEmpty: { msg: 'emergency visit is required' } },
  })
  emergency_visit_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { notEmpty: { msg: 'performing doctor is required' } },
  })
  performing_doctor_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(ProcedureType)),
    allowNull: false,
    validate: { notEmpty: { msg: 'procedure type is required' } },
  })
  procedure_type: ProcedureType;

  @Column({
    type: DataType.ENUM(...Object.values(ProcedureStatus)),
    defaultValue: ProcedureStatus.PLANNED,
  })
  status: ProcedureStatus;

  @Column({ type: DataType.STRING, allowNull: false })
  procedure_name: string;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({ type: DataType.TEXT })
  indications: string;

  @Column({ type: DataType.TEXT })
  contraindications: string;

  @Column({ type: DataType.TEXT })
  complications: string;

  @Column({ type: DataType.DATE })
  planned_time: Date;

  @Column({ type: DataType.DATE })
  started_time: Date;

  @Column({ type: DataType.DATE })
  completed_time: Date;

  @Column({ type: DataType.INTEGER })
  duration_minutes: number;

  @Column({ type: DataType.TEXT })
  procedure_notes: string;

  @Column({ type: DataType.TEXT })
  outcome: string;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  cost: number;

  // Relationships
  @BelongsTo(() => EmergencyVisit)
  emergency_visit: EmergencyVisit;

  @BelongsTo(() => Staff)
  performing_doctor: Staff;
}
