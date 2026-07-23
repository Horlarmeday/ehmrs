import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { emitChargeCaptured } from './outbox-writer';
import { drainOnce, EventPoster } from './drainer';

/**
 * Drainer tests against real MySQL. The poster is injected so the drainer runs without a live
 * HTTP server — but everything else (the FOR UPDATE SKIP LOCKED claim, marking sent, the
 * attempt/dead-letter bookkeeping) exercises the real database.
 */

const CONFIG = {
  inboxUrl: 'http://localhost:9999/inbox',
  signingKey: { keyId: 'emr-test', secret: 'test-secret' },
};

const line = (id: number, visitId = 8891) => ({
  type: 'drug' as const,
  id,
  patient_id: 100,
  visit_id: visitId,
  amount: '2500.00',
  quantity: 1,
  service_date: '2026-07-22',
});

const accept: EventPoster = async () => ({ status: 202 });
const reject500: EventPoster = async () => ({ status: 500 });
const throwPoster: EventPoster = async () => {
  throw new Error('ECONNREFUSED');
};

async function seedEvents(count: number): Promise<void> {
  for (let i = 1; i <= count; i += 1) {
    const t = await sequelizeConnection.transaction();
    await emitChargeCaptured(line(i), t);
    await t.commit();
  }
}

describe('outbox drainer', () => {
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

  it('sends unsent events and marks them sent_at', async () => {
    await seedEvents(3);

    const result = await drainOnce(accept, CONFIG);

    expect(result).toMatchObject({ claimed: 3, sent: 3, failed: 0 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(0);
  });

  it('signs each event with a FRESH sent_at, so a retry is not a stale replay', async () => {
    await seedEvents(1);
    const captured: string[] = [];
    const capture: EventPoster = async (_url, _body, headers) => {
      captured.push(headers['x-ehmrs-timestamp']);
      return { status: 202 };
    };

    await drainOnce(capture, CONFIG);
    expect(captured).toHaveLength(1);
    // The stamped timestamp is recent, i.e. set at drain time rather than at emit time.
    expect(Date.now() - Date.parse(captured[0])).toBeLessThan(5000);
  });

  it('does not mark sent, and bumps attempts, on a non-2xx', async () => {
    await seedEvents(1);

    const result = await drainOnce(reject500, CONFIG);

    expect(result).toMatchObject({ sent: 0, failed: 1 });
    const row = await OutboxEvent.findOne();
    expect(row?.sent_at).toBeNull();
    expect(row?.attempts).toBe(1);
    expect(row?.last_error).toMatch(/HTTP 500/);
  });

  it('records the error on a network throw, leaving the row unsent', async () => {
    await seedEvents(1);

    await drainOnce(throwPoster, CONFIG);

    const row = await OutboxEvent.findOne();
    expect(row?.sent_at).toBeNull();
    expect(row?.last_error).toMatch(/ECONNREFUSED/);
  });

  it('dead-letters after max attempts — never deletes, stays visible for replay', async () => {
    await seedEvents(1);

    // Fail it up to the threshold; the drainer claims and retries each pass.
    for (let i = 0; i < 5; i += 1) {
      await drainOnce(reject500, { ...CONFIG, maxAttempts: 3 });
    }

    const row = await OutboxEvent.findOne();
    expect(row?.sent_at).toBeNull();
    // Attempts cap at maxAttempts: once exhausted the drainer stops incrementing and treats it as
    // a dead letter rather than hammering the inbox forever.
    expect(Number(row?.attempts)).toBe(3);
  });

  it('a recovered inbox drains a previously-failed event (replay works)', async () => {
    await seedEvents(1);
    await drainOnce(reject500, CONFIG); // fails once
    expect((await OutboxEvent.findOne())?.attempts).toBe(1);

    const result = await drainOnce(accept, CONFIG); // inbox back up
    expect(result).toMatchObject({ sent: 1 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(0);
  });

  it('drains in batches, leaving the rest for the next pass', async () => {
    await seedEvents(5);

    const first = await drainOnce(accept, { ...CONFIG, batchSize: 2 });
    expect(first).toMatchObject({ claimed: 2, sent: 2 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(3);

    await drainOnce(accept, { ...CONFIG, batchSize: 10 });
    expect(await OutboxEvent.count({ where: { sent_at: null } })).toBe(0);
  });

  it('is a no-op when there is nothing to send', async () => {
    const result = await drainOnce(accept, CONFIG);
    expect(result).toEqual({ claimed: 0, sent: 0, failed: 0, deadLettered: 0 });
  });
});
