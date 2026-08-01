import {
  EventBuildError,
  buildChargeVoidedEvent,
  chargeIdempotencyKey,
  chargeVoidedIdempotencyKey,
} from './event-builder';

const context = {
  tenantKey: 'lagoon_general',
  sequence: 7,
  occurredAt: new Date('2026-07-26T10:00:00.000Z'),
  sentAt: new Date('2026-07-26T10:00:01.000Z'),
};

describe('chargeVoidedIdempotencyKey', () => {
  it('is deterministic and distinct from the capture key', () => {
    expect(chargeVoidedIdempotencyKey('drug', 42)).toBe('charge-voided:drug:42');
    expect(chargeVoidedIdempotencyKey('drug', 42)).not.toBe(chargeIdempotencyKey('drug', 42));
  });

  it('refuses an unknown type', () => {
    expect(() => chargeVoidedIdempotencyKey('unknown' as never, 1)).toThrow(EventBuildError);
  });
});

describe('buildChargeVoidedEvent', () => {
  it('carries external_line_ref and encounter_id only', () => {
    const row = buildChargeVoidedEvent({ type: 'drug', id: 42, visit_id: 8891 }, context);

    expect(row.event_type).toBe('charge.voided');
    expect(row.payload.body).toEqual({
      external_line_ref: { type: 'drug', id: '42' },
      encounter_id: 'visit:8891',
    });
  });

  it('carries no money field under any input', () => {
    const row = buildChargeVoidedEvent({ type: 'service', id: 9, visit_id: 8891 }, context);
    const body = row.payload.body as Record<string, unknown>;
    const keys = Object.keys(body);

    expect(keys).not.toContain('amount_kobo');
    expect(keys).not.toContain('amount');
    expect(keys).not.toContain('price');
    expect(keys).not.toContain('kobo');
  });

  it('refuses an unknown type', () => {
    expect(() =>
      buildChargeVoidedEvent({ type: 'unknown' as never, id: 1, visit_id: 8891 }, context)
    ).toThrow(EventBuildError);
  });
});
