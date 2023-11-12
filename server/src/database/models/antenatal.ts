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
import { Patient } from './patient';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
  INACTIVE = 'INACTIVE',
}

@Table({ timestamps: true, tableName: 'Antenatal_Accounts' })
export class Antenatal extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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
    type: DataType.STRING,
  })
  antenatal_number: string;

  @Column({
    type: DataType.STRING,
  })
  parity: string;

  @Column({
    type: DataType.STRING,
  })
  gravida: string;

  @Column({
    type: DataType.DATE,
  })
  last_menses_period: Date;

  @Column({
    type: DataType.DATE,
  })
  estimated_delivery_date: Date;

  @Column({
    type: DataType.DATE,
  })
  estimated_concept_time: Date;

  @Column({
    type: DataType.STRING,
  })
  fetal_age: string;

  @Column({
    type: DataType.TEXT,
  })
  medical_history: string;

  @Column({
    type: DataType.JSON,
  })
  family_history: string;

  @Column({
    type: DataType.TEXT,
  })
  blood_transfusion_history: string;

  @Column({
    type: DataType.TEXT,
  })
  surgical_history: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
  })
  start_date: Date;

  @Column({
    type: DataType.DATE,
  })
  end_date: Date;

  @Column({
    type: DataType.ENUM(
      AccountStatus.ACTIVE,
      AccountStatus.INACTIVE,
      AccountStatus.COMPLETED,
      AccountStatus.DISCONTINUED
    ),
    defaultValue: AccountStatus.INACTIVE,
  })
  account_status: AccountStatus;

  @Column({
    type: DataType.STRING,
  })
  for_whom: string;

  @BelongsTo(() => Staff)
  staff: Staff;

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
