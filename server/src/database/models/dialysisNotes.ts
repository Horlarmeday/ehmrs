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
import { Staff } from './staff';
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
  tableName: 'Dialysis_Notes',
  indexes: [
    {
      name: 'idx_dialysis_notes_visit',
      fields: ['visit_id'],
    },
    {
      name: 'idx_dialysis_notes_dialysis_visit',
      fields: ['dialysis_visit_id'],
    },
    {
      name: 'idx_dialysis_notes_staff',
      fields: ['staff_id'],
    },
    {
      name: 'idx_dialysis_notes_type',
      fields: ['type'],
    },
    {
      name: 'idx_dialysis_notes_created',
      fields: ['created_at'],
    },
  ],
})
export class DialysisNotes extends Model {
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

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'staff member is required',
      },
    },
  })
  staff_id: number;

  @Column({
    type: DataType.ENUM('clinical', 'nursing', 'technical'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'note type is required',
      },
      isIn: {
        args: [['clinical', 'nursing', 'technical']],
        msg: 'Note type must be clinical, nursing, or technical',
      },
    },
  })
  type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'note content is required',
      },
    },
  })
  content: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;

  // Note metadata
  @Column({
    type: DataType.STRING,
    defaultValue: 'ACTIVE',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Note title cannot exceed 100 characters',
      },
    },
  })
  title: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_urgent: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  requires_followup: boolean;

  // Relationships
  @BelongsTo(() => DialysisVisit)
  dialysis_visit: DialysisVisit;

  @BelongsTo(() => Visit)
  visit: Visit;

  @BelongsTo(() => Staff, { foreignKey: 'staff_id' })
  staff: Staff;

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
