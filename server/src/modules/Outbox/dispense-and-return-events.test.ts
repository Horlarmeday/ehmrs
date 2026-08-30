import {
  EventBuildError,
  buildDispenseRecordedEvent,
  buildStockReturnedEvent,
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
