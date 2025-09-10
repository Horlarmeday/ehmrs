import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Department } from './department';

@Table({ timestamps: true, tableName: 'Cost_Centers' })
export class CostCenter extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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
    type: DataType.TEXT,
  })
  description: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'department id is required',
      },
    },
  })
  department_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Service line (e.g., Cardiology, Orthopedics)',
  })
  service_line: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Location (e.g., Main Building, North Wing)',
  })
  location: string;

  @Column({
    type: DataType.ENUM('CLINICAL', 'ADMINISTRATIVE', 'SUPPORT'),
    allowNull: false,
    defaultValue: 'CLINICAL',
    comment: 'Type of cost center',
  })
  cost_center_type: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Annual budget amount',
  })
  budget: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @BelongsTo(() => Department)
  department: Department;

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
