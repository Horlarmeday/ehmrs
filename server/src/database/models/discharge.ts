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
import { Visit } from './visit';
import { Admission } from './admission';

export enum DischargeType {
  ABSCONDED = 'Absconded',
  DISCHARGE = 'Discharge',
  REFER = 'Refer',
  DEATH = 'Death',
  LAMA = 'Lama',
  TRANSFER = 'Transfer',
}
@Table({ timestamps: true, tableName: 'Discharges' })
export class Discharge extends Model {
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

  @ForeignKey(() => Admission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'admission id is required',
      },
    },
  })
  admission_id: number;

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
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'staff id is required',
      },
    },
  })
  discharged_by: number;

  @Column({
    type: DataType.ENUM(
      DischargeType.DISCHARGE,
      DischargeType.DEATH,
      DischargeType.LAMA,
      DischargeType.REFER,
      DischargeType.ABSCONDED,
      DischargeType.TRANSFER
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'discharge type is required',
      },
    },
  })
  discharge_type: DischargeType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date of discharge is required',
      },
    },
  })
  date_discharged: Date;

  @Column({
    type: DataType.TEXT,
  })
  conditions_of_patient: string;

  @Column({
    type: DataType.STRING,
  })
  transfer_location: string;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Admission)
  admission: Admission;

  @BelongsTo(() => Ward)
  ward: Ward;

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
