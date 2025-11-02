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

export enum ReportDomain {
  MEDICAL_RECORDS = 'medical-records',
  PHARMACY = 'pharmacy',
  LABORATORY = 'laboratory',
  ACCOUNTING = 'accounting',
}

@Table({ timestamps: true })
export class Report extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'title is required',
      },
    },
  })
  title: string;

  @Column({
    type: DataType.ENUM(
      ReportDomain.MEDICAL_RECORDS,
      ReportDomain.PHARMACY,
      ReportDomain.LABORATORY,
      ReportDomain.ACCOUNTING
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'domain is required',
      },
    },
  })
  domain: ReportDomain;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'report type is required',
      },
    },
  })
  report_type: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  date_range_start: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  date_range_end: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  filters: Record<string, unknown>;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  created_by: number;

  @BelongsTo(() => Staff)
  creator: Staff;

  static async paginate(param: {
    paginate: number;
    attributes?: FindAttributeOptions;
    where?: WhereOptions<Report>;
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
