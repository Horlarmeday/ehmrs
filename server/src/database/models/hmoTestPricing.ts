import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Test } from './test';
import { Insurance } from './insurance';
import { Status } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { HMO } from './hmo';

@Table({ timestamps: true, tableName: 'HMO_Test_Pricing' })
export class HMOTestPricing extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Test)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test is required',
      },
    },
  })
  test_id: number;

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
  is_covered: boolean;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'HMO price is required',
      },
      min: {
        args: [0],
        msg: 'HMO price cannot be negative',
      },
    },
  })
  hmo_price: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.0,
    validate: {
      min: {
        args: [0],
        msg: 'Patient percentage cannot be negative',
      },
      max: {
        args: [100],
        msg: 'Patient percentage cannot exceed 100%',
      },
    },
  })
  patient_percentage: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 90.0,
    validate: {
      min: {
        args: [0],
        msg: 'HMO percentage cannot be negative',
      },
      max: {
        args: [100],
        msg: 'HMO percentage cannot exceed 100%',
      },
    },
  })
  hmo_percentage: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'effective from date is required',
      },
    },
  })
  effective_from: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  effective_to: Date;

  @Column({
    type: DataType.ENUM(Status.ACTIVE, Status.INACTIVE),
    defaultValue: Status.ACTIVE,
  })
  status: Status;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  // Relationships
  @BelongsTo(() => Test)
  test: Test;

  @BelongsTo(() => Insurance)
  insurance: Insurance;

  @BelongsTo(() => HMO)
  hmo: HMO;

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
