import { createHash, createHmac } from 'crypto';
import { buildChargeCapturedEvent } from './event-builder';
import { signEvent } from './signer';

/**
 * The handshake: an event this outbox builds and signs must be ACCEPTED by the Accounting inbox,
 * and a tampered one REJECTED.
 *
 * The Accounting verifier lives in a separate repo, so this reimplements its ADR-0025 §5 check
 * from the spec (not from that code) and asserts our signer satisfies it. It is deliberately a
 * second, independent implementation: if it merely called the real verifier, the two would agree
 * by construction and could drift from the contract together. Written from the ADR, it fails when
 * either side leaves the contract — which is exactly when the live inbox would return 401.
 *
 * (A true cross-repo check — sign here, verify with the real Accounting code — was run by hand
 * during development and returned { ok: true }; this is its always-on, in-repo guardian.)
 */

const SHARED_KEY = { keyId: 'emr-2026-07', secret: 'shared-secret-abc' };
const TENANT_KEY = 'lagoon_general';
const MAX_SKEW_SECONDS = 300;

type VerifyResult = { ok: true; keyId: string } | { ok: false; reason: string };

/** ADR-0025 §5 verification, reconstructed from the spec. Mirrors the Accounting inbox. */
function verifyLikeAccounting(
  rawBody: Buffer,
  headers: Record<string, string>,
  now: Date = new Date()
): VerifyResult {
  const signatureHeader = headers['x-ehmrs-signature'];
  const keyId = headers['x-ehmrs-key-id'];
  const timestamp = headers['x-ehmrs-timestamp'];
  if (!signatureHeader || !keyId || !timestamp) {
    return { ok: false, reason: 'MALFORMED_HEADERS' };
  }

  const match = /^v1=([0-9a-f]+)$/.exec(signatureHeader);
  if (!match) {
    return { ok: false, reason: 'MALFORMED_HEADERS' };
  }
  const presented = match[1];

  const sentAtMs = Date.parse(timestamp);
  if (Number.isNaN(sentAtMs) || Math.abs(now.getTime() - sentAtMs) > MAX_SKEW_SECONDS * 1000) {
    return { ok: false, reason: 'TIMESTAMP_OUTSIDE_WINDOW' };
  }

  if (keyId !== SHARED_KEY.keyId) {
    return { ok: false, reason: 'UNKNOWN_KEY_ID' };
  }

  const parsed = JSON.parse(rawBody.toString('utf8')) as { event_id: string; tenant_key: string };
  const bodyHash = createHash('sha256')
    .update(rawBody)
    .digest('hex');
  const base = [parsed.event_id, parsed.tenant_key, timestamp, bodyHash].join('\n');
  const expected = createHmac('sha256', SHARED_KEY.secret)
    .update(base)
    .digest('hex');

  if (presented !== expected) {
    return { ok: false, reason: 'SIGNATURE_MISMATCH' };
  }
  if (parsed.tenant_key !== TENANT_KEY) {
    return { ok: false, reason: 'TENANT_KEY_MISMATCH' };
  }
  return { ok: true, keyId };
}

function buildAndSign() {
  const row = buildChargeCapturedEvent(
    {
      type: 'drug',
      id: 1,
      patient_id: 100,
      visit_id: 8891,
      amount: '2500.00',
      quantity: 2,
      service_date: '2026-07-22',
    },
    { tenantKey: TENANT_KEY, sequence: 42 }
  );
  return signEvent(row.payload, SHARED_KEY);
}

/**
 * Mirrors Accounting's `chargeCapturedPayerSchema` (event-contract.ts, ADR-0028), reconstructed
 * from the contract — not imported, for the same independence reason as the verifier above.
 * `payer_type` is one of the three literals; each id, when present, is a non-empty string; and no
 * key outside the four the schema allows may appear.
 */
const ALLOWED_PAYER_KEYS = new Set(['payer_type', 'scheme_id', 'hmo_id', 'retainership_id']);
const PAYER_TYPES = new Set(['cash', 'scheme_hmo', 'retainership']);

function payerPassesAccountingGuard(payer: unknown): boolean {
  if (typeof payer !== 'object' || payer === null) return false;
  const p = payer as Record<string, unknown>;
  if (!PAYER_TYPES.has(p.payer_type as string)) return false;
  for (const key of Object.keys(p)) {
    if (!ALLOWED_PAYER_KEYS.has(key)) return false;
    if (key === 'payer_type') continue;
    if (typeof p[key] !== 'string' || (p[key] as string).length === 0) return false;
  }
  return true;
}

function buildPayerBody(payer: {
  payer_type: 'cash' | 'scheme_hmo' | 'retainership';
  scheme_id?: string;
  hmo_id?: string;
  retainership_id?: string;
}) {
  const row = buildChargeCapturedEvent(
    {
      type: 'drug',
      id: 1,
      patient_id: 100,
      visit_id: 8891,
      amount: '2500.00',
      quantity: 2,
      service_date: '2026-07-22',
      payer,
    },
    { tenantKey: TENANT_KEY, sequence: 42 }
  );
  return (row.payload.body as Record<string, unknown>).payer;
}

describe('charge.captured payer passes Accounting chargeCapturedPayerSchema (#114)', () => {
  it('accepts a scheme_hmo payer with scheme_id and hmo_id', () => {
    expect(
      payerPassesAccountingGuard(
        buildPayerBody({ payer_type: 'scheme_hmo', scheme_id: '3', hmo_id: '7' })
      )
    ).toBe(true);
  });

  it('accepts a retainership payer keyed by the company hmo id', () => {
    expect(
      payerPassesAccountingGuard(
        buildPayerBody({ payer_type: 'retainership', retainership_id: '42' })
      )
    ).toBe(true);
  });

  it('a cash line carries no payer, which the schema accepts as absent', () => {
    const row = buildChargeCapturedEvent(
      {
        type: 'drug',
        id: 1,
        patient_id: 100,
        visit_id: 8891,
        amount: '2500.00',
        quantity: 2,
        service_date: '2026-07-22',
      },
      { tenantKey: TENANT_KEY, sequence: 42 }
    );
    expect('payer' in (row.payload.body as Record<string, unknown>)).toBe(false);
  });
});

describe('EMR outbox ↔ Accounting inbox handshake', () => {
  it('a signed event is ACCEPTED by the verifier', () => {
    const signed = buildAndSign();
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: true,
      keyId: 'emr-2026-07',
    });
  });

  it('a tampered body is REJECTED', () => {
    const signed = buildAndSign();
    const tampered = signed.rawBody.replace('250000', '999999');
    expect(verifyLikeAccounting(Buffer.from(tampered), signed.headers)).toEqual({
      ok: false,
      reason: 'SIGNATURE_MISMATCH',
    });
  });

  it('a signature made with the wrong secret is REJECTED', () => {
    const row = buildChargeCapturedEvent(
      {
        type: 'drug',
        id: 1,
        patient_id: 100,
        visit_id: 8891,
        amount: '2500.00',
        quantity: 2,
        service_date: '2026-07-22',
      },
      { tenantKey: TENANT_KEY, sequence: 42 }
    );
    const signed = signEvent(row.payload, { keyId: 'emr-2026-07', secret: 'WRONG' });
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: false,
      reason: 'SIGNATURE_MISMATCH',
    });
  });

  it('an expired timestamp is REJECTED', () => {
    const signed = buildAndSign();
    const later = new Date(Date.parse(signed.headers['x-ehmrs-timestamp']) + 6 * 60 * 1000);
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers, later)).toEqual({
      ok: false,
      reason: 'TIMESTAMP_OUTSIDE_WINDOW',
    });
  });
});
