import { Op, Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { InboxEvent } from '../../database/models/inboxEvent';
import { InboxDeadLetter } from '../../database/models/inboxDeadLetter';
import { logger } from '../../core/helpers/logger';
import { applyInstruction } from './applier';

/**
 * Drains the inbox: reads PENDING rows and applies each exactly once (ADR-0018, ADR-0025 §6b).
 *
 * Per row, in ONE transaction: apply the effect AND flip the row to its terminal status AND advance
 * the sequence high-water mark — all-or-nothing, so a crash never leaves an applied effect whose
 * dedup/status did not commit.
 *
 * An authenticated instruction that CANNOT be applied dead-letters (full payload + reason) and the
 * row is marked FAILED — never dropped, never retried forever. Recording a failure must not itself
 * throw (the dead-letter table has no unique key), or the failure would vanish as we record it.
 */

const BATCH_SIZE = Number(process.env.EMR_INBOX_BATCH_SIZE || 50);

export interface DrainResult {
  readonly claimed: number;
  readonly applied: number;
  readonly discarded: number;
  readonly unhandled: number;
  readonly failed: number;
}

async function deadLetter(
  row: InboxEvent,
  reason: string,
  detail: string,
  transaction: Transaction
): Promise<void> {
  await InboxDeadLetter.create(
    {
      event_id: row.event_id,
      event_type: row.event_type,
      idempotency_key: row.idempotency_key,
      reason,
      detail: detail.slice(0, 2000),
      payload: row.payload,
      inbox_event_id: row.id,
    } as never,
    { transaction }
  );
  await InboxEvent.update(
    { status: 'FAILED', processed_at: new Date(), attempts: row.attempts + 1 },
    { where: { id: row.id }, transaction }
  );
  logger.error(
    `Reverse inbox dead-lettered ${row.event_type} ${row.event_id}: ${reason} - ${detail}`
  );
}

export type ProcessOutcome = 'APPLIED' | 'DISCARDED_STALE' | 'UNHANDLED' | 'FAILED' | 'SKIPPED';

/** Processes one PENDING row by id. Public so a scheduler and tests can drive a drain directly. */
export async function processOne(inboxEventId: number): Promise<ProcessOutcome> {
  return sequelizeConnection.transaction(async transaction => {
    const row = await InboxEvent.findByPk(inboxEventId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (row === null) {
      logger.warn(`Reverse inbox row ${inboxEventId} vanished before it could be drained.`);
      return 'SKIPPED';
    }

    // Terminal already: a redelivered drain for a row we finished. Nothing to redo.
    if (row.status !== 'PENDING') {
      return 'SKIPPED';
    }

    try {
      const result = await applyInstruction(
        row.event_type,
        row.aggregate_id,
        Number(row.sequence),
        row.payload,
        transaction
      );

      // A stale overwrite is recorded PROCESSED (recognised-and-discarded), not FAILED: losing a
      // race is correct behaviour, not an error.
      const status = result.outcome === 'UNHANDLED' ? 'UNHANDLED' : 'PROCESSED';

      if (result.outcome === 'DISCARDED_STALE') {
        logger.info(
          `Reverse inbox discarded ${row.event_type} ${row.event_id} as stale (sequence ${row.sequence}).`
        );
      }

      await InboxEvent.update(
        { status, processed_at: new Date(), attempts: row.attempts + 1 },
        { where: { id: row.id }, transaction }
      );
      return result.outcome;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await deadLetter(row, 'HANDLER_ERROR', message, transaction);
      return 'FAILED';
    }
  });
}

/** One drain pass over the PENDING backlog. */
export async function drainInbox(batchSize = BATCH_SIZE): Promise<DrainResult> {
  const pending = await InboxEvent.findAll({
    where: { status: 'PENDING' },
    order: [['id', 'ASC']],
    limit: batchSize,
  });

  const result = { claimed: pending.length, applied: 0, discarded: 0, unhandled: 0, failed: 0 };

  for (const row of pending) {
    const outcome = await processOne(row.id);
    if (outcome === 'APPLIED') result.applied += 1;
    else if (outcome === 'DISCARDED_STALE') result.discarded += 1;
    else if (outcome === 'UNHANDLED') result.unhandled += 1;
    else if (outcome === 'FAILED') result.failed += 1;
  }

  return result;
}

/** Rows still PENDING past a threshold — the sweeper's re-derivation query. */
export async function findStranded(staleAfterSeconds = 30, limit = 500): Promise<InboxEvent[]> {
  const cutoff = new Date(Date.now() - staleAfterSeconds * 1000);
  return InboxEvent.findAll({
    where: { status: 'PENDING', createdAt: { [Op.lt]: cutoff } },
    order: [['id', 'ASC']],
    limit,
  });
}
