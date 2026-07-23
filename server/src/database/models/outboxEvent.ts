import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * The transactional outbox for EMR → Accounting events (ADR-0018, ADR-0025).
 *
 * A row is written in the SAME transaction as the clinical write that caused it, so the charge
 * and the intent to tell Accounting about it commit together or not at all. A separate supervised
 * drainer POSTs unsent rows to the co-deployed Accounting inbox and marks `sent_at`.
 *
 * Durability lives HERE, not in the drainer or in any queue: if the drainer dies mid-flight the
 * row is still unsent and gets picked up on restart. HTTP is transport only.
 *
 * `payload` holds the full signed-envelope body. It carries IDs and money-as-string ONLY — no
 * patient name, DOB, phone, address, or membership number (ADR-0016). Accounting's schema guard
 * enforces that on its side; here the payload builder is the only thing that does, so it rejects
 * demographic keys before insert.
 */
@Table({ timestamps: true, tableName: 'Outbox_Events' })
export class OutboxEvent extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_type: string;

  /**
   * `visit:{visit_id}` — this EMR maps its Visit onto the contract's encounter aggregate
   */
  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_id: string;

  /**
   * Monotonic per aggregate, NOT gapless — a rolled-back clinical transaction legitimately
   * consumes-then-releases a number. Never assert contiguity: the receiver processes-and-alerts
   * on gaps rather than blocking (ADR-0025 Q4.3).
   */
  @Column({ type: DataType.BIGINT, allowNull: false })
  sequence: number;

  @Column({ type: DataType.STRING(64), allowNull: false })
  event_type: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  event_version: number;

  @Column({ type: DataType.STRING(200), allowNull: false, unique: true })
  idempotency_key: string;

  @Column({ type: DataType.JSON, allowNull: false })
  payload: Record<string, unknown>;

  @Column({ type: DataType.DATE, allowNull: true })
  sent_at: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  attempts: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  last_error: string;
}
