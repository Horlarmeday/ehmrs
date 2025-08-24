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
import { Op } from 'sequelize';

export enum TriageStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  UPDATED = 'UPDATED',
}

@Table({ 
  timestamps: true, 
  tableName: 'Emergency_Triages',
  indexes: [
    {
      name: 'idx_emergency_triage_visit',
      fields: ['emergency_visit_id']
    },
    {
      name: 'idx_emergency_triage_nurse',
      fields: ['triage_nurse_id']
    },
    {
      name: 'idx_emergency_triage_status',
      fields: ['status']
    },
    {
      name: 'idx_emergency_triage_created',
      fields: ['createdAt']
    },
    {
      name: 'idx_emergency_triage_composite',
      fields: ['emergency_visit_id', 'status', 'createdAt']
    }
  ]
})
export class EmergencyTriage extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => EmergencyVisit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'emergency visit is required',
      },
    },
  })
  emergency_visit_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'triage nurse is required',
      },
    },
  })
  triage_nurse_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(TriageStatus)),
    defaultValue: TriageStatus.PENDING,
  })
  status: TriageStatus;

  // Vital Signs
  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Blood pressure systolic cannot be negative' },
      max: { args: [300], msg: 'Blood pressure systolic cannot exceed 300' },
    },
  })
  bp_systolic: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Blood pressure diastolic cannot be negative' },
      max: { args: [200], msg: 'Blood pressure diastolic cannot exceed 200' },
    },
  })
  bp_diastolic: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Pulse rate cannot be negative' },
      max: { args: [300], msg: 'Pulse rate cannot exceed 300' },
    },
  })
  pulse_rate: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [20], msg: 'Temperature cannot be below 20°C' },
      max: { args: [50], msg: 'Temperature cannot exceed 50°C' },
    },
  })
  temperature: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Respiratory rate cannot be negative' },
      max: { args: [100], msg: 'Respiratory rate cannot exceed 100' },
    },
  })
  respiratory_rate: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Oxygen saturation cannot be negative' },
      max: { args: [100], msg: 'Oxygen saturation cannot exceed 100%' },
    },
  })
  oxygen_saturation: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: { args: [0], msg: 'Pain score cannot be negative' },
      max: { args: [10], msg: 'Pain score cannot exceed 10' },
    },
  })
  pain_score: number; // 0-10 scale

  // Glasgow Coma Scale (for trauma/neurological cases)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: { args: [3], msg: 'GCS cannot be below 3' },
      max: { args: [15], msg: 'GCS cannot exceed 15' },
    },
  })
  glasgow_coma_scale: number;

  // Triage Assessment
  @Column({
    type: DataType.TEXT,
  })
  chief_complaint: string;

  @Column({
    type: DataType.TEXT,
  })
  presenting_symptoms: string;

  @Column({
    type: DataType.TEXT,
  })
  mechanism_of_injury: string; // For trauma cases

  @Column({
    type: DataType.TEXT,
  })
  allergies: string;

  @Column({
    type: DataType.TEXT,
  })
  current_medications: string;

  @Column({
    type: DataType.TEXT,
  })
  past_medical_history: string;

  @Column({
    type: DataType.TEXT,
  })
  social_history: string;

  @Column({
    type: DataType.TEXT,
  })
  family_history: string;

  // Triage Decision
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Priority score must be at least 1' },
      max: { args: [5], msg: 'Priority score cannot exceed 5' },
    },
  })
  priority_score: number; // 1-5 scale (1 = highest priority)

  @Column({
    type: DataType.TEXT,
  })
  triage_notes: string;

  @Column({
    type: DataType.TEXT,
  })
  recommended_action: string;

  @Column({
    type: DataType.STRING,
  })
  disposition: string; // Immediate, Urgent, Less Urgent, etc.

  @Column({
    type: DataType.DATE,
  })
  triage_completed_time: Date;

  // Relationships
  @BelongsTo(() => EmergencyVisit)
  emergency_visit: EmergencyVisit;

  @BelongsTo(() => Staff)
  triage_nurse: Staff;

  // Helper method to calculate priority score based on vital signs
  calculatePriorityScore(): number {
    let score = 5; // Start with lowest priority

    // Check for critical vital signs
    if (this.bp_systolic && this.bp_systolic < 90) score = 1;
    if (this.pulse_rate && this.pulse_rate > 120) score = Math.min(score, 2);
    if (this.respiratory_rate && this.respiratory_rate > 30) score = Math.min(score, 2);
    if (this.oxygen_saturation && this.oxygen_saturation < 90) score = Math.min(score, 1);
    if (this.glasgow_coma_scale && this.glasgow_coma_scale < 13) score = Math.min(score, 1);
    if (this.pain_score && this.pain_score >= 8) score = Math.min(score, 2);

    return score;
  }

  // Helper method to get triage category based on priority score
  getTriageCategory(): string {
    switch (this.priority_score) {
      case 1: return 'IMMEDIATE';
      case 2: return 'EMERGENT';
      case 3: return 'URGENT';
      case 4: return 'LESS_URGENT';
      case 5: return 'NON_URGENT';
      default: return 'NON_URGENT';
    }
  }
}
