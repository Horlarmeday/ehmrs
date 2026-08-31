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
import { PharmacyStore } from './pharmacyStore';
import { Inventory } from './inventory';
import { Vendor } from './vendor';
import { HistoryType } from '../enums';

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
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  selling_price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  unit_price: number;

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

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  vendor_id: number;

  /**
   * The batch id Accounting minted for THIS delivery, applied from `stock.received` (ADR-0041).
   *
   * It lives on the history row rather than the store row because the store row is a per-drug bin
   * reused across restocks: `reorderPharmacyItems` overwrites it in place, so an id held there
   * would name only the most recent delivery. A SUPPLIED history row is one delivery, which is the
   * grain a batch identity needs.
   *
   * Null for deliveries Accounting never saw (pre-cutover, donations, samples) — permanently, and
   * per ADR-0041 that null positively asserts the stock did not come through procurement rather
   * than recording a failed match. Non-unique: `stock.received` is additive, so a redelivery
   * re-writes the same value and must not raise.
   */
  @Column({
    type: DataType.STRING(36),
    allowNull: true,
  })
  external_batch_id: string | null;

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

  @BelongsTo(() => Vendor)
  vendor: Vendor;

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
