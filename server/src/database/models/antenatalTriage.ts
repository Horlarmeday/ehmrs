import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Patient } from './patient';
import { Antenatal } from './antenatal';
import { Visit } from './visit';

@Table({ timestamps: true, tableName: 'Antenatal_Triages' })
export class AntenatalTriage extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'antenatal id is required',
      },
    },
  })
  ante_natal_id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
  })
  visit_id: number;

  @Column({
    type: DataType.INTEGER,
  })
  weight: number;

  @Column({
    type: DataType.INTEGER,
  })
  height: number;

  @Column({
    type: DataType.STRING,
  })
  body_mass_index: string;

  @Column({
    type: DataType.STRING,
  })
  urinalysis_protein: string;

  @Column({
    type: DataType.STRING,
  })
  urinalysis_glucose: string;

  @Column({
    type: DataType.STRING,
  })
  pallor: string;

  @Column({
    type: DataType.STRING,
  })
  blood_pressure: string;

  @Column({
    type: DataType.STRING,
  })
  maturity: string;

  @Column({
    type: DataType.STRING,
  })
  oedema: string;

  @Column({
    type: DataType.STRING,
  })
  presentation: string;

  @Column({
    type: DataType.STRING,
  })
  foetal_heart_rate: string;

  @Column({
    type: DataType.STRING,
  })
  fundal_height: string;

  @Column({
    type: DataType.STRING,
  })
  rvst: string;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.STRING,
  })
  next_appointment_date: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

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
