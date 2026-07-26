import { SigningKey, signEvent } from './signer';
import { uuidV7 } from './event-builder';
import { PrescribedLineType } from './prescribed-line-types';

/**
 * The synchronous, FAIL-CLOSED payment gate the EMR consults before releasing a gated service or
 * discharging (CONTEXT §"Gating vs. confirmation").
 *
 * Every way this call can fail to produce a definite `allow` — a block, a timeout, a transport
 * error, a non-2xx, an unparseable body — HOLDS. Holding a paid patient's drugs briefly is
 * recoverable; releasing an unpaid patient's is not. `cannot-verify` ("we could not establish the
 * payment state") is kept strictly distinct from `not-paid` ("the patient has not paid"): they are
 * different facts and lead staff to different actions, so they are never collapsed.
 *
 * Gated by EMR_GATE_CHECK_ENABLED. Off, the gate allows without calling, so this can land in
 * production inert — a fail-closed gate switched on before Accounting is reachable would block
 * every dispense and discharge in the hospital.
 */

const GATE_CHECK_TIMEOUT_MS = 5000;

export type GateCheckKind = 'settlement' | 'discharge';

export interface GateCheckLineRef {
  readonly type: PrescribedLineType;
  readonly id: string;
}

export interface GateCheckRequest {
  readonly kind: GateCheckKind;
  readonly encounter_id: string;
  readonly external_line_ref?: GateCheckLineRef;
}

export type GateCheckHold =
  | { readonly allowed: false; readonly reason: 'not-paid'; readonly detail?: string }
  | { readonly allowed: false; readonly reason: 'cannot-verify'; readonly detail: string };

export type GateCheckAllow = {
  readonly allowed: true;
  readonly reason: 'recorded-paid' | 'emergency-bypass' | 'override' | 'gate-disabled';
};

export type GateCheckResult = GateCheckAllow | GateCheckHold;

/** Narrows a result to a hold. `allowed` alone does not discriminate a union of object types. */
export function isHold(result: GateCheckResult): result is GateCheckHold {
  return !result.allowed;
}

/** How the gate-check is POSTed. Injected so tests drive the client without a live HTTP server. */
export type GatePoster = (
  url: string,
  body: string,
  headers: Record<string, string>
) => Promise<{ status: number; body: string }>;

const ALLOW_REASONS: ReadonlySet<string> = new Set([
  'recorded-paid',
  'emergency-bypass',
  'override',
]);

export function isGateCheckEnabled(): boolean {
  return process.env.EMR_GATE_CHECK_ENABLED === 'true';
}

function readEnvConfig(): { gateCheckUrl: string; tenantKey: string; signingKey: SigningKey } {
  const gateCheckUrl = process.env.EMR_ACCOUNTING_GATE_CHECK_URL;
  const keyId = process.env.EMR_OUTBOUND_KEY_ID;
  const secret = process.env.EMR_OUTBOUND_SECRET;
  if (!gateCheckUrl || !keyId || !secret) {
    throw new Error(
      'Gate check misconfigured: set EMR_ACCOUNTING_GATE_CHECK_URL, EMR_OUTBOUND_KEY_ID, ' +
        'EMR_OUTBOUND_SECRET.'
    );
  }
  return {
    gateCheckUrl,
    tenantKey: process.env.EMR_TENANT_KEY || 'default',
    signingKey: { keyId, secret },
  };
}

/**
 * Narrows the receiver's discriminated response without trusting its shape. An unrecognised kind or
 * reason is NOT an allow — a receiver that grows a new allow-reason must not have it silently
 * honoured by an old EMR, and a garbled body must never read as "paid".
 */
function interpretResponse(raw: string): GateCheckResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { allowed: false, reason: 'cannot-verify', detail: 'gate returned unparseable JSON' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { allowed: false, reason: 'cannot-verify', detail: 'gate returned a non-object' };
  }

  const body = parsed as { kind?: unknown; reason?: unknown };
  const { kind, reason } = body;

  if (kind === 'allow' && typeof reason === 'string' && ALLOW_REASONS.has(reason)) {
    return { allowed: true, reason: reason as 'recorded-paid' | 'emergency-bypass' | 'override' };
  }

  if (kind === 'blocked' && reason === 'not-paid') {
    return { allowed: false, reason: 'not-paid' };
  }

  if (kind === 'blocked' && reason === 'cannot-verify') {
    return {
      allowed: false,
      reason: 'cannot-verify',
      detail: 'accounting could not verify payment',
    };
  }

  return {
    allowed: false,
    reason: 'cannot-verify',
    detail: `gate returned an unrecognised decision (kind=${String(kind)}, reason=${String(
      reason
    )})`,
  };
}

/** The default poster: a real fetch with a bounded timeout, so a hung gate cannot hang a pharmacist. */
export const httpGatePoster: GatePoster = async (url, body, headers) => {
  const response = await fetch(url, {
    method: 'POST',
    body,
    headers,
    signal: AbortSignal.timeout(GATE_CHECK_TIMEOUT_MS),
  });
  return { status: response.status, body: await response.text() };
};

/**
 * Asks Accounting whether this line/encounter may be released.
 *
 * The request carries `event_id`, `tenant_key` and `sent_at` alongside the gate fields: the
 * receiver's HMAC verifier reads `event_id` and `tenant_key` OUT OF THE JSON BODY to build the
 * signature base, so a request without them is rejected as malformed before the gate is consulted.
 * The receiver's Zod object schema strips the extras. `sent_at` is fresh per call because the
 * verifier enforces a skew window on both edges.
 */
export async function checkGate(
  request: GateCheckRequest,
  poster: GatePoster = httpGatePoster
): Promise<GateCheckResult> {
  if (!isGateCheckEnabled()) {
    return { allowed: true, reason: 'gate-disabled' };
  }

  const { gateCheckUrl, tenantKey, signingKey } = readEnvConfig();

  const envelope: Record<string, unknown> = {
    event_id: uuidV7(),
    tenant_key: tenantKey,
    sent_at: new Date().toISOString(),
    kind: request.kind,
    encounter_id: request.encounter_id,
  };
  if (request.external_line_ref !== undefined) {
    envelope.external_line_ref = request.external_line_ref;
  }

  const signed = signEvent(envelope, signingKey);

  let response: { status: number; body: string };
  try {
    // The signature covers these exact bytes: POST rawBody verbatim, never a re-serialisation.
    response = await poster(gateCheckUrl, signed.rawBody, signed.headers);
  } catch (error) {
    return {
      allowed: false,
      reason: 'cannot-verify',
      detail: `gate unreachable: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (response.status < 200 || response.status >= 300) {
    return {
      allowed: false,
      reason: 'cannot-verify',
      detail: `gate returned HTTP ${response.status}`,
    };
  }

  return interpretResponse(response.body);
}

export const NOT_PAID_MESSAGE =
  'Payment for this item has not been recorded. Direct the patient to settle at the cash point ' +
  'before it is released.';

export const CANNOT_VERIFY_MESSAGE =
  'Payment status could not be verified with Accounting, so this cannot be released. This is NOT ' +
  'a confirmation that the patient has not paid — seek a supervisor override.';

/**
 * The staff-facing message for a hold. The two reasons read differently on purpose: conflating
 * "we cannot tell" with "they have not paid" sends staff to the wrong remedy.
 */
export function gateHoldMessage(result: GateCheckHold): string {
  return result.reason === 'not-paid' ? NOT_PAID_MESSAGE : CANNOT_VERIFY_MESSAGE;
}
