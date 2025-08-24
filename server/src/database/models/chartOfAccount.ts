import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { AccountType } from '../../modules/Account/enums';
import { paginate, calcLimitAndOffset } from '../../core/helpers/helper';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';

@Table({ timestamps: true, tableName: 'Chart_of_Account' })
export class ChartOfAccount extends Model {
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
    type: DataType.ENUM(...Object.values(AccountType)),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'type is required',
      },
    },
  })
  type: string;

  @Column({ type: DataType.TEXT })
  description: string;

  @ForeignKey(() => ChartOfAccount)
  @Column({
    type: DataType.INTEGER,
  })
  parent_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  balance: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Tax code cannot exceed 20 characters',
      },
    },
  })
  tax_code: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    defaultValue: 0,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Budget allocation cannot be negative',
      },
    },
  })
  budget_allocation: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  allow_manual_entries: boolean;

  @BelongsTo(() => ChartOfAccount, { foreignKey: 'parent_id' })
  parent: ChartOfAccount;

  @HasMany(() => ChartOfAccount, { foreignKey: 'parent_id', as: 'children' })
  children: ChartOfAccount[];

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
