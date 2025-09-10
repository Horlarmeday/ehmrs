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
import { Visit, VisitCategory } from './visit';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',
  RESCHEDULED = 'Rescheduled',
}

export enum AppointmentType {
  CONSULTATION = 'Consultation',
  FOLLOW_UP = 'Follow Up',
  PROCEDURE = 'Procedure',
  VACCINATION = 'Vaccination',
  DIALYSIS = 'Dialysis',
  ANTENATAL = 'Antenatal',
}

@Table({ timestamps: true })
export class Appointment extends Model {
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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'doctor is required',
      },
    },
  })
  doctor_id: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'appointment date is required',
      },
    },
  })
  appointment_date: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'appointment time is required',
      },
    },
  })
  appointment_time: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: {
        args: [15],
        msg: 'minimum appointment duration is 15 minutes',
      },
      max: {
        args: [240],
        msg: 'maximum appointment duration is 240 minutes',
      },
    },
  })
  duration_minutes: number;

  @Column({
    type: DataType.ENUM(
      AppointmentType.CONSULTATION,
      AppointmentType.FOLLOW_UP,
      AppointmentType.PROCEDURE,
      AppointmentType.VACCINATION,
      AppointmentType.DIALYSIS,
      AppointmentType.ANTENATAL
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'appointment type is required',
      },
    },
  })
  type: AppointmentType;

  @Column({
    type: DataType.ENUM(
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NO_SHOW,
      AppointmentStatus.RESCHEDULED
    ),
    allowNull: false,
    defaultValue: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'department is required',
      },
    },
  })
  department: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'professional is required',
      },
    },
  })
  professional: string;

  @Column({
    type: DataType.STRING,
  })
  priority: string;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.STRING,
  })
  reason_for_visit: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'scheduler is required',
      },
    },
  })
  scheduled_by: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
  })
  visit_id: number;

  @Column({
    type: DataType.DATE,
  })
  cancelled_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  cancelled_by: number;

  @Column({
    type: DataType.TEXT,
  })
  cancellation_reason: string;

  @Column({
    type: DataType.DATE,
  })
  rescheduled_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  rescheduled_by: number;

  @Column({
    type: DataType.TEXT,
  })
  rescheduling_reason: string;

  @Column({
    type: DataType.DATE,
  })
  confirmed_at: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  confirmed_by: number;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Staff)
  doctor: Staff;

  @BelongsTo(() => Staff, 'scheduled_by')
  scheduler: Staff;

  @BelongsTo(() => Staff, 'cancelled_by')
  canceller: Staff;

  @BelongsTo(() => Staff, 'rescheduled_by')
  rescheduler: Staff;

  @BelongsTo(() => Staff, 'confirmed_by')
  confirmer: Staff;

  @BelongsTo(() => Visit)
  visit: Visit;

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
