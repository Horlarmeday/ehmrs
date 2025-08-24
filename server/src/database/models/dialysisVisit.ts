import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Patient } from './patient';
import { Staff } from './staff';
import { Visit } from './visit';
import { DialysisTreatment } from './dialysisTreatment';
import { DialysisAssessment } from './dialysisAssessment';
import { DialysisVitals } from './dialysisVitals';
import { DialysisNotes } from './dialysisNotes';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum DialysisStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum DialysisType {
  HEMODIALYSIS = 'HEMODIALYSIS',
  PERITONEAL = 'PERITONEAL',
  CONTINUOUS = 'CONTINUOUS',
  INTERMITTENT = 'INTERMITTENT',
}

@Table({
  timestamps: true,
  tableName: 'Dialysis_Visits',
  indexes: [
    {
      name: 'idx_dialysis_visit_patient',
      fields: ['patient_id'],
    },
    {
      name: 'idx_dialysis_visit_visit',
      fields: ['visit_id'],
    },
    {
      name: 'idx_dialysis_visit_doctor',
      fields: ['doctor_id'],
    },
    {
      name: 'idx_dialysis_visit_nurse',
      fields: ['nurse_id'],
    },
    {
      name: 'idx_dialysis_visit_type',
      fields: ['dialysis_type'],
    },
    {
      name: 'idx_dialysis_visit_status',
      fields: ['status'],
    },
    {
      name: 'idx_dialysis_visit_scheduled_date',
      fields: ['scheduled_date'],
    },
    {
      name: 'idx_dialysis_visit_composite_patient_date',
      fields: ['patient_id', 'scheduled_date'],
    },
  ],
})
export class DialysisVisit extends Model {
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
    allowNull: true,
  })
  visit_id: number; // Optional: Links to general visit if applicable

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  doctor_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  nurse_id: number;

  @Column({
    type: DataType.ENUM(
      DialysisType.HEMODIALYSIS,
      DialysisType.PERITONEAL,
      DialysisType.CONTINUOUS,
      DialysisType.INTERMITTENT
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dialysis type is required',
      },
    },
  })
  dialysis_type: DialysisType;

  @Column({
    type: DataType.ENUM(
      DialysisStatus.SCHEDULED,
      DialysisStatus.IN_PROGRESS,
      DialysisStatus.COMPLETED,
      DialysisStatus.CANCELLED,
      DialysisStatus.NO_SHOW
    ),
    defaultValue: DialysisStatus.SCHEDULED,
  })
  status: DialysisStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'scheduled date is required',
      },
    },
  })
  scheduled_date: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'scheduled time is required',
      },
    },
  })
  scheduled_time: string;

  @Column({
    type: DataType.DATE,
  })
  actual_start_date: Date;

  @Column({
    type: DataType.DATE,
  })
  actual_end_date: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Duration must be at least 1 minute',
      },
    },
  })
  planned_duration_minutes: number; // Planned duration in minutes

  @Column({
    type: DataType.INTEGER,
  })
  actual_duration_minutes: number; // Actual duration in minutes

  @Column({
    type: DataType.TEXT,
  })
  clinical_notes: string;

  @Column({
    type: DataType.TEXT,
  })
  nursing_notes: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative',
      },
    },
  })
  price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  patient_payment: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  hmo_payment: number;

  @Column({
    type: DataType.STRING,
  })
  machine_number: string;

  @Column({
    type: DataType.STRING,
  })
  bed_number: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_emergency: boolean;

  @Column({
    type: DataType.TEXT,
  })
  cancellation_reason: string;

  // Relationships
  @HasMany(() => DialysisTreatment)
  treatments: DialysisTreatment[];

  @HasMany(() => DialysisAssessment)
  assessments: DialysisAssessment[];

  @HasMany(() => DialysisVitals)
  vitals: DialysisVitals[];

  @HasMany(() => DialysisNotes)
  notes: DialysisNotes[];

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff, { as: 'doctor' })
  doctor: Staff;

  @BelongsTo(() => Staff, { as: 'nurse' })
  nurse: Staff;

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
