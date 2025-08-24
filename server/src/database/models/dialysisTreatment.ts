import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DialysisVisit } from './dialysisVisit';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Visit } from './visit';

export enum TreatmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INTERRUPTED = 'INTERRUPTED',
  PAUSED = 'PAUSED',
}

@Table({ timestamps: true, tableName: 'Dialysis_Treatments' })
export class DialysisTreatment extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => DialysisVisit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dialysis visit is required',
      },
    },
  })
  dialysis_visit_id: number;

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
  visit_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'nurse is required',
      },
    },
  })
  nurse_id: number;

  @Column({
    type: DataType.ENUM(
      TreatmentStatus.NOT_STARTED,
      TreatmentStatus.IN_PROGRESS,
      TreatmentStatus.COMPLETED,
      TreatmentStatus.INTERRUPTED,
      TreatmentStatus.PAUSED
    ),
    defaultValue: TreatmentStatus.NOT_STARTED,
  })
  status: TreatmentStatus;

  // Treatment session management fields (CLIENT USES THESE)
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
    validate: {
      min: {
        args: [0],
        msg: 'Current duration cannot be negative',
      },
    },
  })
  current_duration: number; // Current duration in minutes

  // Basic hemodialysis parameters (CLIENT USES THESE)
  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'Blood flow rate cannot be negative',
      },
    },
  })
  blood_flow_rate: number; // ml/min

  // Treatment metadata
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  treatment_date: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: 'ACTIVE',
  })
  treatment_status_detail: string;

  // Relationships
  @BelongsTo(() => DialysisVisit)
  dialysis_visit: DialysisVisit;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff)
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
