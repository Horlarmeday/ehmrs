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
import { Drug } from './drug';
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
import { DosageForm } from './dosageForm';
import { RoutesOfAdministration } from './routesOfAdministration';
import { Measurement } from './measurement';
import { DrugPrescription } from './drugPrescription';
import { Inventory } from './inventory';
import { PrescribedAdditionalItem } from './prescribedAdditionalItem';
import { Antenatal } from './antenatal';
import { SurgeryRequest } from './surgeryRequest';
import { Immunization } from './immunization';
import { NHISApprovalStatus } from '../../core/helpers/general';

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

export enum DrugGroup {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
  IMMUNIZATION = 'Immunization',
}

@Table({ timestamps: true, tableName: 'Prescribed_Drugs' })
export class PrescribedDrug extends Model {
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

  @ForeignKey(() => DosageForm)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dosage form is required',
      },
    },
  })
  dosage_form_id: number;

  @Column({
    type: DataType.ENUM(DrugType.CASH, DrugType.NHIS, DrugType.PRIVATE),
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
        msg: 'quantity is required',
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
  quantity_dispensed: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  quantity_returned: number;

  @ForeignKey(() => RoutesOfAdministration)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'route is required',
      },
    },
  })
  route_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'frequency is required',
      },
    },
  })
  frequency: string;

  @ForeignKey(() => Measurement)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'strength is required',
      },
    },
  })
  strength_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'duration is required',
      },
    },
  })
  duration: number;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'prescribed strength is required',
      },
    },
  })
  prescribed_strength: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'duration unit is required',
      },
    },
  })
  duration_unit: string;

  @Column({
    type: DataType.ENUM(
      NHISApprovalStatus.APPROVED,
      NHISApprovalStatus.DECLINED,
      NHISApprovalStatus.PENDING
    ),
  })
  nhis_status: NHISApprovalStatus;

  @Column({
    type: DataType.ENUM(DrugGroup.PRIMARY, DrugGroup.SECONDARY),
  })
  drug_group: DrugGroup;

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

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'start date is required',
      },
    },
  })
  start_date: Date;

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

  @ForeignKey(() => DrugPrescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug prescription is required',
      },
    },
  })
  drug_prescription_id: number;

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
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION, Source.THEATER, Source.IMMUNIZATION),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @ForeignKey(() => Immunization)
  @Column({
    type: DataType.INTEGER,
  })
  immunization_id: number;

  @Column({
    type: DataType.STRING,
  })
  auth_code: string;

  @BelongsTo(() => Staff, 'examiner')
  requester: Staff;

  @BelongsTo(() => Staff, 'dispensed_by')
  dispenser: Staff;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;

  @BelongsTo(() => RoutesOfAdministration)
  route: RoutesOfAdministration;

  @BelongsTo(() => Measurement)
  strength: Measurement;

  @BelongsTo(() => DrugPrescription)
  prescription: DrugPrescription;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

  @BelongsTo(() => Immunization)
  immunization: Immunization;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

  @BelongsTo(() => SurgeryRequest)
  surgeryRequest: SurgeryRequest;

  @HasMany(() => PrescribedAdditionalItem, {
    foreignKey: 'prescribed_drug_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    hooks: true,
  })
  items: PrescribedAdditionalItem[];

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
