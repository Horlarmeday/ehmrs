import { createHash, createHmac } from 'crypto';

/**
 * Signs an outbound event exactly as ADR-0025 §5 specifies, to match the co-deployed Accounting
 * inbox's verification byte-for-byte.
 *
 * Base: `event_id + "\n" + tenant_key + "\n" + sent_at + "\n" + sha256(raw_body)`, where the hash
 * covers the RAW bytes POSTed. So the caller signs the exact serialised string it sends — a
 * re-serialisation could reorder keys and produce a different hash for an identical event.
 *
 * The drainer RE-SIGNS on every retry with a fresh `sent_at` (Q5.2): replaying the original
 * signature would fail once the 5-minute window closed. So `sent_at` is written into the body and
 * signed together, not signed separately.
 */

export interface SignedEvent {
  readonly rawBody: string;
  readonly headers: {
    'content-type': string;
    'x-ehmrs-signature': string;
    'x-ehmrs-key-id': string;
    'x-ehmrs-timestamp': string;
  };
}

export interface SigningKey {
  readonly keyId: string;
  readonly secret: string;
}

export class SigningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SigningError';
  }
}

function readString(envelope: Record<string, unknown>, key: string): string {
  const value = envelope[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new SigningError(`Cannot sign: envelope.${key} must be a non-empty string.`);
  }
  return value;
}

/**
 * @param envelope The full v1 envelope. `sent_at` must already be set to the value being sent;
 *   the signature covers it, so re-signing a retry means updating `sent_at` in the envelope first.
 */
export function signEvent(envelope: Record<string, unknown>, key: SigningKey): SignedEvent {
  const rawBody = JSON.stringify(envelope);

  const eventId = readString(envelope, 'event_id');
  const tenantKey = readString(envelope, 'tenant_key');
  const sentAt = readString(envelope, 'sent_at');

  const bodyHash = createHash('sha256')
    .update(Buffer.from(rawBody))
    .digest('hex');
  const base = [eventId, tenantKey, sentAt, bodyHash].join('\n');
  const signature = createHmac('sha256', key.secret)
    .update(base)
    .digest('hex');

  return {
    rawBody,
    headers: {
      'content-type': 'application/json',
      'x-ehmrs-signature': `v1=${signature}`,
      'x-ehmrs-key-id': key.keyId,
      'x-ehmrs-timestamp': sentAt,
    },
  };
}
