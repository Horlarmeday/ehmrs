import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Visit } from './visit';
import { Patient } from './patient';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true })
export class Triage extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit id is required',
      },
    },
  })
  visit_id: number;

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
    type: DataType.FLOAT,
  })
  weight: number;

  @Column({
    type: DataType.FLOAT,
  })
  height: number;

  @Column({
    type: DataType.FLOAT,
  })
  bmi: number;

  @Column({
    type: DataType.STRING,
  })
  rvs: string;

  @Column({
    type: DataType.FLOAT,
  })
  pulse: number;

  @Column({
    type: DataType.STRING,
  })
  respiration: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'temperature is required',
      },
    },
  })
  temperature: number;

  @Column({
    type: DataType.STRING,
  })
  systolic: string;

  @Column({
    type: DataType.STRING,
  })
  diastolic: string;

  @Column({
    type: DataType.STRING,
  })
  heart_rate: string;

  @Column({
    type: DataType.STRING,
  })
  fetal_heart_rate: string;

  @Column({
    type: DataType.STRING,
  })
  spo2: string;

  @Column({
    type: DataType.STRING,
  })
  muac: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

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
