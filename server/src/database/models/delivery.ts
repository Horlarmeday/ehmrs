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

@Table({ timestamps: true, tableName: 'Deliveries' })
export class Delivery extends Model {
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
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'antenatal id is required',
      },
    },
  })
  visit_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'mother condition is required',
      },
    },
  })
  condition_of_mother: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'baby condition is required',
      },
    },
  })
  condition_of_baby: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'mode of delivery is required',
      },
    },
  })
  mode_of_delivery: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date of delivery is required',
      },
    },
  })
  date_of_delivery: Date;

  @Column({
    type: DataType.DATE,
  })
  time_surgery_ended: Date;

  @Column({
    type: DataType.STRING,
  })
  blood_loss_quantity: string;

  @Column({
    type: DataType.STRING,
  })
  apgar_one_min: string;

  @Column({
    type: DataType.STRING,
  })
  apgar_five_min: string;

  @Column({
    type: DataType.STRING,
  })
  apgar_ten_min: string;

  @Column({
    type: DataType.STRING,
  })
  birth_weight: string;

  @Column({
    type: DataType.STRING,
  })
  sex: string;

  @Column({
    type: DataType.STRING,
  })
  vitaminA_IU: string;

  @Column({
    type: DataType.STRING,
  })
  nature_of_liquor: string;

  @Column({
    type: DataType.STRING,
  })
  nevirapine: string;

  @Column({
    type: DataType.STRING,
  })
  bcg: string;

  @Column({
    type: DataType.STRING,
  })
  opvo: string;

  @Column({
    type: DataType.STRING,
  })
  duration: string;

  @Column({
    type: DataType.STRING,
  })
  hbv: string;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.DATE,
  })
  baby_immunization_date: Date;

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
