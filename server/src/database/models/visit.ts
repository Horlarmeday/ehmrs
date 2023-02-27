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
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum VisitType {
  IPD = 'IPD',
  OPD = 'OPD',
  EMERGENCY = 'Emergency',
  ANC = 'ANC',
}

@Table({ timestamps: true })
export class Visit extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patient_id: number;

  @Column({
    type: DataType.DATE,
  })
  date_visit_ended: Date;

  @Column({
    type: DataType.ENUM(VisitType.IPD, VisitType.OPD, VisitType.EMERGENCY, VisitType.ANC),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit type is required',
      },
    },
  })
  type: VisitType;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @BelongsTo(() => Staff)
  staff: Staff;

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
