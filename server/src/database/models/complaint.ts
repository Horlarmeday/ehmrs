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
import { Patient } from './patient';
import { Visit } from './visit';
import { FindAttributeOptions, GroupOption, Includeable } from 'sequelize/types/model';
import { Order, WhereOptions } from 'sequelize';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true })
export class Complaint extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'complaint is required',
      },
    },
  })
  complaint: string;

  @Column({
    type: DataType.ENUM('Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'frequency is required',
      },
    },
  })
  frequency: string;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: false,
    },
  })
  frequency_number: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
  })
  visit_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patient_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

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
