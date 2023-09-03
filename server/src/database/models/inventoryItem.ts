import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Drug, DrugForm } from './drug';
import { Unit } from './unit';
import { DosageForm } from './dosageForm';
import { Measurement } from './measurement';
import { Staff } from './staff';
import { DrugType } from './pharmacyStore';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Inventory } from './inventory';

@Table({ timestamps: true, tableName: 'inventory_items' })
export class InventoryItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'inventory id is required',
      },
    },
  })
  inventory_id: number;

  @ForeignKey(() => Drug)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug id is required',
      },
    },
  })
  drug_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity received is required',
      },
    },
  })
  quantity_received: number;

  // @Column({
  //   type: DataType.STRING,
  // })
  // brand: string;

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

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'selling price is required',
      },
    },
  })
  selling_price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'price is required',
      },
    },
  })
  acquired_price: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date expiry is required',
      },
    },
  })
  expiration: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_consumed?: number;

  @ForeignKey(() => DosageForm)
  @Column({
    type: DataType.INTEGER,
  })
  dosage_form_id: number;

  @ForeignKey(() => Measurement)
  @Column({
    type: DataType.INTEGER,
  })
  measurement_id: number;

  @Column({
    type: DataType.STRING,
  })
  strength_input: string;

  @Column({
    type: DataType.INTEGER,
  })
  quantity_remaining: number;

  @Column({
    type: DataType.ENUM(DrugForm.DRUG, DrugForm.CONSUMABLE),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug form is required',
      },
    },
  })
  drug_form: DrugForm;

  @Column({
    type: DataType.ENUM(DrugType.CASH, DrugType.NHIS),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug type is required',
      },
    },
  })
  drug_type: DrugType;

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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;

  @BelongsTo(() => Measurement)
  strength: Measurement;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

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
