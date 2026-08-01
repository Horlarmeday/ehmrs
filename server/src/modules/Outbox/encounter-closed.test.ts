import {
  buildChargeCapturedEvent,
  buildEncounterClosedEvent,
  encounterClosedIdempotencyKey,
} from './event-builder';

const context = {
  tenantKey: 'lagoon_general',
  sequence: 7,
  occurredAt: new Date('2026-07-26T10:00:00.000Z'),
  sentAt: new Date('2026-07-26T10:00:01.000Z'),
};

describe('encounterClosedIdempotencyKey', () => {
  it('is deterministic on the visit, so a redelivery dedupes at the inbox', () => {
    expect(encounterClosedIdempotencyKey(8891)).toBe('encounter-closed:8891');
    expect(encounterClosedIdempotencyKey(8891)).toBe(encounterClosedIdempotencyKey('8891'));
  });
});

describe('buildEncounterClosedEvent', () => {
  it('emits an empty body', () => {
    const row = buildEncounterClosedEvent({ visit_id: 8891 }, context);

    expect(row.event_type).toBe('encounter.closed');
    expect(row.payload.body).toEqual({});
  });

  it('carries no patient, category, or closed_at in the body (ADR-0016)', () => {
    const row = buildEncounterClosedEvent({ visit_id: 8891 }, context);
    const serialised = JSON.stringify(row.payload.body);

    expect(Object.keys(row.payload.body as Record<string, unknown>)).toHaveLength(0);
    for (const leak of ['patient', 'name', 'category', 'closed_at', 'date_visit_ended']) {
      expect(serialised).not.toContain(leak);
    }
  });

  it('reuses the v1 envelope shape charge.captured already produces', () => {
    const closed = buildEncounterClosedEvent({ visit_id: 8891 }, context);
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

    expect(Object.keys(closed.payload).sort()).toEqual(Object.keys(charge.payload).sort());
    expect(closed.payload.aggregate).toEqual(charge.payload.aggregate);
    expect(closed.payload.event_version).toBe(1);
    expect(closed.payload.tenant_key).toBe('lagoon_general');
    expect(closed.payload.event_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('anchors on the visit aggregate so the anchor matches charge.captured', () => {
    const row = buildEncounterClosedEvent({ visit_id: 8891 }, context);

    expect(row.aggregate_type).toBe('encounter');
    expect(row.aggregate_id).toBe('visit:8891');
    expect(row.idempotency_key).toBe('encounter-closed:8891');
  });
});
