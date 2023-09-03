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
import { TestResult } from './testResult';

export enum Source {
  ANC = 'ANC',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
}

export enum DrugStatus {
  PENDING = 'Pending',
  COMPLETE_DISPENSE = 'Complete Dispense',
  PARTIAL_DISPENSED = 'Partial Dispense',
}

@Table({ timestamps: true, tableName: 'Drug_Prescriptions' })
export class DrugPrescription extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.ENUM(Source.ANC, Source.CONSULTATION, Source.THEATER),
    defaultValue: Source.CONSULTATION,
  })
  source: Source;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  requester: number;

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
        msg: 'date requested is required',
      },
    },
  })
  date_prescribed: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_billed: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_paid: boolean;

  @Column({
    type: DataType.ENUM(
      DrugStatus.PENDING,
      DrugStatus.COMPLETE_DISPENSE,
      DrugStatus.PARTIAL_DISPENSED
    ),
    allowNull: false,
    defaultValue: DrugStatus.PENDING,
  })
  status: DrugStatus;

  @BelongsTo(() => Staff, {
    foreignKey: 'requester',
  })
  examiner: Staff;

  @HasMany(() => PrescribedDrug)
  drugs: PrescribedDrug[];

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

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
