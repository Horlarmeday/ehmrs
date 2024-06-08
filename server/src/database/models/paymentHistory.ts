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

export enum ServiceName {
  DRUGS = 'DRUGS',
  TESTS = 'TESTS',
  INVESTIGATIONS = 'INVESTIGATIONS',
  SERVICES = 'SERVICES',
  ITEMS = 'ITEMS',
}

@Table({ timestamps: true, tableName: 'Payment_Histories' })
export class PaymentHistory extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.TEXT,
  })
  narration: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  transaction_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  transaction_date: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  service_id: number;

  @Column({
    type: DataType.ENUM(
      ServiceName.SERVICES,
      ServiceName.TESTS,
      ServiceName.INVESTIGATIONS,
      ServiceName.DRUGS,
      ServiceName.ITEMS
    ),
    allowNull: false,
  })
  service_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mode_of_payment: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'staff id is required',
      },
    },
  })
  staff_id: number;

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

  @BelongsTo(() => Staff)
  staff: Staff;

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
