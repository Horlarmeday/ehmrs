import { createHash, createHmac } from 'crypto';
import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { emitChargeCaptured } from './outbox-writer';
import { drainOnce, EventPoster } from './drainer';

/**
 * The end-to-end tracer: a clinical charge -> outbox row -> drain -> a signature the Accounting
 * inbox ACCEPTS. The poster here IS the Accounting inbox's ADR-0025 §5 verification, reconstructed
 * from the spec (a second, independent implementation, so the two cannot silently drift together).
 *
 * This is the "does the whole pipe connect?" test: emit, sign at drain time, verify. If it passes,
 * an event this EMR produces will be accepted by the live Accounting inbox.
 */

const KEY = { keyId: 'emr-tracer', secret: 'tracer-secret' };
const TENANT_KEY = process.env.EMR_TENANT_KEY || 'default';
const MAX_SKEW_SECONDS = 300;

/** A poster that verifies like the Accounting inbox and returns 202/401 accordingly. */
const verifyingInbox: EventPoster = async (_url, body, headers) => {
  const signatureHeader = headers['x-ehmrs-signature'];
  const keyId = headers['x-ehmrs-key-id'];
  const timestamp = headers['x-ehmrs-timestamp'];
  if (!signatureHeader || !keyId || !timestamp) return { status: 401 };

  const match = /^v1=([0-9a-f]+)$/.exec(signatureHeader);
  if (!match) return { status: 401 };

  const sentAtMs = Date.parse(timestamp);
  if (Number.isNaN(sentAtMs) || Math.abs(Date.now() - sentAtMs) > MAX_SKEW_SECONDS * 1000) {
    return { status: 401 };
  }
  if (keyId !== KEY.keyId) return { status: 401 };

  const parsed = JSON.parse(body) as { event_id: string; tenant_key: string };
  const bodyHash = createHash('sha256')
    .update(Buffer.from(body))
    .digest('hex');
  const base = [parsed.event_id, parsed.tenant_key, timestamp, bodyHash].join('\n');
  const expected = createHmac('sha256', KEY.secret)
    .update(base)
    .digest('hex');
  if (match[1] !== expected) return { status: 401 };
  if (parsed.tenant_key !== TENANT_KEY) return { status: 401 };

  return { status: 202 };
};

describe('end-to-end tracer: emit -> drain -> Accounting accepts', () => {
  const originalFlag = process.env.EMR_OUTBOX_ENABLED;

  beforeAll(() => {
    process.env.EMR_OUTBOX_ENABLED = 'true';
  });
  afterAll(async () => {
    process.env.EMR_OUTBOX_ENABLED = originalFlag;
    await sequelizeConnection.close();
  });
  beforeEach(async () => {
    await OutboxEvent.destroy({ where: {}, truncate: true, force: true });
    await OutboxSequence.destroy({ where: {}, truncate: true, force: true });
  });

  it('a charge emitted here is ACCEPTED by the inbox verification', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCaptured(
      {
        type: 'drug',
        id: 1,
        patient_id: 100,
        visit_id: 8891,
        amount: '2500.00',
        quantity: 2,
        service_date: '2026-07-22',
      },
      t
    );
    await t.commit();

    const result = await drainOnce(verifyingInbox, { inboxUrl: 'http://inbox', signingKey: KEY });

    // 202 -> marked sent. If the signature were wrong, the inbox would 401 and the row would
    // stay unsent — so "sent: 1" IS the proof the handshake works end to end.
    expect(result).toMatchObject({ claimed: 1, sent: 1, failed: 0 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(0);
  });

  it('a tampered payload would be REJECTED (the tracer is not vacuous)', async () => {
    const t = await sequelizeConnection.transaction();
    await emitChargeCaptured(
      {
        type: 'drug',
        id: 2,
        patient_id: 100,
        visit_id: 8891,
        amount: '2500.00',
        quantity: 2,
        service_date: '2026-07-22',
      },
      t
    );
    await t.commit();

    // A poster that tampers the body before verifying — the inbox must 401, row stays unsent.
    const tamperingInbox: EventPoster = async (url, body, headers) => {
      const mangled = body.replace('250000', '999999');
      return verifyingInbox(url, mangled, headers);
    };

    const result = await drainOnce(tamperingInbox, { inboxUrl: 'http://inbox', signingKey: KEY });
    expect(result).toMatchObject({ sent: 0, failed: 1 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(1);
  });
});
