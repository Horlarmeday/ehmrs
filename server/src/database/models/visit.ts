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
import { Antenatal } from './antenatal';
import { Admission } from './admission';

export enum VisitCategory {
  IPD = 'Inpatient',
  OPD = 'Outpatient',
  EMERGENCY = 'Emergency',
  ANC = 'Antenatal',
}

export enum VisitStatus {
  ONGOING = 'Ongoing',
  ENDED = 'Ended',
}

@Table({ timestamps: true })
export class Visit extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patient_id: number;

  @Column({
    type: DataType.DATE,
  })
  date_visit_ended: Date;

  @Column({
    type: DataType.ENUM(
      VisitCategory.IPD,
      VisitCategory.OPD,
      VisitCategory.EMERGENCY,
      VisitCategory.ANC
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit category is required',
      },
    },
  })
  category: VisitCategory;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date_visit_start: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'department is required',
      },
    },
  })
  department: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'professional is required',
      },
    },
  })
  professional: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit type is required',
      },
    },
  })
  type: string;

  @Column({
    type: DataType.ENUM(VisitStatus.ENDED, VisitStatus.ONGOING),
    allowNull: false,
    defaultValue: VisitStatus.ONGOING,
  })
  status: VisitStatus;

  @ForeignKey(() => Antenatal)
  @Column({
    type: DataType.INTEGER,
  })
  ante_natal_id: number;

  @ForeignKey(() => Admission)
  @Column({
    type: DataType.INTEGER,
  })
  admission_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => Antenatal)
  antenatal: Antenatal;

  @BelongsTo(() => Admission)
  admission: Admission;

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
