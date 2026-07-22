import { Transaction } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { signEvent, SigningKey } from './signer';

/**
 * Drains the outbox: signs unsent events and POSTs them to the co-deployed Accounting inbox
 * (ADR-0018, ADR-0023). Durability lives in the table, not here — a crash mid-drain leaves the
 * row unsent, and the next run picks it up. HTTP is transport only.
 *
 * Meant to run in a SEPARATE supervised process, never inline in an HTTP request (ADR-0023). The
 * Agenda wiring (drainer.job.ts) is that process's entry point; this module is the pure,
 * testable drain logic.
 */

const MAX_ATTEMPTS = Number(process.env.EMR_OUTBOX_MAX_ATTEMPTS || 5);
const BATCH_SIZE = Number(process.env.EMR_OUTBOX_BATCH_SIZE || 50);

export interface DrainConfig {
  readonly inboxUrl: string;
  readonly signingKey: SigningKey;
  readonly maxAttempts?: number;
  readonly batchSize?: number;
}

export interface DrainResult {
  readonly claimed: number;
  readonly sent: number;
  readonly failed: number;
  readonly deadLettered: number;
}

/** How an event is POSTed. Injected so tests drive the drainer without a live HTTP server. */
export type EventPoster = (
  url: string,
  body: string,
  headers: Record<string, string>
) => Promise<{ status: number }>;

function readEnvConfig(): { inboxUrl: string; signingKey: SigningKey } {
  const inboxUrl = process.env.EMR_ACCOUNTING_INBOX_URL;
  const keyId = process.env.EMR_OUTBOUND_KEY_ID;
  const secret = process.env.EMR_OUTBOUND_SECRET;
  if (!inboxUrl || !keyId || !secret) {
    throw new Error(
      'Outbox drainer misconfigured: set EMR_ACCOUNTING_INBOX_URL, EMR_OUTBOUND_KEY_ID, ' +
        'EMR_OUTBOUND_SECRET.'
    );
  }
  return { inboxUrl, signingKey: { keyId, secret } };
}

/**
 * Claims a batch of unsent rows with FOR UPDATE SKIP LOCKED, so two concurrent drainers never
 * grab the same row and never block each other. Returns the claimed rows on the caller's
 * transaction; the caller sends each and marks it in a short transaction per row.
 */
async function claimBatch(batchSize: number, transaction: Transaction): Promise<OutboxEvent[]> {
  return OutboxEvent.findAll({
    where: { sent_at: null },
    order: [['id', 'ASC']],
    limit: batchSize,
    lock: transaction.LOCK.UPDATE,
    skipLocked: true,
    transaction,
  });
}

/**
 * `sent_at` is written into the envelope and signed together, so a retry re-signs with a FRESH
 * timestamp (ADR-0025 Q5.2) — replaying the original signature would fail once the 5-minute
 * window closed.
 */
function stampSentAt(payload: Record<string, unknown>, sentAt: Date): Record<string, unknown> {
  return { ...payload, sent_at: sentAt.toISOString() };
}

async function markSent(id: number): Promise<void> {
  await OutboxEvent.update({ sent_at: new Date() }, { where: { id } });
}

async function recordFailure(id: number, attempts: number, error: string): Promise<void> {
  await OutboxEvent.update(
    { attempts: attempts + 1, last_error: error.slice(0, 1000) },
    { where: { id } }
  );
}

/**
 * One drain pass. Claims a batch, sends each row, marks sent on a 2xx. A row past MAX_ATTEMPTS is
 * left unsent with its last_error — the dead-letter state; nothing is deleted, so it stays visible
 * for an operator and can be replayed once the cause is fixed.
 */
export async function drainOnce(
  post: EventPoster,
  config?: Partial<DrainConfig>
): Promise<DrainResult> {
  const env = config?.inboxUrl && config?.signingKey ? undefined : readEnvConfig();
  const inboxUrl = config?.inboxUrl ?? env!.inboxUrl;
  const signingKey = config?.signingKey ?? env!.signingKey;
  const maxAttempts = config?.maxAttempts ?? MAX_ATTEMPTS;
  const batchSize = config?.batchSize ?? BATCH_SIZE;

  const claimed = await sequelizeConnection.transaction(t => claimBatch(batchSize, t));

  let sent = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const row of claimed) {
    if (row.attempts >= maxAttempts) {
      // Already exhausted: leave it as a dead letter, do not keep hammering the inbox with it.
      deadLettered += 1;
      continue;
    }

    const payload = stampSentAt(row.payload as Record<string, unknown>, new Date());
    const signed = signEvent(payload, signingKey);

    try {
      const response = await post(inboxUrl, signed.rawBody, signed.headers);
      // 2xx = accepted (or a duplicate the inbox recognised) — either way it is delivered.
      if (response.status >= 200 && response.status < 300) {
        await markSent(row.id);
        sent += 1;
      } else {
        await recordFailure(row.id, row.attempts, `HTTP ${response.status}`);
        failed += 1;
        if (row.attempts + 1 >= maxAttempts) {
          deadLettered += 1;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await recordFailure(row.id, row.attempts, message);
      failed += 1;
      if (row.attempts + 1 >= maxAttempts) {
        deadLettered += 1;
      }
    }
  }

  return { claimed: claimed.length, sent, failed, deadLettered };
}

/** The default poster: a real fetch to the inbox. */
export const httpPoster: EventPoster = async (url, body, headers) => {
  const response = await fetch(url, { method: 'POST', body, headers });
  return { status: response.status };
};
