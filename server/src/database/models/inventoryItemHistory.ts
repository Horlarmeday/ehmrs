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
import { Inventory } from './inventory';
import { InventoryItem } from './inventoryItem';
import { Patient } from './patient';
import { PrescribedDrug } from './prescribedDrug';
import { PrescribedAdditionalItem } from './prescribedAdditionalItem';
import { Visit } from './visit';

export enum HistoryType {
  DISPENSED = 'Dispensed',
  RETURNED = 'Returned',
  SUPPLIED = 'Supplied',
}

@Table({ timestamps: true, tableName: 'Inventory_Item_Histories' })
export class InventoryItemHistory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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
    },
  })
  quantity_remaining: number;

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

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
  })
  patient_id: number;

  @ForeignKey(() => PrescribedDrug)
  @Column({
    type: DataType.INTEGER,
  })
  drug_prescription_id: number;

  @ForeignKey(() => PrescribedAdditionalItem)
  @Column({
    type: DataType.INTEGER,
  })
  additional_item_id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
  })
  visit_id: number;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Staff, 'dispensed_by')
  dispenser: Staff;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => InventoryItem)
  inventory_item: InventoryItem;

  @BelongsTo(() => Visit)
  visit: Visit;

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
