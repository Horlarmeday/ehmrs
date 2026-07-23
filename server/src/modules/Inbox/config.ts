import { VerifierConfig, VerificationKey } from './verifier';

/**
 * Reads the reverse-inbox verification config from the environment.
 *
 * PLACEHOLDER, like the outbox keys: ADR-0023 co-provisions these into local secret storage when
 * the EMR and Accounting are installed together; no slice has built that storage, so they arrive as
 * env for now. `EMR_INBOUND_KEY_ID`/`EMR_INBOUND_SECRET` are the key ACCOUNTING signs the reverse
 * direction with — a SEPARATE key from the outbox's outbound key (ADR-0025 Q5.5).
 */

export function isInboxEnabled(): boolean {
  return process.env.EMR_INBOX_ENABLED === 'true';
}

const DEFAULT_MAX_SKEW_SECONDS = 300;

export function readVerifierConfig(): VerifierConfig {
  const keyId = process.env.EMR_INBOUND_KEY_ID;
  const secret = process.env.EMR_INBOUND_SECRET;
  const expectedTenantKey = process.env.EMR_TENANT_KEY;

  if (!keyId || !secret || !expectedTenantKey) {
    throw new Error(
      'Inbox misconfigured: set EMR_INBOUND_KEY_ID, EMR_INBOUND_SECRET, EMR_TENANT_KEY.'
    );
  }

  const keys: VerificationKey[] = [{ keyId, secret }];
  const maxSkewSeconds = Number(process.env.EMR_EVENT_MAX_SKEW_SECONDS || DEFAULT_MAX_SKEW_SECONDS);

  return { keys, expectedTenantKey, maxSkewSeconds };
}
