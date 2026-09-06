import {
  EventBuildError,
  buildChargeReturnedEvent,
  buildDispenseRecordedEvent,
  buildStockReturnedEvent,
  chargeReturnedIdempotencyKey,
  dispenseIdempotencyKey,
  stockReturnedIdempotencyKey,
  storeAggregateId,
  visitAggregateId,
} from './event-builder';

const context = {
  tenantKey: 'lagoon_general',
  sequence: 42,
  occurredAt: new Date('2026-08-29T09:00:00.000Z'),
  sentAt: new Date('2026-08-29T09:00:01.000Z'),
};

const baseDispense = {
  type: 'drug' as const,
  id: 77,
  visit_id: 8891,
  quantity: 150,
  dispense_id: 5001,
  item_code: 'PARA500',
};

const baseReturn = {
  external_batch_id: 'batch-a',
  item_code: 'PARA500',
  quantity: 5,
  source: 'patient_to_dispensary' as const,
  aggregate_id: visitAggregateId(8891),
  return_id: 9001,
};

describe('buildDispenseRecordedEvent (ADR-0033, ADR-0040)', () => {
  it('emits one event naming BOTH layers of a multi-layer dispense', () => {
    const row = buildDispenseRecordedEvent(
      {
        ...baseDispense,
        batches: [
          { external_batch_id: 'batch-a', quantity: 100 },
          { external_batch_id: 'batch-b', quantity: 50 },
        ],
      },
      context
    );

    const body = row.payload.body as Record<string, unknown>;
    expect(body.batches).toEqual([
      { external_batch_id: 'batch-a', quantity: 100 },
      { external_batch_id: 'batch-b', quantity: 50 },
    ]);
    expect(body.quantity).toBe(150);
    expect(row.event_type).toBe('dispense.recorded');
    expect(row.aggregate_id).toBe('visit:8891');
  });

  it('OMITS batches entirely for a dispense from legacy layers, never fabricating an id', () => {
    const row = buildDispenseRecordedEvent({ ...baseDispense, batches: [] }, context);

    const body = row.payload.body as Record<string, unknown>;
    expect(body).not.toHaveProperty('batches');
    expect(body.quantity).toBe(150);
  });

  it('accepts a partial split naming only the batch-tracked layers', () => {
    const row = buildDispenseRecordedEvent(
      { ...baseDispense, batches: [{ external_batch_id: 'batch-a', quantity: 100 }] },
      context
    );

    const body = row.payload.body as Record<string, unknown>;
    expect(body.batches).toHaveLength(1);
  });

  it('REFUSES a split claiming more units than were dispensed', () => {
    expect(() =>
      buildDispenseRecordedEvent(
        {
          ...baseDispense,
          batches: [
            { external_batch_id: 'batch-a', quantity: 100 },
            { external_batch_id: 'batch-b', quantity: 51 },
          ],
        },
        context
      )
    ).toThrow(EventBuildError);
  });

  it('refuses a non-positive dispensed quantity', () => {
    expect(() => buildDispenseRecordedEvent({ ...baseDispense, quantity: 0 }, context)).toThrow(
      EventBuildError
    );
  });

  it('carries no cost or price field anywhere in the body', () => {
    const row = buildDispenseRecordedEvent(
      { ...baseDispense, batches: [{ external_batch_id: 'batch-a', quantity: 150 }] },
      context
    );

    const serialized = JSON.stringify(row.payload.body);
    expect(serialized).not.toMatch(/cost/i);
    expect(serialized).not.toMatch(/price/i);
    expect(serialized).not.toMatch(/amount/i);
  });

  it('keys idempotency on the dispense, not the prescribed line, so a second partial dispense is distinct', () => {
    const first = buildDispenseRecordedEvent({ ...baseDispense, dispense_id: 5001 }, context);
    const second = buildDispenseRecordedEvent({ ...baseDispense, dispense_id: 5002 }, context);

    expect(first.idempotency_key).toBe('dispense:5001');
    expect(second.idempotency_key).toBe('dispense:5002');
    expect(first.idempotency_key).not.toBe(second.idempotency_key);
  });

  it('is stable across redelivery: the same dispense yields the same key', () => {
    expect(dispenseIdempotencyKey(5001)).toBe(dispenseIdempotencyKey(5001));
  });

  it('refuses an unknown prescribed-line type', () => {
    expect(() =>
      buildDispenseRecordedEvent({ ...baseDispense, type: 'bed_day' as never }, context)
    ).toThrow(EventBuildError);
  });
});

describe('buildStockReturnedEvent (ADR-0040)', () => {
  it('carries a SCALAR batch id — the return path credits exactly one layer', () => {
    const row = buildStockReturnedEvent(baseReturn, context);

    const body = row.payload.body as Record<string, unknown>;
    expect(body.external_batch_id).toBe('batch-a');
    expect(Array.isArray(body.external_batch_id)).toBe(false);
    expect(row.event_type).toBe('stock.returned');
  });

  it('distinguishes the two flows explicitly', () => {
    const patient = buildStockReturnedEvent(baseReturn, context);
    const store = buildStockReturnedEvent(
      { ...baseReturn, source: 'dispensary_to_store', aggregate_id: storeAggregateId(3) },
      context
    );

    expect((patient.payload.body as Record<string, unknown>).source).toBe('patient_to_dispensary');
    expect((store.payload.body as Record<string, unknown>).source).toBe('dispensary_to_store');
    expect(store.aggregate_id).toBe('store:3');
  });

  it('gives the two flows distinct idempotency keys even for the same return id', () => {
    expect(stockReturnedIdempotencyKey('patient_to_dispensary', 1)).not.toBe(
      stockReturnedIdempotencyKey('dispensary_to_store', 1)
    );
  });

  it('refuses an unknown source rather than letting a consumer infer the flow', () => {
    expect(() =>
      buildStockReturnedEvent({ ...baseReturn, source: 'shrinkage' as never }, context)
    ).toThrow(EventBuildError);
  });

  it('refuses a return that names no batch', () => {
    expect(() =>
      buildStockReturnedEvent({ ...baseReturn, external_batch_id: '' }, context)
    ).toThrow(EventBuildError);
  });

  it('refuses a non-positive returned quantity', () => {
    expect(() => buildStockReturnedEvent({ ...baseReturn, quantity: 0 }, context)).toThrow(
      EventBuildError
    );
  });

  it('carries no cost, no reason_for_return and no returned_by (ADR-0009, ADR-0016)', () => {
    const row = buildStockReturnedEvent(baseReturn, context);

    const serialized = JSON.stringify(row.payload.body);
    expect(serialized).not.toMatch(/cost/i);
    expect(serialized).not.toMatch(/price/i);
    expect(serialized).not.toMatch(/reason_for_return/);
    expect(serialized).not.toMatch(/returned_by/);
  });

  it('never emits charge.returned — Flow 2 has no patient and no sale', () => {
    const store = buildStockReturnedEvent(
      { ...baseReturn, source: 'dispensary_to_store', aggregate_id: storeAggregateId(3) },
      context
    );

    expect(store.event_type).toBe('stock.returned');
    expect(store.event_type).not.toBe('charge.returned');
  });
});

const baseChargeReturn = {
  type: 'drug' as const,
  id: 77,
  visit_id: 8891,
  quantity: 3,
  return_id: 9001,
};

/**
 * Flow 1's SALE half (EMR #32, Accounting #174). The tests that matter most here are the ones
 * asserting what this builder does NOT require: it must build for a legacy layer that can name no
 * batch, because the patient is owed money regardless.
 */
describe('buildChargeReturnedEvent (EMR #32)', () => {
  it('carries the line ref, the encounter and the RETURNED quantity', () => {
    const row = buildChargeReturnedEvent(baseChargeReturn, context);

    expect(row.event_type).toBe('charge.returned');
    expect(row.aggregate_type).toBe('encounter');
    expect(row.aggregate_id).toBe('visit:8891');
    expect(row.event_version).toBe(1);

    const body = row.payload.body as Record<string, unknown>;
    expect(body.external_line_ref).toEqual({ type: 'drug', id: '77' });
    expect(body.encounter_id).toBe(visitAggregateId(8891));
    expect(body.quantity).toBe(3);
  });

  it('builds for an additional_item as well as a drug', () => {
    const row = buildChargeReturnedEvent({ ...baseChargeReturn, type: 'additional_item' }, context);

    const body = row.payload.body as Record<string, unknown>;
    expect(body.external_line_ref).toEqual({ type: 'additional_item', id: '77' });
  });

  // THE point of #32. `stock.returned` throws without a batch id; this must not even ask for one,
  // so a legacy-layer return (permanently possible — #295 D3) still refunds the patient.
  it('builds with NO batch id and NO item code — the asymmetry with stock.returned', () => {
    const row = buildChargeReturnedEvent(baseChargeReturn, context);

    const body = row.payload.body as Record<string, unknown>;
    expect(body).not.toHaveProperty('external_batch_id');
    expect(body).not.toHaveProperty('item_code');
    expect(row.event_type).toBe('charge.returned');
  });

  it('refuses a non-positive or fractional returned quantity', () => {
    expect(() => buildChargeReturnedEvent({ ...baseChargeReturn, quantity: 0 }, context)).toThrow(
      EventBuildError
    );
    expect(() => buildChargeReturnedEvent({ ...baseChargeReturn, quantity: -3 }, context)).toThrow(
      EventBuildError
    );
    expect(() => buildChargeReturnedEvent({ ...baseChargeReturn, quantity: 1.5 }, context)).toThrow(
      EventBuildError
    );
  });

  it('refuses an unknown prescribed-line type', () => {
    expect(() =>
      buildChargeReturnedEvent({ ...baseChargeReturn, type: 'ward_bed' as never }, context)
    ).toThrow(EventBuildError);
  });

  it('carries no cost and no price (ADR-0009)', () => {
    const serialized = JSON.stringify(
      buildChargeReturnedEvent(baseChargeReturn, context).payload.body
    );

    expect(serialized).not.toMatch(/cost/i);
    expect(serialized).not.toMatch(/price/i);
    expect(serialized).not.toMatch(/amount/i);
  });

  describe('reason (EMR #32 D3)', () => {
    it('carries it, trimmed, when supplied', () => {
      const row = buildChargeReturnedEvent(
        { ...baseChargeReturn, reason: '  patient refused  ' },
        context
      );

      expect((row.payload.body as Record<string, unknown>).reason).toBe('patient refused');
    });

    it('omits the key entirely when absent, empty or whitespace', () => {
      for (const reason of [undefined, '', '   ']) {
        const row = buildChargeReturnedEvent({ ...baseChargeReturn, reason }, context);
        expect(row.payload.body as Record<string, unknown>).not.toHaveProperty('reason');
      }
    });

    it('truncates to 500 characters — the body is signed, so its size is bounded', () => {
      const row = buildChargeReturnedEvent(
        { ...baseChargeReturn, reason: 'x'.repeat(900) },
        context
      );

      expect((row.payload.body as Record<string, unknown>).reason).toHaveLength(500);
    });
  });

  describe('idempotency key (EMR #32 D1)', () => {
    it('is keyed on the physical return, not the line', () => {
      const row = buildChargeReturnedEvent(baseChargeReturn, context);

      expect(row.idempotency_key).toBe('charge-returned:9001');
      expect(chargeReturnedIdempotencyKey(9001)).toBe('charge-returned:9001');
    });

    // The trap a line-scoped key would spring: the second partial return on ONE line would collide
    // on the UNIQUE index and that patient would never be refunded for it.
    it('DIFFERS across two partial returns of the same line', () => {
      const first = buildChargeReturnedEvent({ ...baseChargeReturn, quantity: 3 }, context);
      const second = buildChargeReturnedEvent(
        { ...baseChargeReturn, quantity: 2, return_id: 9002 },
        context
      );

      expect(first.idempotency_key).not.toBe(second.idempotency_key);
      expect((first.payload.body as Record<string, unknown>).quantity).toBe(3);
      expect((second.payload.body as Record<string, unknown>).quantity).toBe(2);
    });
  });
});
