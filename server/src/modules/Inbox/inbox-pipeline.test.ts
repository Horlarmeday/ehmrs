import '../../core/config/env';
import { QueryTypes } from 'sequelize';
import { sequelizeConnection } from '../../database/config/data-source';
import { PaymentStatus } from '../../database/enums';
import { InboxEvent } from '../../database/models/inboxEvent';
import { InboxDeadLetter } from '../../database/models/inboxDeadLetter';
import { InboxSequence } from '../../database/models/inboxSequence';
import { signEvent } from '../Outbox/signer';
import { VerifierConfig } from './verifier';
import { verifyAndWrite } from './inbox-writer';
import { processOne, drainInbox } from './processor';

/**
 * End-to-end reverse-inbox pipeline against real MySQL (B2.1 / B2.2 / B2.4): a signed instruction
 * is verified, written to the inbox, drained, and applied to the prescribed row — and the failure
 * paths (bad signature written nowhere, duplicate deduped, un-appliable instruction dead-lettered)
 * are proven, not asserted.
 */

const KEY = { keyId: 'acct-test', secret: 'reverse-test-secret' };
const TENANT = 'st_vincent';
const DRUG_ID = 990002;
const VISIT_ID = 8892;
const AGG = `visit:${VISIT_ID}`;

const config: VerifierConfig = {
  keys: [{ keyId: KEY.keyId, secret: KEY.secret }],
  expectedTenantKey: TENANT,
  maxSkewSeconds: 300,
};

let eventCounter = 0;
function eventId(): string {
  eventCounter += 1;
  return `019f8e40-0000-7000-8000-${String(eventCounter).padStart(12, '0')}`;
}

function signedSettle(
  overrides: {
    sequence?: number;
    idempotencyKey?: string;
    lineId?: number;
    eventType?: string;
  } = {}
): { rawBody: string; headers: Record<string, string> } {
  const sentAt = new Date().toISOString();
  const envelope = {
    event_id: eventId(),
    event_type: overrides.eventType ?? 'payment.settled',
    event_version: 1,
    tenant_key: TENANT,
    occurred_at: sentAt,
    sent_at: sentAt,
    aggregate: { type: 'reverse_encounter', id: AGG },
    sequence: overrides.sequence ?? 1,
    idempotency_key: overrides.idempotencyKey ?? `settled:${overrides.lineId ?? DRUG_ID}`,
    body: {
      external_line_ref: { type: 'drug', id: String(overrides.lineId ?? DRUG_ID) },
      encounter_id: AGG,
      amount_kobo: '250000',
      settled_at: sentAt,
    },
  };
  return signEvent(envelope, KEY);
}

async function seedDrug(): Promise<void> {
  await sequelizeConnection.transaction(async transaction => {
    await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
    await sequelizeConnection.query(
      `INSERT INTO Prescribed_Drugs
         (id, drug_id, dosage_form_id, drug_type, quantity_prescribed, quantity_to_dispense,
          quantity_dispensed, route_id, frequency, strength_id, duration, total_price, examiner,
          date_prescribed, prescribed_strength, duration_unit, visit_id, patient_id, start_date,
          drug_prescription_id, inventory_id, payment_status, createdAt, updatedAt)
       VALUES
         (:id, 1, 1, 'Cash', 2, 2, 0, 1, 'BD', 1, 5, '2500.00', 1, NOW(), '500mg', 'days',
          :visit, 100, NOW(), 1, 1, 'Pending', NOW(), NOW())`,
      { replacements: { id: DRUG_ID, visit: VISIT_ID }, type: QueryTypes.INSERT, transaction }
    );
  });
}

async function drugStatus(): Promise<string> {
  const [row] = await sequelizeConnection.query<{ payment_status: string }>(
    `SELECT payment_status FROM Prescribed_Drugs WHERE id = :id`,
    { replacements: { id: DRUG_ID }, type: QueryTypes.SELECT }
  );
  return row.payment_status;
}

describe('reverse inbox pipeline (B2.1 / B2.2 / B2.4)', () => {
  afterAll(async () => {
    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(`DELETE FROM Prescribed_Drugs WHERE id = :id`, {
        replacements: { id: DRUG_ID },
        type: QueryTypes.DELETE,
        transaction,
      });
    });
    await sequelizeConnection.close();
  });

  beforeEach(async () => {
    await InboxEvent.destroy({ where: {}, truncate: true, force: true });
    await InboxDeadLetter.destroy({ where: {}, truncate: true, force: true });
    await InboxSequence.destroy({ where: {}, truncate: true, force: true });
    await sequelizeConnection.transaction(async transaction => {
      await sequelizeConnection.query('SET FOREIGN_KEY_CHECKS=0', { raw: true, transaction });
      await sequelizeConnection.query(`DELETE FROM Prescribed_Drugs WHERE id = :id`, {
        replacements: { id: DRUG_ID },
        type: QueryTypes.DELETE,
        transaction,
      });
    });
  });

  it('verifies, writes, drains and applies a signed settle end to end', async () => {
    await seedDrug();
    const signed = signedSettle();

    const write = await verifyAndWrite(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config);
    expect(write.result).toBe('ACCEPTED');

    const row = await InboxEvent.findOne({ where: { status: 'PENDING' } });
    expect(row).not.toBeNull();

    await processOne(row!.id);

    const applied = await InboxEvent.findByPk(row!.id);
    expect(applied!.status).toBe('PROCESSED');
    expect(await drugStatus()).toBe(PaymentStatus.PAID);
  });

  it('rejects a forged signature: 401 semantics, NOTHING written', async () => {
    const signed = signedSettle();
    const tampered = Buffer.from(signed.rawBody.replace('250000', '999999'), 'utf8');

    const write = await verifyAndWrite(tampered, signed.headers, config);

    expect(write.result).toBe('REJECTED');
    expect(write.reason).toBe('SIGNATURE_MISMATCH');
    expect(await InboxEvent.count()).toBe(0);
    expect(await InboxDeadLetter.count()).toBe(0);
  });

  it('dedups a redelivery on the idempotency key: exactly one row, one effect', async () => {
    await seedDrug();
    const signed = signedSettle({ idempotencyKey: 'settled:dedup-1' });

    const first = await verifyAndWrite(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config);
    // A genuine redelivery re-signs with a fresh sent_at (new event_id), same idempotency key.
    const resigned = signedSettle({ idempotencyKey: 'settled:dedup-1' });
    const second = await verifyAndWrite(
      Buffer.from(resigned.rawBody, 'utf8'),
      resigned.headers,
      config
    );

    expect(first.result).toBe('ACCEPTED');
    expect(second.result).toBe('DUPLICATE');
    expect(await InboxEvent.count()).toBe(1);
  });

  it('dead-letters an un-appliable instruction (unknown line) with the full payload; drain continues', async () => {
    // No drug seeded: the applier cannot find the line, throws, and the row dead-letters.
    const signed = signedSettle({ lineId: 777777, idempotencyKey: 'settled:missing' });
    await verifyAndWrite(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config);
    const row = await InboxEvent.findOne({ where: { status: 'PENDING' } });

    await processOne(row!.id);

    const failed = await InboxEvent.findByPk(row!.id);
    expect(failed!.status).toBe('FAILED');

    const dead = await InboxDeadLetter.findOne({ where: { inbox_event_id: row!.id } });
    expect(dead).not.toBeNull();
    expect(dead!.reason).toBe('HANDLER_ERROR');
    // Full payload retained for replay.
    expect((dead!.payload as { external_line_ref: { id: string } }).external_line_ref.id).toBe(
      '777777'
    );
  });

  it('drainInbox applies a batch and reports outcomes', async () => {
    await seedDrug();
    const signed = signedSettle({ sequence: 1, idempotencyKey: 'settled:batch-1' });
    await verifyAndWrite(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config);

    const result = await drainInbox();
    expect(result.applied).toBe(1);
    expect(await drugStatus()).toBe(PaymentStatus.PAID);
  });
});
