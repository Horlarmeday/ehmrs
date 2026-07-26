/**
 * The five billable prescribed-line types — one per `Prescribed_*` table.
 *
 * WHY THIS SET IS CLOSED AND LIVES IN ONE PLACE
 * ---------------------------------------------
 * Ids are autoincrement PER TABLE, so they collide across tables: `drug:1` and
 * `additional_item:1` are DIFFERENT charges. The type prefix is the only thing that keeps their
 * idempotency keys distinct, so an omitted or misspelled type is a silent cross-table collision
 * that makes Accounting discard a real charge as a duplicate — a charge the patient is then never
 * billed for, with no error anywhere.
 *
 * `additional_item` is consumables (syringes, needles, gloves). It is the easiest to forget and
 * must not be: `prescribeBulkDrugs` auto-creates them alongside injections, so they are generated
 * by the main drug flow rather than being an occasional extra.
 *
 * The PRICE FIELD IS PART OF THIS TABLE because the column name is not uniform — `total_price` on
 * two tables, `price` on the other three. Reading the wrong column emits a wrong amount or
 * `undefined`, and a per-call-site literal is exactly how that drifts.
 */
export const PRESCRIBED_LINE_TYPES = [
  'drug',
  'investigation',
  'service',
  'test',
  'additional_item',
] as const;

export type PrescribedLineType = typeof PRESCRIBED_LINE_TYPES[number];

/** Which column holds the amount the patient owes, per type (owner decision, 2026-07-21). */
export const PRICE_FIELD_BY_TYPE: Record<PrescribedLineType, string> = {
  drug: 'total_price',
  additional_item: 'total_price',
  test: 'price',
  service: 'price',
  investigation: 'price',
};

/**
 * Which column carries the coverage marker (`Cash`/`NHIS`/…) per type — the field that says a line
 * was raised as cash regardless of any insurance on file. Co-located with the price field for the
 * same reason: the column name is not uniform (`drug_type` for drug and additional_item, a
 * `*_type` variant for the rest), and a per-call-site literal is how it drifts.
 */
export const COVERAGE_TYPE_FIELD_BY_TYPE: Record<PrescribedLineType, string> = {
  drug: 'drug_type',
  additional_item: 'drug_type',
  test: 'test_type',
  service: 'service_type',
  investigation: 'investigation_type',
};

export function isPrescribedLineType(value: unknown): value is PrescribedLineType {
  return typeof value === 'string' && PRESCRIBED_LINE_TYPES.some(type => type === value);
}
