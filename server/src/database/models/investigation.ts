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
import { Imaging } from './imaging';

export enum InvestigationType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

@Table({ timestamps: true })
export class Investigation extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'investigation name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'price is required',
      },
    },
  })
  price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
  })
  nhis_price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
  })
  phis_price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
  })
  retainership_price: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_available_for_nhis: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_available_for_phis: boolean;

  @Column({
    type: DataType.ENUM(InvestigationType.PRIMARY, InvestigationType.SECONDARY),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'type of investigation is required',
      },
    },
  })
  type: InvestigationType;

  @ForeignKey(() => Imaging)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imaging id is required',
      },
    },
  })
  imaging_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id?: number;

  @Column({
    type: DataType.INTEGER,
  })
  old_id?: number;

  @Column({
    type: DataType.INTEGER,
  })
  nhis_old_id?: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Imaging)
  imaging: Imaging;

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
