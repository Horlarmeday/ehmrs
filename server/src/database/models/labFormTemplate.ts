import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { LabFormTemplateVersion } from './labFormTemplateVersion';
import {
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  WhereOptions,
} from 'sequelize/types/model';
import { calcLimitAndOffset, paginate } from '../../core/helpers/helper';

export enum FormCategory {
  HEMATOLOGY = 'Hematology',
  CHEMISTRY = 'Chemistry',
  MICROBIOLOGY = 'Microbiology',
  IMMUNOLOGY = 'Immunology',
  HORMONAL = 'Hormonal',
  SEROLOGY = 'Serology',
  OTHER = 'Other',
}

export interface FormSchema {
  formId: string;
  formName: string;
  formType: 'table' | 'list' | 'grouped' | 'custom';
  version: string;
  sections: FormSection[];
  pdfConfig?: PDFConfig;
}

export interface FormSection {
  id: string;
  title?: string;
  type?: 'table' | 'list' | 'header' | 'conditional';
  conditionalLogic?: {
    showIf: string;
  };
  fields: FormField[];
  fieldType?: string;
  antibiotics?: string[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  unit?: string;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    decimalPlaces?: number;
  };
  referenceRanges?: {
    child?: ReferenceRange;
    adultMale?: ReferenceRange;
    adultFemale?: ReferenceRange;
    [key: string]: ReferenceRange | undefined;
  };
  abnormalDetection?: {
    enabled: boolean;
    ageDependent?: boolean;
    sexDependent?: boolean;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface ReferenceRange {
  min?: number;
  max?: number;
  display: string;
}

export interface PDFConfig {
  layout: 'table' | 'multiColumnTable' | 'list' | 'grouped';
  columns?: Array<{
    key: string;
    header: string;
    align: 'left' | 'right' | 'center';
    width?: string;
  }>;
  showUnit?: boolean;
  highlightAbnormal?: boolean;
}

@Table({ timestamps: true, tableName: 'Lab_Form_Templates' })
export class LabFormTemplate extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Template name is required',
      },
    },
  })
  name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Template code is required',
      },
    },
  })
  code: string;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    type: DataType.STRING(100),
  })
  category: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Schema JSON is required',
      },
    },
  })
  schema_json: FormSchema;

  @Column({
    type: DataType.JSON,
  })
  pdf_config: PDFConfig;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: '1.0',
  })
  version: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_system_template: boolean;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  updated_by: number;

  @BelongsTo(() => Staff, 'created_by')
  creator: Staff;

  @BelongsTo(() => Staff, 'updated_by')
  updater: Staff;

  @HasMany(() => LabFormTemplateVersion)
  versions: LabFormTemplateVersion[];

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
