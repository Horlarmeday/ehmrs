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
import { Drug, DrugForm } from './drug';
import { Measurement } from './measurement';
import { DosageForm } from './dosageForm';
import { RoutesOfAdministration } from './routesOfAdministration';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { PharmacyStore } from './pharmacyStore';

export enum DrugType {
  CASH = 'Cash',
  NHIS = 'NHIS',
}

export enum LogType {
  UPDATE = 'Update',
  REORDER = 'Reorder',
}

@Table({ timestamps: true, tableName: 'Pharmacy_Store_Item_Logs' })
export class PharmacyStoreLog extends Model {
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
    type: DataType.STRING,
  })
  product_code: string;

  @Column({
    type: DataType.STRING,
  })
  shelf: string;

  @Column({
    type: DataType.STRING,
  })
  voucher: string;

  @Column({
    type: DataType.STRING,
  })
  batch: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity is required',
      },
    },
  })
  quantity_received: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_remaining: number;

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
        msg: 'unit price is required',
      },
    },
  })
  unit_price: number;

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
        msg: 'total price is required',
      },
    },
  })
  total_price: number;

  @Column({
    type: DataType.DATE,
  })
  expiration: Date;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
  })
  date_received: Date;

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

  @Column({ type: DataType.ENUM(Status.ACTIVE, Status.INACTIVE), defaultValue: Status.ACTIVE })
  status: Status;

  @ForeignKey(() => RoutesOfAdministration)
  @Column({
    type: DataType.INTEGER,
  })
  route_id: number;

  @Column({
    type: DataType.STRING,
  })
  strength_input: string;

  @ForeignKey(() => Measurement)
  @Column({
    type: DataType.INTEGER,
  })
  measurement_id: number;

  @ForeignKey(() => DosageForm)
  @Column({
    type: DataType.INTEGER,
  })
  dosage_form_id: number;

  @Column({
    type: DataType.ENUM(LogType.UPDATE, LogType.REORDER),
    allowNull: false,
    defaultValue: LogType.REORDER,
    validate: {
      notEmpty: {
        msg: 'log type is required',
      },
    },
  })
  log_type: LogType;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => PharmacyStore)
  store: PharmacyStore;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;

  @BelongsTo(() => Measurement)
  strength: Measurement;

  @BelongsTo(() => RoutesOfAdministration)
  route: RoutesOfAdministration;

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
