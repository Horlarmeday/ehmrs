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
import { FindAttributeOptions, GroupOption, Includeable } from 'sequelize/types/model';
import { Order, WhereOptions } from 'sequelize';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum DefaultType {
  ADMISSION_ITEMS = 'ADMISSION_ITEMS',
  INJECTION_ITEMS = 'INJECTION_ITEMS',
  OPERATION_ITEMS = 'OPERATION_ITEMS',
  ANC_ROUTINE_TESTS = 'ANC_ROUTINE_TESTS',
  ANC_ROUTINE_DRUGS = 'ANC_ROUTINE_DRUGS',
  WATER_INJECTIONS = 'WATER_INJECTIONS',
  CIRCUMCISION_ROUTINE_DRUGS = 'CIRCUMCISION_ROUTINE_DRUGS',
  HSG_ADDITIONAL_ITEMS = 'HSG_ADDITIONAL_ITEMS',
}

@Table({ timestamps: true })
export class Default extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.ENUM(
      DefaultType.ANC_ROUTINE_TESTS,
      DefaultType.ANC_ROUTINE_DRUGS,
      DefaultType.ADMISSION_ITEMS,
      DefaultType.INJECTION_ITEMS,
      DefaultType.OPERATION_ITEMS,
      DefaultType.WATER_INJECTIONS,
      DefaultType.CIRCUMCISION_ROUTINE_DRUGS,
      DefaultType.HSG_ADDITIONAL_ITEMS
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'type is required',
      },
    },
  })
  type: DefaultType;

  @Column({
    type: DataType.JSON,
  })
  data: Array<any>;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

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
