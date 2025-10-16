import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Measurement } from './measurement';
import { DosageForm } from './dosageForm';

@Table({ timestamps: true, tableName: 'Measurement_Dosage_Forms' })
export class MeasurementDosageForm extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => Measurement)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'measurement_id is required',
      },
    },
  })
  measurement_id: number;

  @ForeignKey(() => DosageForm)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'dosage_form_id is required',
      },
    },
  })
  dosage_form_id: number;

  @BelongsTo(() => Measurement)
  measurement: Measurement;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;
}
