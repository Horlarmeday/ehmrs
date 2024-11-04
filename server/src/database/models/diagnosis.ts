import {
  AfterFind,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Patient } from './patient';
import { Staff } from './staff';
import { Visit } from './visit';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { ICD10Disease } from './icd10_disease';
import { ICPC2Disease } from './icpc2_disease';
import { PatientInsurance } from './patientInsurance';

export enum Certainty {
  PRESUMED = 'Presumed',
  CONFIRMED = 'Confirmed',
}

export enum DiagnosisType {
  ICPC2 = 'ICPC2',
  ICD10 = 'ICD10',
}
const attributes = ['diagnosis', 'code', 'id'];
@DefaultScope(() => ({
  include: [
    { model: ICPC2Disease, attributes },
    { model: ICD10Disease, attributes },
    // { model: Staff, attributes: ['firstname', 'lastname', 'fullname'] },
  ],
}))
@Table({ timestamps: true })
export class Diagnosis extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'diagnosis id is required',
      },
    },
  })
  diagnosis_id: number;

  @Column({
    type: DataType.ENUM(DiagnosisType.ICD10, DiagnosisType.ICPC2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'pick a type',
      },
    },
  })
  type: DiagnosisType;

  @Column({
    type: DataType.ENUM(Certainty.CONFIRMED, Certainty.PRESUMED),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'pick a certainty',
      },
    },
  })
  certainty: Certainty;

  @Column({
    type: DataType.TEXT,
  })
  notes: string;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  visit_id: number;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patient_id: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  staff_id: number;

  @ForeignKey(() => PatientInsurance)
  @Column({
    type: DataType.INTEGER,
  })
  patient_insurance_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => ICD10Disease, 'diagnosis_id')
  icd10: ICD10Disease;

  @BelongsTo(() => ICPC2Disease, 'diagnosis_id')
  icpc2: ICPC2Disease;

  @Column(DataType.VIRTUAL)
  get diagnosis(): any {
    if (this.type === DiagnosisType.ICD10) {
      const icd10 = this.icd10;
      delete this.dataValues.icpc2;
      delete this.dataValues.icd10;
      return icd10;
    } else {
      const icpc2 = this.icpc2;
      delete this.dataValues.icd10;
      delete this.dataValues.icpc2;
      return icpc2;
    }
  }
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
