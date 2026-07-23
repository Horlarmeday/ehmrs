import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * The transactional INBOX for Accounting → EMR instructions (ADR-0018, ADR-0023, ADR-0025 §6b).
 * The mirror of `OutboxEvent` on the receiving side.
 *
 * A verified instruction is written here and COMMITTED before the endpoint ACKs, so an ACK means
 * "we will not lose this", not "we have applied it". A separate drain step reads PENDING rows and
 * applies the effect (flipping `payment_status` on the named prescribed line). Durability lives in
 * this table, never in a queue: a crash after the ACK leaves the row PENDING and the next drain
 * picks it up.
 *
 * `payload` holds the full received envelope. IDs and money-as-string only — no demographics
 * (ADR-0016). `idempotency_key` UNIQUE is the dedup guard: a redelivered instruction hits the
 * constraint and is recognised as already-seen rather than applied twice.
 */
@Table({ timestamps: true, tableName: 'Inbox_Events' })
export class InboxEvent extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(64), allowNull: false, unique: true })
  event_id: string;

  /** Deduplicates a redelivery. OPAQUE — stored and compared as a string, never parsed. */
  @Column({ type: DataType.STRING(200), allowNull: false, unique: true })
  idempotency_key: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  event_type: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  event_version: number;

  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_type: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_id: string;

  /** Monotonic per aggregate, NOT gapless — never assert contiguity. */
  @Column({ type: DataType.BIGINT, allowNull: false })
  sequence: number;

  /** PENDING → PROCESSED | UNHANDLED | FAILED. */
  @Column({ type: DataType.STRING(16), allowNull: false, defaultValue: 'PENDING' })
  status: string;

  @Column({ type: DataType.JSON, allowNull: false })
  payload: Record<string, unknown>;

  @Column({ type: DataType.STRING(64), allowNull: false })
  key_id: string;

  @Column({ type: DataType.DATE, allowNull: true })
  processed_at: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  attempts: number;
}
