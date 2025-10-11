import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ComboTest } from './comboTest';
import { Test } from './test';

@Table({ timestamps: true, tableName: 'Combo_Test_Items' })
export class ComboTestItem extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => ComboTest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'combo test id is required',
      },
    },
  })
  combo_test_id: number;

  @ForeignKey(() => Test)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'test id is required',
      },
    },
  })
  test_id: number;

  @BelongsTo(() => ComboTest)
  comboTest: ComboTest;

  @BelongsTo(() => Test)
  test: Test;
}
