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
import { InventoryItem } from './inventoryItem';

export enum Status {
  RETURNED = 'Returned',
  PENDING = 'Pending',
  DECLINED = 'Declined',
}

@Table({ timestamps: true, tableName: 'Return_Items' })
export class ReturnItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => InventoryItem)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'inventory item id is required',
      },
    },
  })
  inventory_item_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: false,
    validate: {
      notEmpty: {
        msg: 'quantity is required',
      },
    },
  })
  quantity: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date received is required',
      },
    },
  })
  date_received: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'reason for return is required',
      },
    },
  })
  reason_for_return: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.ENUM(Status.DECLINED, Status.PENDING, Status.RETURNED),
    defaultValue: Status.PENDING,
  })
  status: Status;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => InventoryItem)
  item: InventoryItem;

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
