import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Unit } from './unit';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true, tableName: 'Lab_Items' })
export class LabItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  product_code: string;

  @Column({
    type: DataType.STRING,
  })
  shelf: string;

  @Column({
    type: DataType.STRING,
  })
  voucher: string;

  @Column({
    type: DataType.STRING,
  })
  batch: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity is required',
      },
    },
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  remain_quantity: number;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'unit is required',
      },
    },
  })
  unit_id: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'unit price is required',
      },
    },
  })
  unit_price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'total price is required',
      },
    },
  })
  total_price: number;

  @Column({
    type: DataType.DATE,
  })
  expiration: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
  })
  date_received: Date;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Staff)
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
