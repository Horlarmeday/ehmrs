import '../../core/config/env';
import { sequelizeConnection } from '../../database/config/data-source';
import { OutboxEvent } from '../../database/models/outboxEvent';
import { OutboxSequence } from '../../database/models/outboxSequence';
import { claimSequence, emitChargeCaptured, isOutboxEnabled } from './outbox-writer';

/**
 * Integration tests for the outbox writer, against real MySQL. The claims here — atomicity with
 * the caller's transaction, and a strictly-monotonic per-visit sequence under concurrency — are
 * claims about the DATABASE, so they cannot be unit-tested against a mock.
 */

const line = (overrides = {}) => ({
  type: 'drug' as const,
  id: 1,
  patient_id: 100,
  visit_id: 8891,
  amount: '2500.00',
  quantity: 2,
  service_date: '2026-07-22',
  ...overrides,
});

describe('outbox writer', () => {
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

  describe('feature flag', () => {
    it('is a no-op when disabled', async () => {
      process.env.EMR_OUTBOX_ENABLED = 'false';
      const t = await sequelizeConnection.transaction();
      const result = await emitChargeCaptured(line(), t);
      await t.commit();

      expect(result).toBeUndefined();
      // Scoped to THIS line's key, not a global count. These suites share one MySQL, so a bare
      // `count()` also sees rows another suite is mid-way through writing — which makes this
      // assertion fail for a reason that has nothing to do with the feature flag.
      expect(await OutboxEvent.count({ where: { idempotency_key: 'charge:drug:1' } })).toBe(0);
      process.env.EMR_OUTBOX_ENABLED = 'true';
    });
  });

  describe('atomicity — the whole reason an outbox exists', () => {
    it('rolls the outbox row back with the caller transaction', async () => {
      const t = await sequelizeConnection.transaction();
      await emitChargeCaptured(line(), t);
      // Simulate the clinical write failing AFTER the outbox row was written.
      await t.rollback();

      expect(await OutboxEvent.count()).toBe(0);
      // The sequence claim rolls back too, so a retried transaction reuses the number.
      expect(await OutboxSequence.count()).toBe(0);
    });

    it('commits the outbox row with the caller transaction', async () => {
      const t = await sequelizeConnection.transaction();
      await emitChargeCaptured(line(), t);
      await t.commit();

      expect(await OutboxEvent.count()).toBe(1);
      const row = await OutboxEvent.findOne();
      expect(row?.idempotency_key).toBe('charge:drug:1');
      expect(row?.aggregate_id).toBe('visit:8891');
      expect(row?.sent_at).toBeNull();
    });
  });

  describe('per-visit sequence', () => {
    it('increments monotonically for one visit', async () => {
      const seqs: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        const t = await sequelizeConnection.transaction();
        const s = await claimSequence('visit:8891', t);
        seqs.push(s);
        await t.commit();
      }
      expect(seqs).toEqual([1, 2, 3]);
    });

    it('keeps sequences independent across visits', async () => {
      const t1 = await sequelizeConnection.transaction();
      const a1 = await claimSequence('visit:1', t1);
      await t1.commit();

      const t2 = await sequelizeConnection.transaction();
      const b1 = await claimSequence('visit:2', t2);
      await t2.commit();

      // A busy visit must never advance a quiet one's counter.
      expect(a1).toBe(1);
      expect(b1).toBe(1);
    });

    it('assigns DISTINCT increasing sequences to CONCURRENT writes on the same visit', async () => {
      // The real race: two clinical writes to one visit at the same instant. The FOR UPDATE lock
      // must serialise them so neither reuses a number. A serial test would never catch a missing
      // lock; this opens real concurrent transactions.
      const concurrency = 6;
      const results = await Promise.all(
        Array.from({ length: concurrency }, async () => {
          const t = await sequelizeConnection.transaction();
          try {
            const s = await claimSequence('visit:777', t);
            await t.commit();
            return s;
          } catch (e) {
            await t.rollback();
            throw e;
          }
        })
      );

      const sorted = [...results].sort((a, b) => a - b);
      // No duplicates, contiguous 1..N — the lock held.
      expect(sorted).toEqual(Array.from({ length: concurrency }, (_, i) => i + 1));
    });
  });

  describe('idempotency', () => {
    it('rejects a second event with the same idempotency key', async () => {
      const t1 = await sequelizeConnection.transaction();
      await emitChargeCaptured(line(), t1);
      await t1.commit();

      const t2 = await sequelizeConnection.transaction();
      await expect(emitChargeCaptured(line(), t2)).rejects.toThrow();
      await t2.rollback();

      expect(await OutboxEvent.count()).toBe(1);
    });

    it('isOutboxEnabled reflects the flag', () => {
      expect(isOutboxEnabled()).toBe(true);
    });
  });
});
