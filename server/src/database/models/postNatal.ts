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

@Table({ timestamps: true })
export class PostNatal extends Model {
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
  temperature: string;

  @Column({
    type: DataType.STRING,
  })
  pulse: string;

  @Column({
    type: DataType.STRING,
  })
  respiration: string;

  @Column({
    type: DataType.STRING,
  })
  general_condition: string;

  @Column({
    type: DataType.STRING,
  })
  blood_pressure: string;

  @Column({
    type: DataType.STRING,
  })
  involution_of_uterus: string;

  @Column({
    type: DataType.STRING,
  })
  lochia: string;

  @Column({
    type: DataType.STRING,
  })
  episotomy: string;

  @Column({
    type: DataType.DATE,
  })
  pap_smear_date: Date;

  @Column({
    type: DataType.TEXT,
  })
  result: string;

  @Column({
    type: DataType.STRING,
  })
  pcv: string;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.STRING,
  })
  baby_condition: string;

  @Column({
    type: DataType.STRING,
  })
  reflexes: string;

  @Column({
    type: DataType.STRING,
  })
  feeding: string;

  @Column({
    type: DataType.STRING,
  })
  umbilical_cord: string;

  @Column({
    type: DataType.TEXT,
  })
  pelvic_examination: string;

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
