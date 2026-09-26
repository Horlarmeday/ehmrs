import {
  DEMOGRAPHIC_EVENT_TYPES,
  buildStoreRowChangedEvent,
  storeRowAggregateId,
  storeRowChangedIdempotencyKey,
} from './event-builder';
import { nairaStringToKoboString } from './money';

/**
 * `store.row.changed` — the store-row label channel Accounting's goods-receipt form caches
 * (#81). Same overwrite shape as the item/vendor label channels, keyed on the pair Accounting's
 * cache slots on: `(item_code, drug_type)`.
 */

const context = {
  tenantKey: 'lagoon_general',
  sequence: 7,
  occurredAt: new Date('2026-09-26T10:00:00.000Z'),
  sentAt: new Date('2026-09-26T10:00:01.000Z'),
};

function bodyOf(row: { payload: Record<string, unknown> }) {
  return (row.payload as { body: Record<string, unknown> }).body;
}

const priced = {
  item_code: 'PHM-AMOX-500',
  drug_type: 'Cash',
  row_exists: true,
  selling_price_kobo: '45000',
};

describe('store-row channel identity', () => {
  it('keys the aggregate on the cache pair, not the row id', () => {
    expect(storeRowAggregateId('PHM-AMOX-500', 'Cash')).toBe('store-row:PHM-AMOX-500:Cash');
    expect(storeRowAggregateId('PHM-AMOX-500', 'NHIS')).not.toBe(
      storeRowAggregateId('PHM-AMOX-500', 'Cash')
    );
  });

  it('qualifies the idempotency key with the sequence, so one slot emits repeatedly', () => {
    expect(storeRowChangedIdempotencyKey('PHM-AMOX-500', 'Cash', 1)).toBe(
      'store-row-changed:PHM-AMOX-500:Cash:1'
    );
    expect(storeRowChangedIdempotencyKey('PHM-AMOX-500', 'Cash', 2)).not.toBe(
      storeRowChangedIdempotencyKey('PHM-AMOX-500', 'Cash', 1)
    );
  });
});

describe('buildStoreRowChangedEvent', () => {
  it('emits code, class, existence and kobo price as the whole body', () => {
    const row = buildStoreRowChangedEvent(priced, context);

    expect(bodyOf(row)).toEqual({
      item_code: 'PHM-AMOX-500',
      drug_type: 'Cash',
      row_exists: true,
      selling_price_kobo: '45000',
    });
    expect(row.event_type).toBe('store.row.changed');
    expect(row.aggregate_type).toBe('store_row');
    expect(row.aggregate_id).toBe('store-row:PHM-AMOX-500:Cash');
    expect(row.event_version).toBe(1);
    expect(row.idempotency_key).toBe('store-row-changed:PHM-AMOX-500:Cash:7');
  });

  it('trims the code before keying and emitting', () => {
    const row = buildStoreRowChangedEvent({ ...priced, item_code: '  PHM-AMOX-500  ' }, context);
    expect(bodyOf(row).item_code).toBe('PHM-AMOX-500');
    expect(row.aggregate_id).toBe('store-row:PHM-AMOX-500:Cash');
  });

  it('carries null for an existing-but-unpriced row', () => {
    const row = buildStoreRowChangedEvent({ ...priced, selling_price_kobo: null }, context);
    expect(bodyOf(row).selling_price_kobo).toBeNull();
  });

  it('refuses a price on a row_exists=false body', () => {
    expect(() => buildStoreRowChangedEvent({ ...priced, row_exists: false }, context)).toThrow(
      /row_exists=false/
    );
  });

  it('refuses a kobo price that is not a string of integer digits', () => {
    for (const bad of ['450.00', '45e2', 'abc', '', 45000 as never, undefined as never]) {
      expect(() =>
        buildStoreRowChangedEvent({ ...priced, selling_price_kobo: bad }, context)
      ).toThrow(/selling_price_kobo/);
    }
  });

  it('refuses a drug_type outside the five-value vocabulary', () => {
    expect(() =>
      buildStoreRowChangedEvent({ ...priced, drug_type: 'Wholesale' as never }, context)
    ).toThrow(/drug_type/);
  });

  it('refuses a code outside the 1-43 character bound', () => {
    expect(() =>
      buildStoreRowChangedEvent({ ...priced, item_code: 'C'.repeat(44) }, context)
    ).toThrow(/1-43 characters/);
    expect(() => buildStoreRowChangedEvent({ ...priced, item_code: '   ' }, context)).toThrow(
      /1-43 characters/
    );
  });

  it('refuses a non-boolean row_exists', () => {
    expect(() =>
      buildStoreRowChangedEvent({ ...priced, row_exists: 'true' as never }, context)
    ).toThrow(/row_exists/);
  });

  it('needs no demographic exemption: the body names no person, and the exemption list is untouched', () => {
    expect(() => buildStoreRowChangedEvent(priced, context)).not.toThrow();
    expect(DEMOGRAPHIC_EVENT_TYPES).not.toContain('store.row.changed');
  });
});

describe('kobo round-trip', () => {
  /**
   * The EMR stores naira DECIMAL, the wire carries integer-kobo strings, and Accounting converts
   * back with `Number(BigInt(kobo)) / 100`. The conversion must round-trip EXACTLY in both
   * directions or the pre-filled price on the receipt form lies by a kobo.
   */
  it.each([
    ['450.00', '45000'],
    ['0.00', '0'],
    ['0.05', '5'],
    ['1234567.89', '123456789'],
    ['9999999999.99', '999999999999'],
  ])('converts %s naira to %s kobo and back without loss', (naira, kobo) => {
    const emitted = nairaStringToKoboString(naira, 'selling_price');
    expect(emitted).toBe(kobo);
    expect(Number(BigInt(emitted)) / 100).toBe(Number(naira));
  });
});
