import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Drug } from './drug';
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

@Table({
  timestamps: true,
  tableName: 'HMO_Drug_Pricing',
  indexes: [
    {
      name: 'idx_hmo_drug_pricing_drug',
      fields: ['drug_id'],
    },
    {
      name: 'idx_hmo_drug_pricing_insurance',
      fields: ['insurance_id'],
    },
    {
      name: 'idx_hmo_drug_pricing_status',
      fields: ['status'],
    },
    {
      name: 'idx_hmo_drug_pricing_effective_from',
      fields: ['effective_from'],
    },
    {
      name: 'idx_hmo_drug_pricing_effective_to',
      fields: ['effective_to'],
    },
    {
      name: 'idx_hmo_drug_pricing_composite',
      fields: ['drug_id', 'insurance_id', 'status'],
      unique: true,
    },
  ],
})
export class HMODrugPricing extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Drug)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'drug is required',
      },
    },
  })
  drug_id: number;

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
  patient_percentage: number; // Default 10% for NHIS

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
  hmo_percentage: number; // Default 90% for NHIS

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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_covered: boolean;

  // Relationships
  @BelongsTo(() => Drug)
  drug: Drug;

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
