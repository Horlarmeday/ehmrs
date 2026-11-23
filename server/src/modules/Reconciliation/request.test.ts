import { parseChargeLinesRequest, parseChargesRequest, parseStockRequest } from './request';

const window = {
  start_date: '2026-11-01',
  window_start: '2026-11-15T00:00:00.000Z',
  cutoff: '2026-11-22T08:00:00.000Z',
};

const charges = (overrides: Record<string, unknown> = {}) => ({
  ...window,
  after_visit_id: null,
  limit: 500,
  visit_ids: [],
  ...overrides,
});

describe('reconciliation request validation (#109)', () => {
  it('accepts a window request and reads the cursor as a number', () => {
    const parsed = parseChargesRequest(charges({ after_visit_id: '812' }));
    expect(parsed.ok).toBe(true);
    expect(parsed.value.afterVisitId).toBe(812);
    expect(parsed.value.visitIds).toEqual([]);
  });

  it('dedupes looked-up visit ids', () => {
    const parsed = parseChargesRequest(charges({ visit_ids: ['7', '7', '9'] }));
    expect(parsed.value.visitIds).toEqual([7, 9]);
  });

  it.each([
    ['an impossible start date', { start_date: '2026-02-30' }, /calendar/],
    ['a start date with a time', { start_date: '2026-11-01T00:00:00Z' }, /YYYY-MM-DD/],
    ['a window that ends before it starts', { cutoff: '2026-11-01T00:00:00.000Z' }, /window_start/],
    ['a cutoff that is not an instant', { cutoff: 'yesterday' }, /cutoff/],
    ['a zero limit', { limit: 0 }, /limit/],
    ['a limit above the page size', { limit: 501 }, /limit/],
    ['a numeric cursor', { after_visit_id: 812 }, /after_visit_id/],
    ['a negative visit id', { visit_ids: ['-1'] }, /visit_ids/],
    [
      'too many visit ids',
      { visit_ids: Array.from({ length: 501 }, (_, i) => String(i + 1)) },
      /at most/,
    ],
  ])('refuses %s', (_label, overrides, message) => {
    const parsed = parseChargesRequest(charges(overrides));
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toMatch(message);
  });

  it('requires a visit id for the line list', () => {
    expect(parseChargeLinesRequest({ start_date: '2026-11-01' }).ok).toBe(false);
    expect(parseChargeLinesRequest({ start_date: '2026-11-01', visit_id: '4' }).value.visitId).toBe(
      4
    );
  });

  it('refuses an empty or oversized batch id', () => {
    expect(parseStockRequest({ ...window, batch_ids: [''] }).ok).toBe(false);
    expect(parseStockRequest({ ...window, batch_ids: ['x'.repeat(65)] }).ok).toBe(false);
    expect(parseStockRequest({ ...window, batch_ids: ['b-1', 'b-1'] }).value.batchIds).toEqual([
      'b-1',
    ]);
  });
});
