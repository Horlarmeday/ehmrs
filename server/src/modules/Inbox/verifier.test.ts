import { signEvent } from '../Outbox/signer';
import { verifyReverseSignature, VerifierConfig } from './verifier';

/**
 * Pure tests for the reverse-signature verifier — no DB. The verifier and the outbox signer are two
 * implementations of ADR-0025 §5; signing with one and verifying with the other proves they agree
 * on the base. (Accounting's own signer is a third implementation; this proves OUR two agree.)
 */

const KEY = { keyId: 'acct-2026-07', secret: 'reverse-secret' };
const TENANT = 'st_vincent';

const config = (): VerifierConfig => ({
  keys: [{ keyId: KEY.keyId, secret: KEY.secret }],
  expectedTenantKey: TENANT,
  maxSkewSeconds: 300,
});

function envelope(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const sentAt = '2026-07-23T10:00:05.000Z';
  return {
    event_id: '019f8e38-38d4-70f0-abd6-e350d8427f5c',
    event_type: 'payment.settled',
    event_version: 1,
    tenant_key: TENANT,
    occurred_at: '2026-07-23T10:00:00.000Z',
    sent_at: sentAt,
    aggregate: { type: 'reverse_encounter', id: 'visit:8891' },
    sequence: 1,
    idempotency_key: 'settled:cl-1',
    body: { external_line_ref: { type: 'drug', id: '42' }, encounter_id: 'visit:8891' },
    ...overrides,
  };
}

describe('verifyReverseSignature', () => {
  it('accepts a signature the outbox signer produced (the two agree on §5)', () => {
    const env = envelope();
    const signed = signEvent(env, KEY);
    const now = new Date(String(env.sent_at));

    const result = verifyReverseSignature(
      Buffer.from(signed.rawBody, 'utf8'),
      signed.headers,
      config(),
      now
    );

    expect(result.ok).toBe(true);
    expect(result.keyId).toBe(KEY.keyId);
  });

  it('rejects a tampered body (SIGNATURE_MISMATCH)', () => {
    const env = envelope();
    const signed = signEvent(env, KEY);
    const now = new Date(String(env.sent_at));

    const tampered = Buffer.from(signed.rawBody.replace('"42"', '"99"'), 'utf8');
    const result = verifyReverseSignature(tampered, signed.headers, config(), now);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('SIGNATURE_MISMATCH');
  });

  it('rejects a wrong key id (UNKNOWN_KEY_ID)', () => {
    const env = envelope();
    const signed = signEvent(env, { keyId: 'someone-else', secret: KEY.secret });
    const now = new Date(String(env.sent_at));

    const result = verifyReverseSignature(
      Buffer.from(signed.rawBody, 'utf8'),
      signed.headers,
      config(),
      now
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('UNKNOWN_KEY_ID');
  });

  it('rejects an expired timestamp AND a future one (both window edges)', () => {
    const env = envelope();
    const signed = signEvent(env, KEY);
    const sentAt = new Date(String(env.sent_at));

    const expired = new Date(sentAt.getTime() + 6 * 60 * 1000);
    const future = new Date(sentAt.getTime() - 6 * 60 * 1000);

    expect(
      verifyReverseSignature(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config(), expired)
        .reason
    ).toBe('TIMESTAMP_OUTSIDE_WINDOW');
    expect(
      verifyReverseSignature(Buffer.from(signed.rawBody, 'utf8'), signed.headers, config(), future)
        .reason
    ).toBe('TIMESTAMP_OUTSIDE_WINDOW');
  });

  it('rejects a mismatched tenant_key AFTER the signature holds', () => {
    // Signed correctly, but with a tenant_key this deployment does not expect.
    const env = envelope({ tenant_key: 'some_other_hospital' });
    const signed = signEvent(env, KEY);
    const now = new Date(String(env.sent_at));

    const result = verifyReverseSignature(
      Buffer.from(signed.rawBody, 'utf8'),
      signed.headers,
      config(),
      now
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('TENANT_KEY_MISMATCH');
  });

  it('rejects missing signature headers (MALFORMED_HEADERS)', () => {
    const env = envelope();
    const signed = signEvent(env, KEY);
    const now = new Date(String(env.sent_at));

    const result = verifyReverseSignature(
      Buffer.from(signed.rawBody, 'utf8'),
      { 'x-ehmrs-key-id': KEY.keyId },
      config(),
      now
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('MALFORMED_HEADERS');
  });
});
