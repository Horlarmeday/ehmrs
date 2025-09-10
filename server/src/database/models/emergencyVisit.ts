import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Index,
} from 'sequelize-typescript';
import { Patient } from './patient';
import { Staff } from './staff';
import { Visit } from './visit';
import { EmergencyTriage } from './emergencyTriage';
import { EmergencyBed } from './emergencyBed';
import { EmergencyProcedure } from './emergencyProcedure';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum EmergencyStatus {
  TRIAGE = 'TRIAGE',
  ASSESSMENT = 'ASSESSMENT',
  TREATMENT = 'TREATMENT',
  OBSERVATION = 'OBSERVATION',
  DISCHARGED = 'DISCHARGED',
  ADMITTED = 'ADMITTED',
  TRANSFERRED = 'TRANSFERRED',
  DECEASED = 'DECEASED',
}

export enum EmergencyType {
  TRAUMA = 'TRAUMA',
  MEDICAL = 'MEDICAL',
  SURGICAL = 'SURGICAL',
  OBSTETRIC = 'OBSTETRIC',
  PEDIATRIC = 'PEDIATRIC',
  PSYCHIATRIC = 'PSYCHIATRIC',
  CARDIAC = 'CARDIAC',
  RESPIRATORY = 'RESPIRATORY',
  NEUROLOGICAL = 'NEUROLOGICAL',
}

export enum TriageCategory {
  IMMEDIATE = 'IMMEDIATE', // Red - Life-threatening
  EMERGENT = 'EMERGENT', // Orange - Very urgent
  URGENT = 'URGENT', // Yellow - Urgent
  LESS_URGENT = 'LESS_URGENT', // Green - Less urgent
  NON_URGENT = 'NON_URGENT', // Blue - Non-urgent
}

@Table({
  timestamps: true,
  tableName: 'Emergency_Visits',
  indexes: [
    {
      name: 'idx_emergency_visit_patient',
      fields: ['patient_id'],
    },
    {
      name: 'idx_emergency_visit_status',
      fields: ['status'],
    },
    {
      name: 'idx_emergency_visit_type',
      fields: ['emergency_type'],
    },
    {
      name: 'idx_emergency_visit_triage',
      fields: ['triage_category'],
    },
    {
      name: 'idx_emergency_visit_arrival',
      fields: ['arrival_time'],
    },
    {
      name: 'idx_emergency_visit_priority',
      fields: ['priority_score'],
    },
    {
      name: 'idx_emergency_visit_composite',
      fields: ['status', 'triage_category', 'arrival_time'],
    },
  ],
})
export class EmergencyVisit extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'patient is required',
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
        msg: 'visit is required',
      },
    },
  })
  visit_id: number; // Links to general visit

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'attending physician is required',
      },
    },
  })
  attending_physician_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  triage_nurse_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  emergency_nurse_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(EmergencyType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'emergency type is required',
      },
    },
  })
  emergency_type: EmergencyType;

  @Column({
    type: DataType.ENUM(...Object.values(EmergencyStatus)),
    defaultValue: EmergencyStatus.TRIAGE,
  })
  status: EmergencyStatus;

  @Column({
    type: DataType.ENUM(...Object.values(TriageCategory)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'triage category is required',
      },
    },
  })
  triage_category: TriageCategory;

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
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'arrival time is required',
      },
    },
  })
  arrival_time: Date;

  @Column({
    type: DataType.DATE,
  })
  triage_completed_time: Date;

  @Column({
    type: DataType.DATE,
  })
  assessment_started_time: Date;

  @Column({
    type: DataType.DATE,
  })
  treatment_started_time: Date;

  @Column({
    type: DataType.DATE,
  })
  disposition_time: Date;

  @Column({
    type: DataType.STRING,
  })
  chief_complaint: string;

  @Column({
    type: DataType.TEXT,
  })
  presenting_symptoms: string;

  @Column({
    type: DataType.TEXT,
  })
  vital_signs: string;

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
    type: DataType.STRING,
  })
  mode_of_arrival: string; // Ambulance, Walk-in, Private vehicle, etc.

  @Column({
    type: DataType.STRING,
  })
  accompanying_person: string;

  @Column({
    type: DataType.STRING,
  })
  contact_phone: string;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  total_cost: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_insured: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  insurance_id: number;

  @Column({
    type: DataType.STRING,
  })
  insurance_number: string;

  // Relationships
  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff, { as: 'attending_physician' })
  attending_physician: Staff;

  @BelongsTo(() => Staff, { as: 'triage_nurse' })
  triage_nurse: Staff;

  @BelongsTo(() => Staff, { as: 'emergency_nurse' })
  emergency_nurse: Staff;

  @HasMany(() => EmergencyTriage)
  triages: EmergencyTriage[];

  @HasMany(() => EmergencyBed)
  bed_assignments: EmergencyBed[];

  @HasMany(() => EmergencyProcedure)
  procedures: EmergencyProcedure[];

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
