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
import { Visit } from './visit';
import { Patient } from './patient';

export enum EncounterType {
  CONSULTATION = 'Consultation',
  PRESCRIPTION = 'Prescription',
  LAB_ORDER = 'Lab Order',
  RADIOLOGY_ORDER = 'Radiology Order',
  SERVICE_ORDER = 'Service Order',
  TRIAGE = 'Triage',
  OBSERVATION = 'Observation',
  DIAGNOSIS = 'Diagnosis',
  ADMISSION = 'Admission',
  DISCHARGE = 'Discharge',
  WARD_ROUND = 'Ward Round',
  CLINICAL_NOTE = 'Clinical Note',
  MULTIPLE = 'Multiple',
}

@Table({ timestamps: true })
export class Encounter extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

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

  @Column({
    type: DataType.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'date of encounter is required',
      },
    },
  })
  time_of_encounter: Date;

  @Column({
    type: DataType.ENUM(...Object.values(EncounterType)),
    allowNull: true,
  })
  encounter_type: EncounterType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  encounter_summary: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  related_entity_type: string; // e.g., 'PrescribedDrug', 'PrescribedTest', 'Observation'

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  related_entity_id: number; // ID of the related entity (prescription, test, etc.)

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: any; // Additional context data

  @BelongsTo(() => Staff)
  examiner: Staff;

  @BelongsTo(() => Visit)
  visit: Visit;

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
