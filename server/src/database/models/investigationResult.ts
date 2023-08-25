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
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { Staff } from './staff';
import { PrescribedInvestigation } from './prescribedInvestigation';
import { InvestigationPrescription } from './investigationPrescription';
import { ResultStatus } from './testResult';

@Table({ timestamps: true, tableName: 'Investigation_Results' })
export class InvestigationResult extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => PrescribedInvestigation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'prescribed investigation id is required',
      },
    },
  })
  prescribed_investigation_id: number;

  @Column({
    type: DataType.TEXT,
  })
  result: string;

  @ForeignKey(() => InvestigationPrescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'investigation prescription id is required',
      },
    },
  })
  investigation_prescription_id: number;

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

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date requested is required',
      },
    },
  })
  date_created: Date;

  @Column({
    type: DataType.TEXT,
  })
  comments: string;

  @Column({
    type: DataType.TEXT,
  })
  image: string;

  @Column({
    type: DataType.ENUM(ResultStatus.REJECTED, ResultStatus.ACCEPTED, ResultStatus.PENDING),
    defaultValue: ResultStatus.PENDING,
  })
  status: ResultStatus;

  @BelongsTo(() => InvestigationPrescription)
  prescription: InvestigationPrescription;

  @BelongsTo(() => PrescribedInvestigation)
  investigation: PrescribedInvestigation;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Staff)
  staff: Staff;

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
