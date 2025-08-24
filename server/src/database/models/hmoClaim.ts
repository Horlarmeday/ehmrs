import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ClinicalBill } from './clinicalBill';
import { Patient } from './patient';
import { HMO } from './hmo';
import { FindAttributeOptions, Includeable, GroupOption, Order, WhereOptions } from 'sequelize';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

import { HMOClaimStatus } from '../../modules/Accounting/enums';

@Table({ timestamps: true, tableName: 'hmo_claims' })
export class HMOClaim extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ClinicalBill)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'bill id is required',
      },
    },
  })
  bill_id: number;

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

  @ForeignKey(() => HMO)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'hmo id is required',
      },
    },
  })
  hmo_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'claim number is required',
      },
    },
  })
  claim_number: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      msg: 'claim amount must be greater than or equal to 0',
    },
  })
  claim_amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      msg: 'approved amount must be greater than or equal to 0',
    },
  })
  approved_amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(HMOClaimStatus)),
    allowNull: false,
    defaultValue: HMOClaimStatus.PENDING,
  })
  status: HMOClaimStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  submission_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approval_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  payment_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejection_reason: string;

  // Relationships
  @BelongsTo(() => ClinicalBill)
  bill: ClinicalBill;

  @BelongsTo(() => Patient)
  patient: Patient;

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
