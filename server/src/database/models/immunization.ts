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
import {
  AccountStatus,
  ImmunizationData,
  OtherChildren,
} from '../../modules/Immunization/types/immunization.types';

@Table({ timestamps: true, tableName: 'Immunizations' })
export class Immunization extends Model {
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
  immunization_number: string;

  @Column({
    type: DataType.STRING,
  })
  mother_name: string;

  @Column({
    type: DataType.STRING,
  })
  place_of_birth: string;

  @Column({
    type: DataType.STRING,
  })
  father_name: string;

  @Column({
    type: DataType.DATE,
  })
  date_registered: Date;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'at birth is required',
      },
    },
  })
  at_birth: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_six_weeks: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_ten_weeks: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_fourteen_weeks: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_six_months: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_nine_months: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_one_year: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_fifteen_months: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  at_two_years: ImmunizationData;

  @Column({
    type: DataType.JSON,
  })
  other_children: OtherChildren;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_wt_less_than_2_5kg: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_baby_twin: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_baby_bottle_fed: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  does_family_need_support: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  are_siblings_under_weight: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  need_extra_care: boolean;

  @Column({
    type: DataType.TEXT,
  })
  reason_for_extra_care: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @Column({
    type: DataType.ENUM(AccountStatus.ONGOING, AccountStatus.COMPLETED, AccountStatus.DISCONTINUED),
    defaultValue: AccountStatus.ONGOING,
  })
  status: AccountStatus;

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
