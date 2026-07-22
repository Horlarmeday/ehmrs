import { createHash, createHmac } from 'crypto';
import { signEvent } from './signer';

/**
 * The signer must match the Accounting inbox's verification byte-for-byte, so these vectors
 * reconstruct the ADR-0025 §5 base INDEPENDENTLY (not by calling signEvent) and assert signEvent
 * agrees. Written from the ADR rather than from the implementation, they fail if the signer drifts
 * from the contract — which is exactly when the real inbox would start returning 401.
 */
describe('signEvent', () => {
  const key = { keyId: 'emr-2026-07', secret: 'a-shared-secret' };

  const envelope = {
    event_id: '018f7c9a-1b2c-7d3e-8f4a-5b6c7d8e9f01',
    event_type: 'charge.captured',
    event_version: 1,
    tenant_key: 'lagoon_general',
    occurred_at: '2026-07-22T09:14:22.113Z',
    sent_at: '2026-07-22T09:14:22.500Z',
    aggregate: { type: 'encounter', id: 'visit:8891' },
    sequence: 42,
    idempotency_key: 'charge:drug:1',
    body: { external_line_ref: { type: 'drug', id: '1' }, amount_kobo: '250000' },
  };

  it('signs over sha256 of the exact raw body, per ADR-0025 §5', () => {
    const signed = signEvent(envelope, key);

    // Independently recompute the base the receiver will reconstruct from the raw bytes.
    const bodyHash = createHash('sha256')
      .update(Buffer.from(signed.rawBody))
      .digest('hex');
    const base = [
      '018f7c9a-1b2c-7d3e-8f4a-5b6c7d8e9f01',
      'lagoon_general',
      '2026-07-22T09:14:22.500Z',
      bodyHash,
    ].join('\n');
    const expected = createHmac('sha256', key.secret)
      .update(base)
      .digest('hex');

    expect(signed.headers['x-ehmrs-signature']).toBe(`v1=${expected}`);
  });

  it('emits the key id and timestamp headers the receiver reads before the body', () => {
    const signed = signEvent(envelope, key);

    expect(signed.headers['x-ehmrs-key-id']).toBe('emr-2026-07');
    expect(signed.headers['x-ehmrs-timestamp']).toBe('2026-07-22T09:14:22.500Z');
  });

  it('hashes the SAME bytes it returns as rawBody', () => {
    const signed = signEvent(envelope, key);
    // The receiver hashes the bytes it received; a mismatch here is a guaranteed 401.
    const rehash = createHash('sha256')
      .update(Buffer.from(signed.rawBody))
      .digest('hex');
    const [, presented] = signed.headers['x-ehmrs-signature'].split('=');
    const base = [envelope.event_id, envelope.tenant_key, envelope.sent_at, rehash].join('\n');
    expect(
      createHmac('sha256', key.secret)
        .update(base)
        .digest('hex')
    ).toBe(presented);
  });

  it('produces a DIFFERENT signature when sent_at changes (a re-signed retry)', () => {
    const first = signEvent(envelope, key);
    const retry = signEvent({ ...envelope, sent_at: '2026-07-22T09:20:00.000Z' }, key);

    expect(retry.headers['x-ehmrs-signature']).not.toBe(first.headers['x-ehmrs-signature']);
    expect(retry.headers['x-ehmrs-timestamp']).toBe('2026-07-22T09:20:00.000Z');
  });

  it('refuses to sign an envelope missing a base field', () => {
    const { tenant_key: _omitted, ...incomplete } = envelope;
    expect(() => signEvent(incomplete, key)).toThrow(/tenant_key/);
  });
});
