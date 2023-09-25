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
import { Staff, Status } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { DrugType, PharmacyStore } from './pharmacyStore';
import { Inventory } from './inventory';
import { HistoryType } from './inventoryItemHistory';

@Table({ timestamps: true, tableName: 'Pharmacy_Store_Histories' })
export class PharmacyStoreHistory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => PharmacyStore)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'store id is required',
      },
    },
  })
  pharmacy_store_id: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_dispensed: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_returned: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_supplied: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity remainder is required',
      },
      min: 0,
    },
  })
  quantity_remaining: number;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventory_id: number;

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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  item_receiver: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  dispensed_by: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date is required',
      },
    },
  })
  history_date: Date;

  @Column({
    type: DataType.ENUM(HistoryType.DISPENSED, HistoryType.RETURNED, HistoryType.SUPPLIED),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'history type is required',
      },
    },
  })
  history_type: HistoryType;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Staff, 'item_receiver')
  receiver: Staff;

  @BelongsTo(() => Staff, 'dispensed_by')
  dispenser: Staff;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

  @BelongsTo(() => PharmacyStore)
  store: PharmacyStore;

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
