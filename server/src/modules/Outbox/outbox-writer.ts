import { QueryTypes, Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import {
  buildChargeCapturedEvent,
  buildEncounterOpenedEvent,
  visitAggregateId,
  PrescribedLineInput,
} from './event-builder';
import {
  COVERAGE_TYPE_FIELD_BY_TYPE,
  PRICE_FIELD_BY_TYPE,
  PrescribedLineType,
} from './prescribed-line-types';
import { PayerResolver } from './payer-derivation';

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

/**
 * Builds and persists an `encounter.opened` outbox row on the caller's transaction — the same
 * transaction the Visit INSERT runs in, so the visit and its opening event commit together or not
 * at all. No-op when the outbox is disabled.
 */
export async function emitEncounterOpened(
  visitId: number | string,
  emergency: boolean,
  transaction: Transaction
): Promise<OutboxEvent | undefined> {
  if (!isOutboxEnabled()) {
    return undefined;
  }

  const aggregateId = visitAggregateId(visitId);
  const sequence = await claimSequence(aggregateId, transaction);

  const event = buildEncounterOpenedEvent(
    { visit_id: visitId, emergency },
    { tenantKey: TENANT_KEY, sequence }
  );

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

/**
 * The subset of a Prescribed_* model the outbox reads. The five Sequelize models don't share a
 * base type, so a row arrives as `unknown` and is narrowed here: the fields read (id, patient_id,
 * visit_id, the per-type price column, a quantity) exist on all five, and the builder validates
 * the values it actually uses. Narrowing rather than casting keeps a malformed row from silently
 * producing a bad event.
 */
function asPrescribedRecord(row: unknown): Record<string, unknown> {
  if (typeof row !== 'object' || row === null) {
    throw new Error('Outbox: expected a prescribed-line record, got a non-object.');
  }
  // Sequelize instances expose column values via get(); fall back to own enumerable props.
  const model = row as { get?: (opts: { plain: boolean }) => Record<string, unknown> };
  return typeof model.get === 'function'
    ? model.get({ plain: true })
    : (row as Record<string, unknown>);
}

/**
 * Normalises a price to the decimal STRING the builder expects.
 *
 * A price reaches here two ways: from a reloaded row it is already the DECIMAL driver string; from
 * a just-created row it may still be the JS number the HTTP request body carried. A number from a
 * price field is a legitimate naira amount (the DECIMAL column would store it identically), NOT the
 * float-artifact the builder's number-rejection guards against — so convert an integer-or-2dp
 * number to its exact string here. A number with more than 2 decimal places is refused: that is
 * sub-kobo precision the money layer must not silently round.
 */
export function normalisePrice(value: unknown): unknown {
  if (typeof value !== 'number') {
    return value;
  }
  if (!Number.isFinite(value)) {
    throw new Error(`Outbox: price is not a finite number (${value}).`);
  }
  // toFixed(2) is exact for a value with <= 2 decimal places; reject anything finer than a kobo.
  const rounded = Number(value.toFixed(2));
  if (rounded !== value) {
    throw new Error(`Outbox: price ${value} has sub-kobo precision; refusing to round.`);
  }
  return value.toFixed(2);
}

/**
 * Emits a charge.captured for each row a prescribe endpoint created, on its transaction.
 *
 * The single call every emit site makes. Reading the price by the per-type column name (not a
 * fixed field) is what lets one helper serve all five types whose price column differs. A row
 * missing its price is a data bug, not something to paper over — nairaStringToKoboString throws,
 * which rolls the whole clinical write back rather than emitting a zero-value charge.
 */
export async function emitChargeCapturedForRows(
  type: PrescribedLineType,
  rows: readonly unknown[],
  serviceDate: string,
  transaction: Transaction
): Promise<void> {
  if (!isOutboxEnabled() || rows.length === 0) {
    return;
  }

  const priceField = PRICE_FIELD_BY_TYPE[type];
  const coverageField = COVERAGE_TYPE_FIELD_BY_TYPE[type];
  const payerResolver = new PayerResolver(transaction);
  for (const raw of rows) {
    const row = asPrescribedRecord(raw);
    const payer = await payerResolver.resolve(row.patient_insurance_id, row[coverageField]);
    const input: PrescribedLineInput = {
      type,
      id: Number(row.id),
      patient_id: Number(row.patient_id),
      visit_id: Number(row.visit_id),
      amount: normalisePrice(row[priceField]),
      quantity: Number(row.quantity_prescribed ?? row.quantity ?? 1),
      service_date: serviceDate,
      payer,
    };
    await emitChargeCaptured(input, transaction);
  }
}
