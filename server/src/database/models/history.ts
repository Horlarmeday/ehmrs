import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Visit } from './visit';
import { Patient } from './patient';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { PatientInsurance } from './patientInsurance';

@Table({ timestamps: true })
export class History extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.TEXT,
  })
  complaint_note: string;

  @Column({
    type: DataType.TEXT,
  })
  history_note: string;

  @Column({
    type: DataType.TEXT,
  })
  examination_note: string;

  @Column({
    type: DataType.TEXT,
  })
  chest: string;

  @Column({
    type: DataType.TEXT,
  })
  cvs: string;

  @Column({
    type: DataType.TEXT,
  })
  other_examination: string;

  @Column({
    type: DataType.TEXT,
  })
  mss: string;

  @Column({
    type: DataType.TEXT,
  })
  abdomen: string;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  visit_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patient_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @ForeignKey(() => PatientInsurance)
  @Column({
    type: DataType.INTEGER,
  })
  patient_insurance_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => PatientInsurance)
  patientInsurance: PatientInsurance;

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
