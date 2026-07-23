import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * The reverse-inbox dead-letter store (ADR-0025 §7). An instruction that is authenticated but
 * cannot be applied lands here with its FULL payload and a structured reason — never dropped,
 * never retried forever.
 *
 * Load-bearing: a silently-dropped `payment.settled` means a paying patient's gate never opens
 * (money taken, drugs withheld). This table is what B2.4 renders and replays.
 *
 * `idempotency_key` is deliberately NOT unique: the same instruction may legitimately fail across
 * redeliveries, and a unique constraint would throw while RECORDING a failure — losing it at the
 * exact moment we try to preserve it.
 */
@Table({ timestamps: true, tableName: 'Inbox_Dead_Letters' })
export class InboxDeadLetter extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(64), allowNull: true })
  event_id: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  event_type: string;

  @Column({ type: DataType.STRING(200), allowNull: true })
  idempotency_key: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  reason: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  detail: string;

  @Column({ type: DataType.JSON, allowNull: false })
  payload: Record<string, unknown>;

  @Column({ type: DataType.BIGINT, allowNull: true })
  inbox_event_id: number;
}
