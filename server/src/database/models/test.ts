import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Sample } from './sample';
import { Staff } from './staff';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum TestType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum ResultForm {
  DEFAULT_RESULT_FORM = 'DefaultResultForm',
  WIDAL_REACTION_FORM = 'WidalReactionForm',
  ANALYTE_FORM = 'AnalyteForm',
  BILIRUBIN_FORM = 'BilirubinForm',
  OGTT_FORM = 'OGTTForm',
  SERUM_FORM = 'SerumForm',
  LFT_FORM = 'LFTForm',
  LIPID_PROFILE_FORM = 'LipidProfileForm',
  SEUCR_FORM = 'SEUCrForm',
  SPUTUM_FORM = 'SputumForm',
  STOOL_ANALYSIS_FORM = 'StoolAnalysisForm',
  SEMEN_ANALYSIS_FORM = 'SemenAnalysisForm',
  URINALYSIS_FORM = 'UrinalysisForm',
  URINE_SWAB_FORM = 'UrineSwabForm',
}

@Table({ timestamps: true })
export class Test extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'name is required',
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
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'code is required',
      },
    },
  })
  code: string;

  @ForeignKey(() => Sample)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'sample id is required',
      },
    },
  })
  sample_id: number;

  @Column({
    type: DataType.ENUM(TestType.PRIMARY, TestType.SECONDARY),
    defaultValue: TestType.SECONDARY,
  })
  type: TestType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'unit of test result is required',
      },
    },
  })
  result_unit: string;

  @Column({
    type: DataType.STRING,
  })
  valid_range: string;

  @Column({
    type: DataType.STRING,
    defaultValue: ResultForm.DEFAULT_RESULT_FORM,
  })
  result_form: string;

  @Column({
    type: DataType.INTEGER,
  })
  old_id: number;

  @Column({
    type: DataType.INTEGER,
  })
  nhis_old_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Sample)
  sample: Sample;

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
