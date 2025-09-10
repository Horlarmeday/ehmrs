import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DialysisVisit } from './dialysisVisit';
import { Visit } from './visit';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

@Table({
  timestamps: true,
  tableName: 'Dialysis_Assessments',
  indexes: [
    {
      name: 'idx_dialysis_assessment_visit',
      fields: ['visit_id'],
    },
    {
      name: 'idx_dialysis_assessment_dialysis_visit',
      fields: ['dialysis_visit_id'],
    },
    {
      name: 'idx_dialysis_assessment_patient',
      fields: ['visit_id'],
    },
  ],
})
export class DialysisAssessment extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => DialysisVisit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dialysis visit is required',
      },
    },
  })
  dialysis_visit_id: number;

  @ForeignKey(() => Visit)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'visit is required',
      },
    },
  })
  visit_id: number;

  // Patient Medical Information
  @Column({
    type: DataType.STRING,
    validate: {
      isIn: {
        args: [['Negative', 'Positive', 'Unknown', '']],
        msg: 'HIV status must be Negative, Positive, or Unknown',
      },
    },
  })
  hiv_status: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: {
        args: [['Negative', 'Positive', 'Unknown', '']],
        msg: 'HBsAG status must be Negative, Positive, or Unknown',
      },
    },
  })
  hbsag_status: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: {
        args: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']],
        msg: 'Invalid blood group',
      },
    },
  })
  blood_group: string;

  // Weight Management
  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  current_weight: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  dry_weight: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  previous_post_dialysis_weight: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  required_weight_loss: number;

  // Machine Parameters
  @Column({
    type: DataType.STRING,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Machine type cannot exceed 100 characters',
      },
    },
  })
  machine_type: string;

  @Column({
    type: DataType.STRING,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Dialyser type cannot exceed 100 characters',
      },
    },
  })
  dialyser_type: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: {
        args: [['Acetate', 'Bicarbonate', 'Citrate', '']],
        msg: 'Invalid concentration type',
      },
    },
  })
  concentration_type: string;

  @Column({
    type: DataType.STRING,
  })
  access_route: string;

  // Technical Parameters
  @Column({
    type: DataType.DECIMAL(5, 2),
    validate: {
      min: {
        args: [0],
        msg: 'TMP cannot be negative',
      },
      max: {
        args: [300],
        msg: 'TMP cannot exceed 300 mmHg',
      },
    },
  })
  tmp: number;

  @Column({
    type: DataType.INTEGER,
  })
  clothing_time: number;

  // Medications & Treatments
  @Column({
    type: DataType.INTEGER,
  })
  heparin_units: number;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Infusion drugs description cannot exceed 1000 characters',
      },
    },
  })
  infusion_drugs: string;

  @Column({
    type: DataType.STRING,
  })
  blood_transfusion: string;

  // Clinical Assessment
  @Column({
    type: DataType.TEXT,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Per dialysis assessment cannot exceed 2000 characters',
      },
    },
  })
  per_dialysis_assessment: string;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Treatment plan cannot exceed 1000 characters',
      },
    },
  })
  treatment_plan: string;

  @Column({
    type: DataType.TEXT,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Clinical notes cannot exceed 1000 characters',
      },
    },
  })
  clinical_notes: string;

  // ICD10 Diagnoses - Stored as JSON array
  @Column({
    type: DataType.JSON,
    comment: 'Array of ICD10 diagnoses with code, description, and category',
  })
  icd10_diagnoses: any[];

  // Assessment metadata
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  assessment_date: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: 'ACTIVE',
  })
  status: string;

  // Relationships
  @BelongsTo(() => DialysisVisit)
  dialysis_visit: DialysisVisit;

  @BelongsTo(() => Visit)
  visit: Visit;

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
