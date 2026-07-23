import { UniqueConstraintError } from 'sequelize';
import { InboxEvent } from '../../database/models/inboxEvent';
import { verifyReverseSignature, VerifierConfig, VerificationFailure } from './verifier';

/**
 * Verifies a reverse instruction and writes it to the inbox, committing before the caller ACKs
 * (ADR-0018: an ACK means "we will not lose this", not "we have applied it").
 *
 * Ordering, per the plan:
 *   - verification failure → the caller returns 401 and NOTHING is written. An unauthenticated
 *     caller must not be able to fill our tables.
 *   - a DUPLICATE idempotency key → success (202), no new row. A duplicate is not an error.
 *   - otherwise the row lands PENDING and a separate drain applies it.
 */

/** Flat, not a discriminated union — see verifier.ts: this repo compiles with `strict` off. */
export interface WriteOutcome {
  readonly result: 'ACCEPTED' | 'DUPLICATE' | 'REJECTED';
  readonly inboxEventId?: number;
  readonly reason?: VerificationFailure;
}

interface Envelope {
  event_id: string;
  event_type: string;
  event_version: number;
  aggregate: { type: string; id: string };
  sequence: number;
  idempotency_key: string;
  body: Record<string, unknown>;
}

function readEnvelope(parsed: Record<string, unknown>): Envelope | undefined {
  const aggregate = parsed.aggregate as { type?: unknown; id?: unknown } | undefined;
  if (
    typeof parsed.event_id !== 'string' ||
    typeof parsed.event_type !== 'string' ||
    typeof parsed.idempotency_key !== 'string' ||
    typeof aggregate !== 'object' ||
    aggregate === null ||
    typeof aggregate.type !== 'string' ||
    typeof aggregate.id !== 'string'
  ) {
    return undefined;
  }
  return {
    event_id: parsed.event_id,
    event_type: parsed.event_type,
    event_version: Number(parsed.event_version ?? 1),
    aggregate: { type: aggregate.type, id: aggregate.id },
    sequence: Number(parsed.sequence ?? 0),
    idempotency_key: parsed.idempotency_key,
    body: (parsed.body as Record<string, unknown>) ?? {},
  };
}

export async function verifyAndWrite(
  rawBody: Buffer,
  headers: Record<string, unknown>,
  config: VerifierConfig,
  now: Date = new Date()
): Promise<WriteOutcome> {
  const verification = verifyReverseSignature(rawBody, headers, config, now);
  if (!verification.ok) {
    return { result: 'REJECTED', reason: verification.reason };
  }

  const envelope = readEnvelope(verification.parsedBody);
  if (envelope === undefined) {
    // Authenticated (signature already held) but structurally invalid. Written nowhere here; the
    // endpoint dead-letters it so a permanently-malformed instruction is recorded once rather than
    // retried forever. Reason MALFORMED_BODY is what the controller routes to the DLQ.
    const reason: VerificationFailure = 'MALFORMED_BODY';
    return { result: 'REJECTED', reason };
  }

  try {
    const row = await InboxEvent.create({
      event_id: envelope.event_id,
      idempotency_key: envelope.idempotency_key,
      event_type: envelope.event_type,
      event_version: envelope.event_version,
      aggregate_type: envelope.aggregate.type,
      aggregate_id: envelope.aggregate.id,
      sequence: envelope.sequence,
      status: 'PENDING',
      payload: envelope.body,
      key_id: verification.keyId,
    } as never);

    return { result: 'ACCEPTED', inboxEventId: ((row as unknown) as { id: number }).id };
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      // A redelivery. Recognised-and-discarded: success, no new row.
      return { result: 'DUPLICATE' };
    }
    throw error;
  }
}
