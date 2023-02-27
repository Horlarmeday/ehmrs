import { Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Ward } from './ward';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ tableName: 'beds' })
export class Bed extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bed type is required',
      },
    },
  })
  bed_type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'code is required',
      },
    },
  })
  code: string;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER })
  staff_id: string;

  @ForeignKey(() => Ward)
  @Column({ type: DataType.INTEGER })
  ward_id: string;

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
