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
import { LabFormTemplate, FormSchema, PDFConfig } from './labFormTemplate';

@Table({ timestamps: true, tableName: 'Lab_Form_Template_Versions' })
export class LabFormTemplateVersion extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => LabFormTemplate)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Template ID is required',
      },
    },
  })
  template_id: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Version is required',
      },
    },
  })
  version: string;

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
    type: DataType.TEXT,
  })
  change_notes: string;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
  })
  created_by: number;

  @BelongsTo(() => LabFormTemplate)
  template: LabFormTemplate;

  @BelongsTo(() => Staff)
  creator: Staff;
}
