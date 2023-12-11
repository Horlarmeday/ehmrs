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
import { Ward } from './ward';
import { Bed } from './bed';
import { Visit } from './visit';
import { Antenatal } from './antenatal';

export enum DischargeStatus {
  DISCHARGED = 'Discharged',
  ON_ADMISSION = 'On Admission',
}

@Table({ timestamps: true })
export class Admission extends Model {
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

  @ForeignKey(() => Ward)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'ward id is required',
      },
    },
  })
  ward_id: number;

  @ForeignKey(() => Bed)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bed id is required',
      },
    },
  })
  bed_id: number;

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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  admitted_by: number;

  @Column({
    type: DataType.ENUM(DischargeStatus.DISCHARGED, DischargeStatus.ON_ADMISSION),
    defaultValue: DischargeStatus.ON_ADMISSION,
  })
  discharge_status: DischargeStatus;

  @Column({
    type: DataType.INTEGER,
  })
  previous_ward: number;

  @Column({
    type: DataType.STRING,
  })
  comment: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  should_discharge: boolean;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  discharge_recommended_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  discharged_by: number;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date_admitted: Date;

  @BelongsTo(() => Staff, 'admitted_by')
  examiner: Staff;

  @BelongsTo(() => Staff, 'discharge_recommended_by')
  discharge_recommender: Staff;

  @BelongsTo(() => Staff, 'discharged_by')
  released_by: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Bed)
  bed: Bed;

  @BelongsTo(() => Ward)
  ward: Ward;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

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
