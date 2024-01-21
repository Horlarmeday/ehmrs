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

export enum AcceptedDrugType {
  CASH = 'Cash Drug',
  NHIS = 'NHIS Drug',
  PRIVATE = 'Private Drug',
  BOTH = 'Both',
  ALL = 'All',
}

@Table({ timestamps: true })
export class Inventory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'inventory name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
  })
  refill_level: number;

  @Column({
    type: DataType.ENUM(
      AcceptedDrugType.CASH,
      AcceptedDrugType.BOTH,
      AcceptedDrugType.NHIS,
      AcceptedDrugType.ALL,
      AcceptedDrugType.PRIVATE
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'accepted drug type is required',
      },
    },
  })
  accepted_drug_type: AcceptedDrugType;

  @Column({
    type: DataType.TEXT,
  })
  desc: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @HasMany(() => InventoryItem)
  inventory_items: InventoryItem[];

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
