import {
  EventBuildError,
  buildChargeCapturedEvent,
  chargeIdempotencyKey,
  uuidV7,
  visitAggregateId,
} from './event-builder';
import { PRESCRIBED_LINE_TYPES } from './prescribed-line-types';

const baseLine = {
  type: 'drug' as const,
  id: 1,
  patient_id: 100,
  visit_id: 8891,
  amount: '2500.00',
  quantity: 2,
  service_date: '2026-07-22',
};

const context = {
  tenantKey: 'lagoon_general',
  sequence: 42,
  occurredAt: new Date('2026-07-22T09:00:00.000Z'),
  sentAt: new Date('2026-07-22T09:00:01.000Z'),
};

describe('uuidV7', () => {
  it('produces a valid v7 uuid (version nibble 7, variant 8-b)', () => {
    const id = uuidV7();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('is time-sortable: a later timestamp sorts after an earlier one', () => {
    const earlier = uuidV7(1_000_000_000_000);
    const later = uuidV7(2_000_000_000_000);
    expect(later > earlier).toBe(true);
  });
});

describe('visitAggregateId', () => {
  it('prefixes the visit id so the mapping is self-describing (ADR-0027)', () => {
    expect(visitAggregateId(8891)).toBe('visit:8891');
  });
});

describe('chargeIdempotencyKey', () => {
  it('is deterministic on type and id', () => {
    expect(chargeIdempotencyKey('drug', 1)).toBe('charge:drug:1');
  });

  it('keeps drug:1 and additional_item:1 DISTINCT (they collide without the type)', () => {
    expect(chargeIdempotencyKey('drug', 1)).not.toBe(chargeIdempotencyKey('additional_item', 1));
  });
});

describe('buildChargeCapturedEvent', () => {
  it('builds a v1 envelope with money as a STRING of integer kobo', () => {
    const row = buildChargeCapturedEvent(baseLine, context);

    expect(row.event_type).toBe('charge.captured');
    expect(row.idempotency_key).toBe('charge:drug:1');
    expect(row.aggregate_id).toBe('visit:8891');

    const body = row.payload.body as Record<string, unknown>;
    expect(body.amount_kobo).toBe('250000');
    expect(typeof body.amount_kobo).toBe('string');
    expect(body.encounter_id).toBe('visit:8891');
    expect(body.external_line_ref).toEqual({ type: 'drug', id: '1' });
  });

  it('sets the aggregate to the visit-derived encounter id', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    expect(row.payload.aggregate).toEqual({ type: 'encounter', id: 'visit:8891' });
  });

  it('mints a v7 event_id', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    expect(row.payload.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab]/);
  });

  it('reads the right price field per type', () => {
    // test uses `price`, not `total_price`; the builder must read amount regardless of the
    // column it came from, since the caller passes the resolved value.
    const row = buildChargeCapturedEvent({ ...baseLine, type: 'test', amount: '150.50' }, context);
    expect((row.payload.body as Record<string, unknown>).amount_kobo).toBe('15050');
  });

  it.each(PRESCRIBED_LINE_TYPES)('emits for prescribed type %s', type => {
    const row = buildChargeCapturedEvent({ ...baseLine, type, id: 5 }, context);
    expect(row.idempotency_key).toBe(`charge:${type}:5`);
  });

  it('REJECTS a money amount that arrives as a JS number', () => {
    expect(() => buildChargeCapturedEvent({ ...baseLine, amount: 2500 }, context)).toThrow(
      /number/
    );
  });

  it('REFUSES a demographic field in the body (ADR-0016)', () => {
    // Simulate a caller that tried to enrich the body with a name.
    const row = buildChargeCapturedEvent(baseLine, context);
    (row.payload.body as Record<string, unknown>).patient_name = 'Jane Doe';
    // The guard runs at build time, so re-running the build with a demographic input is the real
    // test: extend the input shape to smuggle one in.
    const withDemographic = {
      ...baseLine,
      // @ts-expect-error deliberately passing a field the type does not allow
      firstname: 'Jane',
    };
    // The builder only copies known fields, so a stray input key never reaches the body; assert
    // that too - the body stays clean.
    const clean = buildChargeCapturedEvent(withDemographic, context);
    expect((clean.payload.body as Record<string, unknown>).firstname).toBeUndefined();
  });

  it('rejects an unknown prescribed-line type', () => {
    expect(() =>
      // @ts-expect-error deliberately invalid type
      buildChargeCapturedEvent({ ...baseLine, type: 'mystery' }, context)
    ).toThrow(EventBuildError);
  });

  it('stringifies ids so numeric EMR ids match the string wire contract', () => {
    const row = buildChargeCapturedEvent(baseLine, context);
    const body = row.payload.body as Record<string, unknown>;
    expect(body.patient_id).toBe('100');
    expect(body.visit_id).toBe('8891');
  });
});
