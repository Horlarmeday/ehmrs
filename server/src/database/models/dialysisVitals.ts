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
import { Visit } from './visit';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({
  timestamps: true,
  tableName: 'Dialysis_Vitals',
  indexes: [
    {
      name: 'idx_dialysis_vitals_visit',
      fields: ['visit_id'],
    },
    {
      name: 'idx_dialysis_vitals_dialysis_visit',
      fields: ['dialysis_visit_id'],
    },
    {
      name: 'idx_dialysis_vitals_staff',
      fields: ['recorded_by'],
    },
    {
      name: 'idx_dialysis_vitals_time',
      fields: ['time'],
    },
  ],
})
export class DialysisVitals extends Model {
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
        msg: 'staff member is required',
      },
    },
  })
  recorded_by: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'time is required',
      },
    },
  })
  time: string;

  // Vital Signs
  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  blood_flow_rate: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  pulse: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [35],
        msg: 'Temperature must be at least 35°C',
      },
      max: {
        args: [42],
        msg: 'Temperature cannot exceed 42°C',
      },
    },
  })
  temperature: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [70],
        msg: 'Oxygen saturation must be at least 70%',
      },
      max: {
        args: [100],
        msg: 'Oxygen saturation cannot exceed 100%',
      },
    },
  })
  oxygen_saturation: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [20],
        msg: 'Weight must be at least 20 kg',
      },
      max: {
        args: [300],
        msg: 'Weight cannot exceed 300 kg',
      },
    },
  })
  weight: number;

  @Column({
    type: DataType.STRING,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Blood pressure format cannot exceed 20 characters',
      },
    },
  })
  blood_pressure: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'Ultrafiltration rate cannot be negative',
      },
      max: {
        args: [2000],
        msg: 'Ultrafiltration rate cannot exceed 2000 ml/hr',
      },
    },
  })
  ultrafiltration_rate: number;

  @Column({
    type: DataType.STRING,
    validate: {
      len: {
        args: [0, 20],
        msg: 'AP format cannot exceed 20 characters',
      },
    },
  })
  ap: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'Venous pressure cannot be negative',
      },
      max: {
        args: [300],
        msg: 'Venous pressure cannot exceed 300 mmHg',
      },
    },
  })
  venous_pressure: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'IVF cannot be negative',
      },
      max: {
        args: [1000],
        msg: 'IVF cannot exceed 1000 ml',
      },
    },
  })
  ivf: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'HEP/hr cannot be negative',
      },
      max: {
        args: [1000],
        msg: 'HEP/hr cannot exceed 1000 units',
      },
    },
  })
  hep_hr: number;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Remarks cannot exceed 500 characters',
      },
    },
  })
  remarks: string;

  // Vitals metadata
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  recorded_at: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: 'ACTIVE',
  })
  status: string;

  // Relationships
  @BelongsTo(() => DialysisVisit)
  dialysis_visit: DialysisVisit;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff, { foreignKey: 'recorded_by' })
  staff: Staff;

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
