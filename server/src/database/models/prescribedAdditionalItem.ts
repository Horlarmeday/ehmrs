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
import { DrugType } from './pharmacyStore';
import { Staff } from './staff';
import { Visit } from './visit';
import { Patient } from './patient';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { PrescribedDrug } from './prescribedDrug';
import { Unit } from './unit';
import { Inventory } from './inventory';
import { DrugPrescription } from './drugPrescription';
import { Antenatal } from './antenatal';
import { SurgeryRequest } from './surgeryRequest';

export enum DispenseStatus {
  DISPENSED = 'Dispensed',
  PENDING = 'Pending',
  RETURNED = 'Returned',
  PARTIAL_DISPENSED = 'Partial Dispense',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  CLEARED = 'Cleared',
  PERMITTED = 'Permitted',
}

export enum BillingStatus {
  BILLED = 'Billed',
  UNBILLED = 'Unbilled',
}

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
}

@Table({ timestamps: true, tableName: 'Additional_item_prescriptions' })
export class PrescribedAdditionalItem extends Model {
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
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity prescribed is required',
      },
    },
  })
  quantity_prescribed: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'quantity to dispense is required',
      },
    },
  })
  quantity_to_dispense: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_returned: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_dispensed: number;

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
    type: DataType.ENUM(
      DispenseStatus.DISPENSED,
      DispenseStatus.PENDING,
      DispenseStatus.RETURNED,
      DispenseStatus.PARTIAL_DISPENSED
    ),
    allowNull: false,
    defaultValue: DispenseStatus.PENDING,
  })
  dispense_status: DispenseStatus;

  @Column({
    type: DataType.ENUM(
      PaymentStatus.CLEARED,
      PaymentStatus.PAID,
      PaymentStatus.PENDING,
      PaymentStatus.PERMITTED
    ),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  payment_status: DispenseStatus;

  @Column({
    type: DataType.ENUM(BillingStatus.BILLED, BillingStatus.UNBILLED),
    allowNull: false,
    defaultValue: BillingStatus.UNBILLED,
  })
  billing_status: BillingStatus;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'examiner is required',
      },
    },
  })
  examiner: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date prescribed is required',
      },
    },
  })
  date_prescribed: Date;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit id is required',
      },
    },
  })
  visit_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'patient id is required',
      },
    },
  })
  patient_id: number;

  @ForeignKey(() => PrescribedDrug)
  @Column({
    type: DataType.INTEGER,
  })
  prescribed_drug_id: number;

  @Column({
    type: DataType.DATE,
  })
  start_date: Date;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'unit id is required',
      },
    },
  })
  unit_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  dispensed_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  returned_by: number;

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

  @ForeignKey(() => DrugPrescription)
  @Column({
    type: DataType.INTEGER,
  })
  drug_prescription_id: number;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @ForeignKey(() => SurgeryRequest)
  @Column({
    type: DataType.INTEGER,
  })
  surgery_id: number;

  @Column({
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION, Source.THEATER),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @BelongsTo(() => Staff)
  requester: Staff;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => PrescribedDrug)
  prescription: PrescribedDrug;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

  @BelongsTo(() => DrugPrescription)
  drugPrescription: DrugPrescription;

  @BelongsTo(() => SurgeryRequest)
  surgeryRequest: SurgeryRequest;

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
