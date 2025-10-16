import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { RoutesOfAdministration } from './routesOfAdministration';
import { DosageForm } from './dosageForm';

@Table({ timestamps: true, tableName: 'Route_Dosage_Forms' })
export class RouteDosageForm extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false, autoIncrement: true })
  id: number;

  @ForeignKey(() => RoutesOfAdministration)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'route_id is required',
      },
    },
  })
  route_id: number;

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

  @BelongsTo(() => RoutesOfAdministration)
  route: RoutesOfAdministration;

  @BelongsTo(() => DosageForm)
  dosage_form: DosageForm;
}
