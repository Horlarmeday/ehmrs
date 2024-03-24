import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { PatientType } from '../../modules/Patient/types/patient.types';
import { Gender, Staff } from './staff';

import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { PatientInsurance } from './patientInsurance';

export enum PatientStatus {
  INPATIENT = 'Inpatient',
  OUTPATIENT = 'Outpatient',
  DECEASED = 'Deceased',
}

@Table({ timestamps: true })
export class Patient extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'firstname is required',
      },
    },
  })
  firstname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'lastname is required',
      },
    },
  })
  lastname: string;

  @Column({ type: DataType.STRING })
  middlename?: string;

  @Column({
    type: DataType.ENUM(Gender.MALE, Gender.FEMALE, Gender.OTHER),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'gender is required',
      },
    },
  })
  gender: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'phone number is required',
      },
    },
  })
  phone: string;

  @Column({
    type: DataType.STRING,
  })
  alt_phone?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'address is required',
      },
    },
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'country is required',
      },
    },
  })
  country: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'state is required',
      },
    },
  })
  state: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'local govt is required',
      },
    },
  })
  lga: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  hospital_id?: string;

  @Column({
    type: DataType.STRING,
  })
  next_of_kin_name?: string;

  @Column({
    type: DataType.STRING,
  })
  next_of_kin_address?: string;

  @Column({
    type: DataType.STRING,
  })
  next_of_kin_phone?: string;

  @Column({
    type: DataType.STRING,
  })
  next_of_kin_relationship?: string;

  @Column({
    type: DataType.STRING,
  })
  occupation: string;

  @Column({
    type: DataType.STRING,
  })
  relationship_to_principal?: string;

  @Column({
    type: DataType.TEXT,
  })
  photo: string;

  @Column({
    type: DataType.TEXT,
  })
  photo_url: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date of birth is required',
      },
    },
  })
  date_of_birth: Date;

  @Column({
    type: DataType.STRING,
  })
  marital_status: string;

  @Column({
    type: DataType.STRING,
  })
  religion: string;

  @Column({
    type: DataType.STRING,
  })
  email?: string;

  @ForeignKey(() => Staff)
  @Column({ type: DataType.INTEGER })
  staff_id?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  has_insurance: boolean;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.INTEGER,
  })
  principal_id?: number;

  @Column({
    type: DataType.ENUM(PatientType.DEPENDANT, PatientType.PRINCIPAL, PatientType.INDEPENDENT),
    defaultValue: PatientType.INDEPENDENT,
  })
  patient_type: PatientType;

  @Column({
    type: DataType.ENUM(PatientStatus.INPATIENT, PatientStatus.OUTPATIENT, PatientStatus.DECEASED),
    defaultValue: PatientStatus.OUTPATIENT,
  })
  patient_status: PatientStatus;

  @Column(DataType.VIRTUAL)
  get fullname(): unknown {
    return `${this.getDataValue('firstname')} ${this.getDataValue('lastname')}`;
  }

  @BelongsTo(() => Staff)
  staff: Staff;

  @HasMany(() => PatientInsurance)
  insurances: PatientInsurance[];

  @HasMany(() => Patient)
  dependants: Patient[];

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
