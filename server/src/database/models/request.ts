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
import { Inventory } from './inventory';
import { InventoryItem } from './inventoryItem';

export enum RequestStatus {
  PENDING = 'Pending',
  GRANTED = 'Granted',
  DECLINED = 'Declined',
}

@Table({ timestamps: true, tableName: 'Requests' })
export class Request extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'inventory is required',
      },
    },
  })
  inventory_id: number;

  @ForeignKey(() => InventoryItem)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'item is required',
      },
    },
  })
  item_id: string;

  @Column({
    type: DataType.ENUM(RequestStatus.PENDING, RequestStatus.DECLINED, RequestStatus.GRANTED),
    allowNull: false,
    defaultValue: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  requested_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  processed_by: number;

  @Column({
    type: DataType.DATE,
  })
  date_processed: Date;

  @BelongsTo(() => Staff, 'requested_by')
  requester: Staff;

  @BelongsTo(() => Staff, 'processed_by')
  processor: Staff;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

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
