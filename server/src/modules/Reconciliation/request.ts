/**
 * Validation for Accounting's reconciliation requests (#109, ehmrs_accounting#747). Results are
 * flat rather than discriminated unions because this repo compiles without strictNullChecks.
 */

export const MAX_PAGE_LIMIT = 500;
export const MAX_LOOKUP_IDS = 500;
const MAX_BATCH_ID_LENGTH = 64;

export interface Window {
  readonly startDate: Date;
  readonly windowStart: Date;
  readonly cutoff: Date;
}

export interface ChargesRequest extends Window {
  readonly afterVisitId: number | null;
  readonly limit: number;
  readonly visitIds: readonly number[];
}

export interface ChargeLinesRequest {
  readonly startDate: Date;
  readonly visitId: number;
}

export interface StockRequest extends Window {
  readonly batchIds: readonly string[];
}

export interface Parsed<T> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: string;
}

class RequestError extends Error {}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d{0,17}$/;

function field(body: Record<string, unknown>, name: string): unknown {
  return body[name];
}

function startDateOf(body: Record<string, unknown>): Date {
  const raw = field(body, 'start_date');
  if (typeof raw !== 'string' || !DATE_PATTERN.test(raw)) {
    throw new RequestError('start_date must be a YYYY-MM-DD date.');
  }
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new RequestError('start_date is not a real calendar date.');
  }
  return date;
}

function instantOf(body: Record<string, unknown>, name: string): Date {
  const raw = field(body, name);
  if (typeof raw !== 'string' || !ISO_INSTANT_PATTERN.test(raw) || Number.isNaN(Date.parse(raw))) {
    throw new RequestError(`${name} must be an ISO-8601 instant.`);
  }
  return new Date(raw);
}

function positiveIntegerOf(raw: unknown, name: string): number {
  if (typeof raw !== 'string' || !POSITIVE_INTEGER_PATTERN.test(raw)) {
    throw new RequestError(`${name} must be a positive integer string.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    throw new RequestError(`${name} is out of range.`);
  }
  return value;
}

function windowOf(body: Record<string, unknown>): Window {
  const startDate = startDateOf(body);
  const windowStart = instantOf(body, 'window_start');
  const cutoff = instantOf(body, 'cutoff');
  if (windowStart.getTime() > cutoff.getTime()) {
    throw new RequestError('window_start must not be after cutoff.');
  }
  return { startDate, windowStart, cutoff };
}

function listOf(body: Record<string, unknown>, name: string): readonly unknown[] {
  const raw = field(body, name);
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new RequestError(`${name} must be an array.`);
  }
  if (raw.length > MAX_LOOKUP_IDS) {
    throw new RequestError(`${name} may hold at most ${MAX_LOOKUP_IDS} ids.`);
  }
  return raw;
}

function parse<T>(build: () => T): Parsed<T> {
  try {
    return { ok: true, value: build() };
  } catch (error) {
    if (error instanceof RequestError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export function parseChargesRequest(body: Record<string, unknown>): Parsed<ChargesRequest> {
  return parse(() => {
    const window = windowOf(body);
    const rawAfter = field(body, 'after_visit_id');
    const afterVisitId =
      rawAfter === null || rawAfter === undefined
        ? null
        : positiveIntegerOf(rawAfter, 'after_visit_id');
    const rawLimit = field(body, 'limit');
    if (
      typeof rawLimit !== 'number' ||
      !Number.isInteger(rawLimit) ||
      rawLimit < 1 ||
      rawLimit > MAX_PAGE_LIMIT
    ) {
      throw new RequestError(`limit must be an integer from 1 to ${MAX_PAGE_LIMIT}.`);
    }
    const visitIds = [
      ...new Set(listOf(body, 'visit_ids').map(id => positiveIntegerOf(id, 'visit_ids'))),
    ];
    return { ...window, afterVisitId, limit: rawLimit, visitIds };
  });
}

export function parseChargeLinesRequest(body: Record<string, unknown>): Parsed<ChargeLinesRequest> {
  return parse(() => ({
    startDate: startDateOf(body),
    visitId: positiveIntegerOf(field(body, 'visit_id'), 'visit_id'),
  }));
}

export function parseStockRequest(body: Record<string, unknown>): Parsed<StockRequest> {
  return parse(() => {
    const window = windowOf(body);
    const batchIds = [
      ...new Set(
        listOf(body, 'batch_ids').map(id => {
          if (typeof id !== 'string' || id.length === 0 || id.length > MAX_BATCH_ID_LENGTH) {
            throw new RequestError(
              `batch_ids must be non-empty strings of at most ${MAX_BATCH_ID_LENGTH} characters.`
            );
          }
          return id;
        })
      ),
    ];
    return { ...window, batchIds };
  });
}
