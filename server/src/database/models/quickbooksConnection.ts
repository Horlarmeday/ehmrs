import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Staff } from './staff';

export enum QuickbooksEnvironment {
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

@Table({ tableName: 'quickbooks_connections', timestamps: true })
export class QuickbooksConnection extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  realm_id: string;

  @Column({
    type: DataType.ENUM(...Object.values(QuickbooksEnvironment)),
    allowNull: false,
    defaultValue: QuickbooksEnvironment.SANDBOX,
  })
  environment: QuickbooksEnvironment;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  access_token_encrypted: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  refresh_token_encrypted: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  access_token_expires_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  refresh_token_expires_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_synced_at?: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  connected_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  disconnected_at?: Date | null;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_connected: boolean;

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

  @BelongsTo(() => Staff, { foreignKey: 'created_by' })
  createdByStaff: Staff;

  @BelongsTo(() => Staff, { foreignKey: 'updated_by' })
  updatedByStaff: Staff;

  get isActive(): boolean {
    return this.is_connected && !this.disconnected_at;
  }
}

