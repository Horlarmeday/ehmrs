import { createHash, createHmac } from 'crypto';
import {
  CANNOT_VERIFY_MESSAGE,
  GatePoster,
  NOT_PAID_MESSAGE,
  checkGate,
  gateHoldMessage,
  isHold,
} from './gate-check';

/**
 * The gate is FAIL-CLOSED: every path that is not a definite `allow` must hold, and
 * `cannot-verify` must stay distinct from `not-paid`.
 *
 * The signature test reconstructs the Accounting verifier's base from ADR-0025 §5 INDEPENDENTLY
 * (as `contract-handshake.test.ts` does) rather than importing it — the verifier lives in another
 * repo, and a test that called it would agree by construction and could drift alongside it. The
 * sharp edge it guards: the receiver reads `event_id` and `tenant_key` OUT OF THE JSON BODY, so a
 * request carrying them only in headers is rejected before the gate is ever consulted.
 */

const KEY_ID = 'emr-2026-07';
const SECRET = 'shared-secret-abc';
const TENANT_KEY = 'lagoon_general';
const GATE_URL = 'http://127.0.0.1:4000/integration/emr/gate-check';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.EMR_GATE_CHECK_ENABLED = 'true';
  process.env.EMR_ACCOUNTING_GATE_CHECK_URL = GATE_URL;
  process.env.EMR_OUTBOUND_KEY_ID = KEY_ID;
  process.env.EMR_OUTBOUND_SECRET = SECRET;
  process.env.EMR_TENANT_KEY = TENANT_KEY;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

/** A poster that replies with a fixed status/body and captures what it was sent. */
function posterReplying(
  status: number,
  body: string
): { poster: GatePoster; sent: { url?: string; body?: string; headers?: Record<string, string> } } {
  const sent: { url?: string; body?: string; headers?: Record<string, string> } = {};
  const poster: GatePoster = async (url, requestBody, headers) => {
    sent.url = url;
    sent.body = requestBody;
    sent.headers = headers;
    return { status, body };
  };
  return { poster, sent };
}

const allow = (reason: string) => JSON.stringify({ kind: 'allow', reason });
const blocked = (reason: string) => JSON.stringify({ kind: 'blocked', reason });

describe('checkGate — allow paths', () => {
  it.each(['recorded-paid', 'emergency-bypass', 'override'])('allows on %s', async reason => {
    const { poster } = posterReplying(200, allow(reason));

    const result = await checkGate(
      {
        kind: 'settlement',
        encounter_id: 'visit:8891',
        external_line_ref: { type: 'drug', id: '1' },
      },
      poster
    );

    expect(result).toEqual({ allowed: true, reason });
  });
});

describe('checkGate — fails closed', () => {
  it('holds on not-paid, and reports it as not-paid', async () => {
    const { poster } = posterReplying(200, blocked('not-paid'));

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not-paid');
  });

  it('holds on cannot-verify WITHOUT conflating it with not-paid', async () => {
    const { poster } = posterReplying(200, blocked('cannot-verify'));

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('cannot-verify');
    expect(result.reason).not.toBe('not-paid');
  });

  it('holds as cannot-verify when the gate is unreachable', async () => {
    const poster: GatePoster = async () => {
      throw new Error('ECONNREFUSED');
    };

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });

  it('holds as cannot-verify when the request times out', async () => {
    const poster: GatePoster = async () => {
      throw Object.assign(new Error('The operation was aborted due to timeout'), {
        name: 'TimeoutError',
      });
    };

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });

  it.each([401, 404, 500, 503])('holds as cannot-verify on HTTP %s', async status => {
    const { poster } = posterReplying(status, '');

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });

  it('holds as cannot-verify on an unparseable body', async () => {
    const { poster } = posterReplying(200, '<html>gateway error</html>');

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });

  it('does NOT honour an allow-reason it does not recognise', async () => {
    // An old EMR must not silently release on a reason a newer receiver invented.
    const { poster } = posterReplying(200, allow('some-future-reason'));

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });

  it('does not read a garbled decision as paid', async () => {
    const { poster } = posterReplying(200, JSON.stringify({ ok: true }));

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toMatchObject({ allowed: false, reason: 'cannot-verify' });
  });
});

describe('checkGate — flag', () => {
  it('allows without calling when the gate is disabled', async () => {
    process.env.EMR_GATE_CHECK_ENABLED = 'false';
    let called = false;
    const poster: GatePoster = async () => {
      called = true;
      return { status: 200, body: blocked('not-paid') };
    };

    const result = await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    expect(result).toEqual({ allowed: true, reason: 'gate-disabled' });
    expect(called).toBe(false);
  });

  it('fails fast when enabled but unconfigured', async () => {
    delete process.env.EMR_ACCOUNTING_GATE_CHECK_URL;
    const { poster } = posterReplying(200, allow('recorded-paid'));

    await expect(
      checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster)
    ).rejects.toThrow(/EMR_ACCOUNTING_GATE_CHECK_URL/);
  });
});

describe('checkGate — the signed request the receiver will verify', () => {
  it('carries event_id and tenant_key IN THE BODY, where the verifier reads them', async () => {
    const { poster, sent } = posterReplying(200, allow('recorded-paid'));

    await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    const body = JSON.parse(sent.body as string);
    expect(typeof body.event_id).toBe('string');
    expect(body.tenant_key).toBe(TENANT_KEY);
    expect(typeof body.sent_at).toBe('string');
  });

  it('produces a signature the ADR-0025 §5 verifier accepts over the exact bytes POSTed', async () => {
    const { poster, sent } = posterReplying(200, allow('recorded-paid'));

    await checkGate(
      {
        kind: 'settlement',
        encounter_id: 'visit:8891',
        external_line_ref: { type: 'drug', id: '1' },
      },
      poster
    );

    const rawBody = sent.body as string;
    const headers = sent.headers as Record<string, string>;
    const parsed = JSON.parse(rawBody);

    // Reconstruct the base the receiver builds: event_id + tenant_key + timestamp header +
    // sha256(raw bytes as received).
    const bodyHash = createHash('sha256')
      .update(Buffer.from(rawBody))
      .digest('hex');
    const base = [parsed.event_id, parsed.tenant_key, headers['x-ehmrs-timestamp'], bodyHash].join(
      '\n'
    );
    const expected = createHmac('sha256', SECRET)
      .update(base)
      .digest('hex');

    expect(headers['x-ehmrs-signature']).toBe(`v1=${expected}`);
    expect(headers['x-ehmrs-key-id']).toBe(KEY_ID);
    // The timestamp header and the body's sent_at must agree — the base mixes both sources.
    expect(headers['x-ehmrs-timestamp']).toBe(parsed.sent_at);
  });

  it('sends a fresh sent_at per call, so the skew window cannot expire mid-shift', async () => {
    const { poster, sent } = posterReplying(200, allow('recorded-paid'));

    await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);
    const first = JSON.parse(sent.body as string).sent_at;
    await new Promise(resolve => setTimeout(resolve, 5));
    await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);
    const second = JSON.parse(sent.body as string).sent_at;

    expect(Date.parse(second)).toBeGreaterThanOrEqual(Date.parse(first));
    expect(Math.abs(Date.now() - Date.parse(second))).toBeLessThan(5000);
  });

  it('sends the gate fields the receiver schema requires, and omits the line ref on discharge', async () => {
    const { poster, sent } = posterReplying(200, allow('recorded-paid'));

    await checkGate({ kind: 'discharge', encounter_id: 'visit:8891' }, poster);

    const body = JSON.parse(sent.body as string);
    expect(body.kind).toBe('discharge');
    expect(body.encounter_id).toBe('visit:8891');
    expect(body).not.toHaveProperty('external_line_ref');
    expect(sent.url).toBe(GATE_URL);
  });

  it('carries no demographics (ADR-0016)', async () => {
    const { poster, sent } = posterReplying(200, allow('recorded-paid'));

    await checkGate(
      {
        kind: 'settlement',
        encounter_id: 'visit:8891',
        external_line_ref: { type: 'drug', id: '1' },
      },
      poster
    );

    const body = JSON.parse(sent.body as string);
    expect(Object.keys(body).sort()).toEqual(
      ['encounter_id', 'event_id', 'external_line_ref', 'kind', 'sent_at', 'tenant_key'].sort()
    );
  });
});

describe('gateHoldMessage', () => {
  it('tells staff to collect payment on not-paid', () => {
    expect(gateHoldMessage({ allowed: false, reason: 'not-paid' })).toBe(NOT_PAID_MESSAGE);
  });

  it('does NOT accuse the patient of non-payment when the state is merely unverifiable', () => {
    const message = gateHoldMessage({
      allowed: false,
      reason: 'cannot-verify',
      detail: 'gate unreachable',
    });

    expect(message).toBe(CANNOT_VERIFY_MESSAGE);
    expect(message).not.toBe(NOT_PAID_MESSAGE);
    expect(message).toMatch(/NOT a confirmation/i);
  });
});

describe('isHold', () => {
  it('narrows allows and holds', () => {
    expect(isHold({ allowed: true, reason: 'recorded-paid' })).toBe(false);
    expect(isHold({ allowed: false, reason: 'not-paid' })).toBe(true);
  });
});
