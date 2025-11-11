import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';
import { QuickbooksEnvironment } from './quickbooksConnection';

@Table({ tableName: 'quickbooks_credentials', timestamps: true })
export class QuickbooksCredential extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  client_id_encrypted: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  client_secret_encrypted: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  redirect_uri: string;

  @Column({
    type: DataType.ENUM(...Object.values(QuickbooksEnvironment)),
    allowNull: false,
    defaultValue: QuickbooksEnvironment.SANDBOX,
  })
  environment: QuickbooksEnvironment;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  created_by: number;

  @ForeignKey(() => Staff)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  updated_by?: number | null;
}

