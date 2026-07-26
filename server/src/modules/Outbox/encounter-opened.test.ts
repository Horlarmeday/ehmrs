import {
  buildEncounterOpenedEvent,
  encounterOpenedIdempotencyKey,
  buildChargeCapturedEvent,
} from './event-builder';

/**
 * `encounter.opened` must satisfy the Accounting receiver's guard
 * (`encounterOpenedBodySchema` = `{ emergency: z.boolean().optional() }`) and its LATCH semantics:
 * the handler acts only on `emergency === true` and has no path that clears the flag.
 */

const context = {
  tenantKey: 'lagoon_general',
  sequence: 7,
  occurredAt: new Date('2026-07-26T10:00:00.000Z'),
  sentAt: new Date('2026-07-26T10:00:01.000Z'),
};

describe('encounterOpenedIdempotencyKey', () => {
  it('is deterministic on the visit, so a redelivery dedupes at the inbox', () => {
    expect(encounterOpenedIdempotencyKey(8891)).toBe('encounter-opened:8891');
    expect(encounterOpenedIdempotencyKey(8891)).toBe(encounterOpenedIdempotencyKey('8891'));
  });
});

describe('buildEncounterOpenedEvent', () => {
  it('emits { emergency: true } for an emergency visit', () => {
    const row = buildEncounterOpenedEvent({ visit_id: 8891, emergency: true }, context);

    expect(row.event_type).toBe('encounter.opened');
    expect(row.payload.body).toEqual({ emergency: true });
  });

  it('emits an empty body for a routine visit — never an explicit false', () => {
    const row = buildEncounterOpenedEvent({ visit_id: 8891, emergency: false }, context);

    // A `false` is indistinguishable from absent at the receiver; emitting one would imply an
    // encounter can be corrected back to routine, which the latch makes impossible.
    expect(row.payload.body).toEqual({});
    expect(Object.keys(row.payload.body as Record<string, unknown>)).not.toContain('emergency');
  });

  it('carries the flag and nothing else — no patient, no category, no demographics (ADR-0016)', () => {
    const row = buildEncounterOpenedEvent({ visit_id: 8891, emergency: true }, context);
    const serialised = JSON.stringify(row.payload.body);

    expect(Object.keys(row.payload.body as Record<string, unknown>)).toEqual(['emergency']);
    for (const leak of ['patient', 'name', 'category', 'Emergency', 'department', 'hospital']) {
      expect(serialised).not.toContain(leak);
    }
  });

  it('reuses the v1 envelope shape charge.captured already produces', () => {
    const opened = buildEncounterOpenedEvent({ visit_id: 8891, emergency: true }, context);
    const charge = buildChargeCapturedEvent(
      {
        type: 'drug',
        id: 1,
        patient_id: 100,
        visit_id: 8891,
        amount: '2500.00',
        quantity: 2,
        service_date: '2026-07-26',
      },
      context
    );

    expect(Object.keys(opened.payload).sort()).toEqual(Object.keys(charge.payload).sort());
    expect(opened.payload.aggregate).toEqual(charge.payload.aggregate);
    expect(opened.payload.event_version).toBe(1);
    expect(opened.payload.tenant_key).toBe('lagoon_general');
    expect(opened.payload.event_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('anchors on the visit aggregate so the anchor matches charge.captured', () => {
    const row = buildEncounterOpenedEvent({ visit_id: 8891, emergency: true }, context);

    expect(row.aggregate_type).toBe('encounter');
    expect(row.aggregate_id).toBe('visit:8891');
    expect(row.idempotency_key).toBe('encounter-opened:8891');
  });
});
