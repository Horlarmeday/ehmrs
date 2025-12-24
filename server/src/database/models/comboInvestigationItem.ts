import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ComboInvestigation } from './comboInvestigation';
import { Investigation } from './investigation';

@Table({ timestamps: true, tableName: 'Combo_Investigation_Items' })
export class ComboInvestigationItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ComboInvestigation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'combo investigation id is required',
      },
    },
  })
  combo_investigation_id: number;

  @ForeignKey(() => Investigation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'investigation id is required',
      },
    },
  })
  investigation_id: number;

  @BelongsTo(() => ComboInvestigation)
  comboInvestigation: ComboInvestigation;

  @BelongsTo(() => Investigation)
  investigation: Investigation;
}
