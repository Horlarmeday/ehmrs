import {
  EventBuildError,
  buildChargeReversalRequestedEvent,
  chargeIdempotencyKey,
  chargeReversalRequestedIdempotencyKey,
} from './event-builder';

const context = {
  tenantKey: 'lagoon_general',
  sequence: 8,
  occurredAt: new Date('2026-07-26T11:00:00.000Z'),
  sentAt: new Date('2026-07-26T11:00:01.000Z'),
};

describe('chargeReversalRequestedIdempotencyKey', () => {
  it('is deterministic and distinct from capture and void keys', () => {
    expect(chargeReversalRequestedIdempotencyKey('drug', 42)).toBe('reversal_requested:drug:42');
    expect(chargeReversalRequestedIdempotencyKey('drug', 42)).not.toBe(
      chargeIdempotencyKey('drug', 42)
    );
  });

  it('refuses an unknown type', () => {
    expect(() => chargeReversalRequestedIdempotencyKey('unknown' as never, 1)).toThrow(
      EventBuildError
    );
  });
});

describe('buildChargeReversalRequestedEvent', () => {
  it('carries external_line_ref and encounter_id only when reason is omitted', () => {
    const row = buildChargeReversalRequestedEvent(
      { type: 'drug', id: 42, visit_id: 8891 },
      context
    );

    expect(row.event_type).toBe('charge.reversal.requested');
    expect(row.payload.body).toEqual({
      external_line_ref: { type: 'drug', id: '42' },
      encounter_id: 'visit:8891',
    });
  });

  it('includes optional reason when supplied', () => {
    const row = buildChargeReversalRequestedEvent(
      { type: 'service', id: 9, visit_id: 8891, reason: 'WRONG_PATIENT' },
      context
    );
    expect(row.payload.body).toEqual({
      external_line_ref: { type: 'service', id: '9' },
      encounter_id: 'visit:8891',
      reason: 'WRONG_PATIENT',
    });
  });

  it('carries no money field under any input', () => {
    const row = buildChargeReversalRequestedEvent(
      { type: 'service', id: 9, visit_id: 8891 },
      context
    );
    const body = row.payload.body as Record<string, unknown>;
    const keys = Object.keys(body);

    expect(keys).not.toContain('amount_kobo');
    expect(keys).not.toContain('amount');
    expect(keys).not.toContain('price');
    expect(keys).not.toContain('kobo');
  });
});
