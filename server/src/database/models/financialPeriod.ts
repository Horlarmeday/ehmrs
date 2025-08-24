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
import { FindAttributeOptions, GroupOption, Includeable, Order, WhereOptions } from 'sequelize';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

import { FinancialPeriodStatus } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'financial_periods' })
export class FinancialPeriod extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'period name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'start date is required',
      },
    },
  })
  start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'end date is required',
      },
    },
  })
  end_date: Date;

  @Column({
    type: DataType.ENUM(...Object.values(FinancialPeriodStatus)),
    allowNull: false,
    defaultValue: FinancialPeriodStatus.OPEN,
  })
  status: FinancialPeriodStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      msg: 'opening balance must be greater than or equal to 0',
    },
  })
  balance: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'created by staff id is required',
      },
    },
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  updated_by: number;

  // Relationships
  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

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
