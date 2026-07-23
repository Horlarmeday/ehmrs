import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

/**
 * Per-aggregate high-water marks for APPLIED overwrite instructions on the inbox (ADR-0025 §4).
 *
 * The reverse events are OVERWRITE events: `payment.settled` carries a per-encounter sequence, and
 * a redelivery or a race can present them out of order. This row records the highest sequence
 * already APPLIED for an aggregate, so an instruction with a lower-or-equal sequence is discarded
 * as stale rather than overwriting a fresher state (the delayed `unpaid` that must not clobber a
 * later `paid`).
 *
 * Monotonic, NOT gapless — a gap is normal (the sender's clinical transaction may have rolled back
 * a number). Never assert contiguity.
 *
 * Bookkeeping about EVENT ORDERING, never about money.
 */
@Table({ timestamps: true, tableName: 'Inbox_Sequences' })
export class InboxSequence extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(64), allowNull: false })
  aggregate_id: string;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  last_applied_sequence: number;
}
