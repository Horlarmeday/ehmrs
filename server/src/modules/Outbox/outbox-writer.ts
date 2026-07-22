import { QueryTypes, Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { buildChargeCapturedEvent, visitAggregateId, PrescribedLineInput } from './event-builder';

/**
 * Writes charge.captured events to the outbox INSIDE a clinical write transaction (ADR-0018).
 *
 * The whole point of an outbox is atomicity: the prescribed-line INSERT and the outbox INSERT
 * commit together or not at all. So every method here takes the caller's `Transaction` and does
 * its work on it — never opening its own. If the clinical write rolls back, so does the event.
 *
 * Gated by EMR_OUTBOX_ENABLED. Off, `emitChargeCaptured` is a no-op, so the table and this code
 * can land in production inert and be switched on per environment once verified.
 */

const TENANT_KEY = process.env.EMR_TENANT_KEY || 'default';

export function isOutboxEnabled(): boolean {
  return process.env.EMR_OUTBOX_ENABLED === 'true';
}

/**
 * Claims the next sequence for an aggregate, inside the caller's transaction.
 *
 * A per-aggregate counter row with `SELECT … FOR UPDATE`: lock it, read `last_sequence`, write
 * `+1` to both the counter and the returned value. Strictly monotonic per aggregate; serialises
 * ONLY concurrent writes to the SAME visit, never across visits. Monotonic, not gapless — a
 * rolled-back clinical transaction consumes a number and releases it.
 *
 * `INSERT … ON DUPLICATE KEY UPDATE` with `LAST_INSERT_ID` folds the "first event for this
 * aggregate" and "nth event" cases into one atomic statement that also takes the row lock, so
 * there is no read-then-write window for a concurrent transaction to slip through.
 */
export async function claimSequence(
  aggregateId: string,
  transaction: Transaction
): Promise<number> {
  await sequelizeConnection.query(
    `INSERT INTO Outbox_Sequences (aggregate_id, last_sequence, createdAt, updatedAt)
     VALUES (:aggregateId, LAST_INSERT_ID(1), NOW(), NOW())
     ON DUPLICATE KEY UPDATE last_sequence = LAST_INSERT_ID(last_sequence + 1), updatedAt = NOW()`,
    { replacements: { aggregateId }, transaction, type: QueryTypes.INSERT }
  );

  const [row] = await sequelizeConnection.query<{ seq: number }>('SELECT LAST_INSERT_ID() AS seq', {
    transaction,
    type: QueryTypes.SELECT,
  });
  return Number(row.seq);
}

/**
 * Builds and persists a charge.captured outbox row for one prescribed line, on the caller's
 * transaction. No-op when the outbox is disabled.
 *
 * The sequence is claimed here (not by the caller) so the counter lock is held for the minimum
 * span and always in the same transaction as the row it stamps.
 */
export async function emitChargeCaptured(
  line: Omit<PrescribedLineInput, never>,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(line.visit_id);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildChargeCapturedEvent(line, { tenantKey: TENANT_KEY, sequence });

  return OutboxEvent.create(
    {
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      sequence: event.sequence,
      event_type: event.event_type,
      event_version: event.event_version,
      idempotency_key: event.idempotency_key,
      payload: event.payload,
    } as never,
    { transaction }
  );
}
