import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * Per-aggregate sequence high-water marks for the outbox (ADR-0025 §4).
 *
 * One row per aggregate (`visit:{visit_id}` — see ADR-0027). The clinical transaction takes a
 * `SELECT … FOR UPDATE` lock on this row, reads `last_sequence`, and writes `n+1` to both this
 * row and the outbox row. That makes the sequence strictly monotonic per aggregate while
 * serialising ONLY concurrent writes to the same visit — never across visits.
 *
 * Monotonic, NOT gapless. A rolled-back clinical transaction consumes a number and releases it,
 * so gaps are normal and expected. The receiver alerts on a gap and processes anyway rather than
 * blocking, because a lost event must never freeze an aggregate forever.
 *
 * This is bookkeeping about EVENT DELIVERY, never about money — no amount is derived from it.
 */
@Table({ timestamps: true, tableName: 'Outbox_Sequences' })
export class OutboxSequence extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  last_sequence: number;
}
