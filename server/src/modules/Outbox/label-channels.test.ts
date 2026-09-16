import {
  buildItemChangedEvent,
  buildVendorChangedEvent,
  itemAggregateId,
  itemChangedIdempotencyKey,
  vendorAggregateId,
  vendorChangedIdempotencyKey,
} from './event-builder';

/**
 * The two label channels (Accounting ADR-0051, ADR-0052).
 *
 * The load-bearing assertion is the demographic exemption: these two events may carry a `name`
 * because it is a product's or a company's, while every other event must still be refused one.
 */

const context = {
  tenantKey: 'lagoon_general',
  sequence: 4,
  occurredAt: new Date('2026-09-16T10:00:00.000Z'),
  sentAt: new Date('2026-09-16T10:00:01.000Z'),
};

function bodyOf(row: { payload: Record<string, unknown> }) {
  return (row.payload as { body: Record<string, unknown> }).body;
}

describe('idempotency keys carry the sequence', () => {
  it('lets one code emit at first sight and again on every rename', () => {
    expect(itemChangedIdempotencyKey('PHM-AMOX-500', 1)).toBe('item-changed:PHM-AMOX-500:1');
    expect(itemChangedIdempotencyKey('PHM-AMOX-500', 2)).not.toBe(
      itemChangedIdempotencyKey('PHM-AMOX-500', 1)
    );
  });

  it('does the same for a vendor', () => {
    expect(vendorChangedIdempotencyKey(42, 1)).toBe('vendor-changed:42:1');
    expect(vendorChangedIdempotencyKey(42, 2)).not.toBe(vendorChangedIdempotencyKey(42, 1));
  });
});

describe('aggregate ids', () => {
  it('keys an item by its catalogue code, not a numeric id', () => {
    expect(itemAggregateId('PHM-AMOX-500')).toBe('item:PHM-AMOX-500');
  });

  it('keys a vendor by its EMR id', () => {
    expect(vendorAggregateId(42)).toBe('vendor:42');
    expect(vendorAggregateId('42')).toBe('vendor:42');
  });
});

describe('buildItemChangedEvent', () => {
  it('emits the code and the name as the whole body', () => {
    const row = buildItemChangedEvent(
      { item_code: 'PHM-AMOX-500', name: 'Amoxicillin 500 mg capsules' },
      context
    );

    expect(bodyOf(row)).toEqual({
      item_code: 'PHM-AMOX-500',
      name: 'Amoxicillin 500 mg capsules',
    });
    expect(row.event_type).toBe('item.changed');
    expect(row.aggregate_type).toBe('item');
    expect(row.aggregate_id).toBe('item:PHM-AMOX-500');
    expect(row.event_version).toBe(1);
  });

  it('trims before validating and emitting', () => {
    const row = buildItemChangedEvent(
      { item_code: '  PHM-AMOX-500  ', name: '  Amoxicillin  ' },
      context
    );
    expect(bodyOf(row)).toEqual({ item_code: 'PHM-AMOX-500', name: 'Amoxicillin' });
  });

  it('refuses a code longer than the 43 chars Accounting bounds it to', () => {
    expect(() =>
      buildItemChangedEvent({ item_code: 'C'.repeat(44), name: 'Something' }, context)
    ).toThrow(/1-43 characters/);
  });

  it('refuses an empty code or an empty name', () => {
    expect(() => buildItemChangedEvent({ item_code: '   ', name: 'X' }, context)).toThrow(
      /1-43 characters/
    );
    expect(() =>
      buildItemChangedEvent({ item_code: 'PHM-AMOX-500', name: '   ' }, context)
    ).toThrow(/1-256 characters/);
  });
});

describe('buildVendorChangedEvent', () => {
  it('emits the id and the name, and nothing else the Vendor row holds', () => {
    const row = buildVendorChangedEvent({ vendor_id: 42, name: 'Northgate Pharma Ltd' }, context);

    // Vendor also has phone, address and email — all demographic keys, all deliberately absent.
    expect(bodyOf(row)).toEqual({ vendor_id: 42, name: 'Northgate Pharma Ltd' });
    expect(row.event_type).toBe('vendor.changed');
    expect(row.aggregate_type).toBe('vendor');
  });

  it('refuses a non-positive or non-integer id', () => {
    expect(() => buildVendorChangedEvent({ vendor_id: 0, name: 'X' }, context)).toThrow(
      /positive integer/
    );
    expect(() => buildVendorChangedEvent({ vendor_id: 'abc', name: 'X' }, context)).toThrow(
      /positive integer/
    );
  });
});

describe('the demographic exemption is per type, not a relaxation', () => {
  it('lets a product name through on item.changed', () => {
    expect(() =>
      buildItemChangedEvent({ item_code: 'PHM-AMOX-500', name: 'Amoxicillin' }, context)
    ).not.toThrow();
  });

  it('lets a company name through on vendor.changed', () => {
    expect(() =>
      buildVendorChangedEvent({ vendor_id: 42, name: 'Northgate Pharma Ltd' }, context)
    ).not.toThrow();
  });

  /**
   * That the assertion still bites on every non-exempt type is covered in `event-builder.test.ts`
   * ("the demographic assertion stays scoped, not deleted"), which also pins the exemption list's
   * LENGTH so widening it stays a reviewable edit. Duplicating it here would be a worse copy of a
   * better test; this file asserts only that the two new types are genuinely exempt.
   */
});
