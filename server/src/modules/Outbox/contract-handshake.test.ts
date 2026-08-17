import { createHash, createHmac } from 'crypto';
import {
  buildChargeCapturedEvent,
  buildChargeReversalRequestedEvent,
  buildChargeVoidedEvent,
  buildEncounterClosedEvent,
  buildPatientDemographicsChangedEvent,
} from './event-builder';
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
const ALLOWED_PAYER_KEYS = new Set([
  'payer_type',
  'scheme_id',
  'hmo_id',
  'retainership_id',
  'patient_insurance_id',
]);
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
  patient_insurance_id?: string;
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

  it('accepts patient_insurance_id on a scheme_hmo payer (ADR-0037)', () => {
    expect(
      payerPassesAccountingGuard(
        buildPayerBody({
          payer_type: 'scheme_hmo',
          scheme_id: '3',
          hmo_id: '7',
          patient_insurance_id: '412',
        })
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

  it('a signed charge.voided is ACCEPTED by the verifier', () => {
    const row = buildChargeVoidedEvent(
      { type: 'drug', id: 42, visit_id: 8891 },
      { tenantKey: TENANT_KEY, sequence: 43 }
    );
    const signed = signEvent(row.payload, SHARED_KEY);
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: true,
      keyId: SHARED_KEY.keyId,
    });
  });

  it('a signed charge.reversal.requested is ACCEPTED by the verifier', () => {
    const row = buildChargeReversalRequestedEvent(
      { type: 'drug', id: 42, visit_id: 8891, reason: 'WRONG_PATIENT' },
      { tenantKey: TENANT_KEY, sequence: 45 }
    );
    const signed = signEvent(row.payload, SHARED_KEY);
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: true,
      keyId: SHARED_KEY.keyId,
    });
  });

  it('a signed encounter.closed is ACCEPTED by the verifier', () => {
    const row = buildEncounterClosedEvent(
      { visit_id: 8891 },
      { tenantKey: TENANT_KEY, sequence: 44 }
    );
    const signed = signEvent(row.payload, SHARED_KEY);
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: true,
      keyId: SHARED_KEY.keyId,
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

/**
 * `patient.demographics.changed` must satisfy Accounting's ENVELOPE guard (Accounting #43,
 * ADR-0030), which is stricter than it looks: `aggregate.type` is a closed enum, so the second
 * aggregate type is exactly where this can silently break. An envelope Accounting rejects is
 * dead-lettered as MALFORMED_ENVELOPE before any handler runs — a failure that would surface as
 * "the cache is mysteriously empty", not as an error at the send site.
 *
 * Reconstructed from Accounting's `envelopeSchema`, not imported, for the reason given at the top
 * of this file.
 */
function envelopePassesAccountingGuard(payload: Record<string, unknown>): true | string {
  const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (typeof payload.event_id !== 'string' || !uuidV7Pattern.test(payload.event_id)) {
    return 'event_id must be a UUIDv7';
  }
  if (payload.event_type !== 'patient.demographics.changed') {
    return 'event_type must be an inbound type';
  }
  if (typeof payload.event_version !== 'number' || payload.event_version < 1) {
    return 'event_version must be a positive integer';
  }
  if (typeof payload.tenant_key !== 'string' || payload.tenant_key.length === 0) {
    return 'tenant_key is required';
  }
  for (const field of ['occurred_at', 'sent_at']) {
    const value = payload[field];
    if (typeof value !== 'string' || !value.includes('T') || Number.isNaN(Date.parse(value))) {
      return `${field} must be an ISO-8601 instant`;
    }
  }

  const aggregate = payload.aggregate as Record<string, unknown> | undefined;
  if (!aggregate || (aggregate.type !== 'encounter' && aggregate.type !== 'patient')) {
    return 'aggregate.type must be "encounter" or "patient"';
  }
  if (typeof aggregate.id !== 'string' || aggregate.id.length === 0) {
    return 'aggregate.id is required';
  }
  if (typeof payload.sequence !== 'number' || payload.sequence < 0) {
    return 'sequence must be a non-negative integer';
  }
  if (typeof payload.idempotency_key !== 'string' || payload.idempotency_key.length > 200) {
    return 'idempotency_key must be a string of at most 200 chars';
  }
  return true;
}

describe('patient.demographics.changed passes the Accounting envelope guard (#43)', () => {
  const built = () =>
    buildPatientDemographicsChangedEvent(
      {
        patient_id: 100,
        first_name: 'Chinelo',
        middle_name: null,
        last_name: 'Nwosu',
        date_of_birth: '1990-01-15',
        hospital_number: 'PSSH/023555',
        phone: '+2348012345678',
        insurances: [
          { patient_insurance_id: 412, enrollee_code: 'NHIS-99', hmo_id: 7, is_default: true },
        ],
      },
      { tenantKey: TENANT_KEY, sequence: 42 }
    );

  it('is accepted on the patient aggregate — the ADR-0030 widening', () => {
    expect(envelopePassesAccountingGuard(built().payload)).toBe(true);
  });

  it('is signed and verified like any other event — one transport, no special case', () => {
    const signed = signEvent(built().payload, SHARED_KEY);
    expect(verifyLikeAccounting(Buffer.from(signed.rawBody), signed.headers)).toEqual({
      ok: true,
      keyId: SHARED_KEY.keyId,
    });
  });

  it('would be REJECTED on an aggregate type outside the closed set', () => {
    const payload = { ...built().payload, aggregate: { type: 'person', id: 'person:100' } };
    expect(envelopePassesAccountingGuard(payload)).toBe(
      'aggregate.type must be "encounter" or "patient"'
    );
  });
});
