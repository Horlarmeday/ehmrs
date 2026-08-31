import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Unit } from './unit';
import { Staff } from './staff';
import { Drug } from './drug';
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
import { Vendor } from './vendor';
import { Status, PharmacyDrugType, DrugForm } from '../enums';

@DefaultScope(() => ({
  where: {
    status: Status.ACTIVE,
  },
}))
@Table({ timestamps: true, tableName: 'Pharmacy_Store_Items' })
export class PharmacyStore extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Drug)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug is required',
      },
    },
  })
  drug_id: number;

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
    validate: {
      min: { args: [0], msg: 'The minimum quantity_remaining cannot be less than zero' },
    },
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

  /**
   * The patient-facing price. NULLABLE since #304/ADR-0041: a row created from `stock.received`
   * is born unpriced when the receipt carried no price, rather than priced at a fabricated number.
   * An unpriced row is not dispensable — `dispenseValidations` refuses it.
   *
   * Contrast `unit_price`, which stays NOT NULL: acquisition cost is Accounting's and is always
   * known at receipt. Only the patient-facing price can legitimately be pending.
   */
  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
  })
  selling_price: number | null;

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
    type: DataType.ENUM(
      PharmacyDrugType.CASH,
      PharmacyDrugType.NHIS,
      PharmacyDrugType.PRIVATE,
      PharmacyDrugType.RETAINERSHIP
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug type is required',
      },
    },
  })
  drug_type: PharmacyDrugType;

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
    type: DataType.INTEGER,
  })
  old_id: number;

  @Column({
    type: DataType.STRING,
  })
  brand: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  vendor_id: number;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;

  @BelongsTo(() => Measurement)
  strength: Measurement;

  @BelongsTo(() => RoutesOfAdministration)
  route: RoutesOfAdministration;

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
