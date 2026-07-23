import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies a reverse (Accounting → EMR) instruction's HMAC — the mirror of the outbox `signEvent`,
 * and byte-for-byte identical to Accounting's own inbound verifier (ADR-0025 §5).
 *
 * Base: `event_id + "\n" + tenant_key + "\n" + sent_at + "\n" + sha256(raw_body)`, hashed over the
 * bytes AS RECEIVED. Hashing the raw body rather than a re-serialisation sidesteps JSON key-order
 * entirely — two serialisers ordering keys differently would otherwise disagree for identical
 * events.
 *
 * Order is cheap-rejections-first (headers, window, key lookup) so junk costs little, with the HMAC
 * computed only once a request is otherwise plausible. `tenant_key` is verified and REJECTED on
 * mismatch, AFTER the signature holds — on an unsigned request, checking it first would leak
 * whether a guessed tenant_key was right. It is sender authentication of one provisioned pair, not
 * tenant discrimination: ADR-0023/ADR-0026 leave one hospital, one database.
 *
 * A SEPARATE key from the EMR's OUTBOUND direction (ADR-0025 Q5.5): the key Accounting signs with
 * is the key we verify with here, and it is not the one we sign our own outbox with.
 */

export type VerificationFailure =
  | 'MALFORMED_HEADERS'
  | 'MALFORMED_BODY'
  | 'TIMESTAMP_OUTSIDE_WINDOW'
  | 'UNKNOWN_KEY_ID'
  | 'SIGNATURE_MISMATCH'
  | 'TENANT_KEY_MISMATCH';

export interface VerificationKey {
  readonly keyId: string;
  readonly secret: string;
}

export interface VerifierConfig {
  readonly keys: readonly VerificationKey[];
  readonly expectedTenantKey: string;
  readonly maxSkewSeconds: number;
}

/**
 * A FLAT result rather than a discriminated union: this repo compiles with `strict` off, and
 * without `strictNullChecks` TypeScript will not narrow a union on its `ok` discriminant — a caller
 * reading `result.reason` after `if (!result.ok)` would not see the field. The flat shape sidesteps
 * that entirely. On failure `reason` is set and the rest undefined; on success the reverse.
 */
export interface VerificationResult {
  readonly ok: boolean;
  readonly reason?: VerificationFailure;
  readonly keyId?: string;
  readonly parsedBody?: Record<string, unknown>;
}

const SIGNATURE_PATTERN = /^v1=([0-9a-f]+)$/;

function header(headers: Record<string, unknown>, name: string): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function envelopeIdentity(parsed: unknown): { eventId: string; tenantKey: string } | undefined {
  if (typeof parsed !== 'object' || parsed === null) {
    return undefined;
  }
  const record = parsed as Record<string, unknown>;
  const eventId = record.event_id;
  const tenantKey = record.tenant_key;
  if (typeof eventId !== 'string' || typeof tenantKey !== 'string') {
    return undefined;
  }
  return { eventId, tenantKey };
}

function hexEqual(a: string, b: string): boolean {
  // Compare as fixed-width buffers: timingSafeEqual throws on a length mismatch, and the throw
  // would itself be the timing signal we are trying not to emit.
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

export function verifyReverseSignature(
  rawBody: Buffer,
  headers: Record<string, unknown>,
  config: VerifierConfig,
  now: Date = new Date()
): VerificationResult {
  const signatureHeader = header(headers, 'x-ehmrs-signature');
  const keyIdHeader = header(headers, 'x-ehmrs-key-id');
  const timestampHeader = header(headers, 'x-ehmrs-timestamp');

  if (!signatureHeader || !keyIdHeader || !timestampHeader) {
    return { ok: false, reason: 'MALFORMED_HEADERS' };
  }

  const signatureMatch = SIGNATURE_PATTERN.exec(signatureHeader);
  if (signatureMatch === null) {
    return { ok: false, reason: 'MALFORMED_HEADERS' };
  }
  const presentedSignature = signatureMatch[1];

  const sentAtMs = Date.parse(timestampHeader);
  if (Number.isNaN(sentAtMs)) {
    return { ok: false, reason: 'MALFORMED_HEADERS' };
  }

  // Both edges matter: a replay attacker controls the timestamp they claim, so a far-future
  // sent_at would otherwise buy an arbitrarily long replay window.
  if (Math.abs(now.getTime() - sentAtMs) > config.maxSkewSeconds * 1000) {
    return { ok: false, reason: 'TIMESTAMP_OUTSIDE_WINDOW' };
  }

  const key = config.keys.find(candidate => candidate.keyId === keyIdHeader);
  if (key === undefined) {
    return { ok: false, reason: 'UNKNOWN_KEY_ID' };
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return { ok: false, reason: 'MALFORMED_BODY' };
  }

  const identity = envelopeIdentity(parsedBody);
  if (identity === undefined) {
    return { ok: false, reason: 'MALFORMED_BODY' };
  }

  const bodyHash = createHash('sha256')
    .update(rawBody)
    .digest('hex');
  const base = [identity.eventId, identity.tenantKey, timestampHeader, bodyHash].join('\n');
  const expected = createHmac('sha256', key.secret)
    .update(base)
    .digest('hex');

  if (!hexEqual(presentedSignature, expected)) {
    return { ok: false, reason: 'SIGNATURE_MISMATCH' };
  }

  if (identity.tenantKey !== config.expectedTenantKey) {
    return { ok: false, reason: 'TENANT_KEY_MISMATCH' };
  }

  return { ok: true, keyId: key.keyId, parsedBody: parsedBody as Record<string, unknown> };
}
