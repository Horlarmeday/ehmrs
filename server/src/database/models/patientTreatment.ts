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
import { Staff } from './staff';
import { Visit } from './visit';
import { Patient } from './patient';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';
import { DosageForm } from './dosageForm';
import { RoutesOfAdministration } from './routesOfAdministration';
import { Admission } from './admission';

@Table({ timestamps: true, tableName: 'Patient_Treatments' })
export class PatientTreatment extends Model {
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

  @ForeignKey(() => DosageForm)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dosage form id is required',
      },
    },
  })
  dosage_form_id: number;

  @ForeignKey(() => RoutesOfAdministration)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'route id is required',
      },
    },
  })
  route_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dosage administered is required',
      },
    },
  })
  dosage_administered: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: 0,
  })
  remarks: string;

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
        msg: 'date entered is required',
      },
    },
  })
  date_entered: Date;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit id is required',
      },
    },
  })
  visit_id: number;

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

  @ForeignKey(() => Admission)
  @Column({
    type: DataType.INTEGER,
  })
  admission_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Drug)
  drug: Drug;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Patient)
  patient: Patient;

  @BelongsTo(() => DosageForm)
  dosageForm: DosageForm;

  @BelongsTo(() => RoutesOfAdministration)
  route: RoutesOfAdministration;

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
