import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({ timestamps: true, tableName: 'Payment' })
export class Payment extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
  })
  bank: string;

  @Column({
    type: DataType.STRING,
  })
  transid: string;

  @Column({
    type: DataType.DATE,
  })
  tdate: Date;

  @Column({
    type: DataType.DOUBLE,
  })
  amount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  editedby: number;

  @Column({
    type: DataType.DATE,
  })
  vdate: Date;

  @Column({
    type: DataType.STRING,
  })
  narration: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  confirm: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  service_id: number;

  @Column({
    type: DataType.STRING,
  })
  service_name: string;

  @Column({
    type: DataType.INTEGER,
  })
  jid: string;

  @Column({
    type: DataType.STRING,
  })
  batch_no: string;

  @Column({
    type: DataType.STRING,
  })
  confirmed_by: string;

  @Column({
    type: DataType.STRING,
  })
  confirmed_id: string;

  @Column({
    type: DataType.DATE,
  })
  confirmed_date: Date;

  @Column({
    type: DataType.STRING,
  })
  payment_type: string;

  @Column({
    type: DataType.INTEGER,
  })
  uid: number;

  @Column({
    type: DataType.INTEGER,
  })
  payment_id: number;

  @Column({
    type: DataType.STRING,
  })
  confirm_note: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  isconfirm: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  jid2: number;

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
