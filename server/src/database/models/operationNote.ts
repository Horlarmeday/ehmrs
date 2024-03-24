import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
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
import { Visit } from './visit';

@Table({ timestamps: true, tableName: 'Operation_Notes' })
export class OperationNote extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  anaesthetist_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  scrub_nurse_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'surgeon is required',
      },
    },
  })
  surgeon_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'patient_id is required',
      },
    },
  })
  patient_id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit_id is required',
      },
    },
  })
  visit_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'time_in is required',
      },
    },
  })
  time_in: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'time_out is required',
      },
    },
  })
  time_out: Date;

  @Column({
    type: DataType.JSON,
  })
  assistance: string;

  @Column({
    type: DataType.TEXT,
  })
  surgery: string;

  @Column({
    type: DataType.TEXT,
  })
  post_operation_order: string;

  @Column({
    type: DataType.TEXT,
  })
  anaesthesia: string;

  @Column({
    type: DataType.TEXT,
  })
  findings: string;

  @Column({
    type: DataType.TEXT,
  })
  procedure: string;

  @Column({
    type: DataType.TEXT,
  })
  indications: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Staff)
  anaesthetist: Staff;

  @BelongsTo(() => Staff)
  scrub_nurse: Staff;

  @BelongsTo(() => Staff)
  surgeon: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Visit)
  visit: Visit;

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
