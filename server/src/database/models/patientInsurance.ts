import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Insurance } from './insurance';
import { HMO } from './hmo';
import { Patient } from './patient';

@Table({ timestamps: true, tableName: 'Patient_Insurances' })
export class PatientInsurance extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'insurance is required',
      },
    },
  })
  patient_id: number;

  @ForeignKey(() => Insurance)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'insurance is required',
      },
    },
  })
  insurance_id: number;

  @ForeignKey(() => HMO)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'hmo is required',
      },
    },
  })
  hmo_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_default: boolean;

  @Column({
    type: DataType.STRING,
  })
  plan?: string;

  @Column({
    type: DataType.STRING,
  })
  organization?: string;

  @Column({
    type: DataType.STRING,
  })
  enrollee_code: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id!: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Insurance)
  insurance: Insurance;

  @BelongsTo(() => HMO)
  hmo: HMO;

  @BelongsTo(() => Patient)
  patient: Patient;

  static async paginate(param: {
    paginate: number;
    attributes?: FindAttributeOptions;
    where?: WhereOptions;
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
