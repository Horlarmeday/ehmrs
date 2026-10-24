/**
 * Exact naira arithmetic for prescribing and the reverse inbox.
 *
 * The money columns are `DECIMAL(12,2)`, and `mysql2` returns them as STRINGS. A client body may
 * carry a JS number. Everything here converts to integer cents (BigInt) before doing arithmetic,
 * then returns a 2dp decimal string — never a float. This is the same discipline the outbox's
 * `nairaStringToKoboString` uses, extended with the multiplication the prescribing paths need.
 *
 * ⚠️ A number with visible float noise (e.g. `0.1 + 0.2`) is REJECTED rather than rounded. Once a
 * value has drifted, its exactness is gone; accepting it would launder the loss into a bill.
 */

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

function assertNonNegative(value: bigint, field: string): void {
  if (value < BigInt(0)) {
    throw new MoneyError(`${field} cannot be negative (received ${value.toString()} cents).`);
  }
}

/**
 * @param value A DECIMAL-column string (`'2500.00'`), or a finite JS number with at most 2dp.
 * @returns Integer cents as BigInt.
 */
export function nairaToCents(value: unknown, field = 'amount'): bigint {
  let text: string;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new MoneyError(`${field} is not a finite number (${String(value)}).`);
    }
    text = value.toString();
  } else if (typeof value === 'string') {
    text = value.trim();
  } else {
    throw new MoneyError(`${field} must be a decimal string or number, got ${typeof value}.`);
  }

  if (text.length === 0 || !DECIMAL_PATTERN.test(text)) {
    throw new MoneyError(`${field} is not a decimal number: "${text}".`);
  }

  const negative = text.startsWith('-');
  const unsigned = negative ? text.slice(1) : text;
  const [whole, fraction = ''] = unsigned.split('.');

  // Sub-kobo precision is refused, never rounded. Trailing zeros are harmless.
  if (fraction.slice(2).replace(/0+$/, '').length > 0) {
    throw new MoneyError(
      `${field} has sub-kobo precision ("${text}"). Kobo is the atom; refusing to round.`
    );
  }

  const cents = BigInt(`${whole}${fraction.padEnd(2, '0').slice(0, 2)}`);
  const signed = negative ? -cents : cents;
  assertNonNegative(signed, field);
  return signed;
}

/** Integer cents → a 2dp naira string, e.g. `1250n → '12.50'`. */
export function centsToNaira(cents: bigint, field = 'amount'): string {
  assertNonNegative(cents, field);
  const whole = cents / BigInt(100);
  const fraction = cents % BigInt(100);
  return `${whole.toString()}.${fraction.toString().padStart(2, '0')}`;
}

/**
 * `unitPrice × quantity` as an exact 2dp naira string. Quantity must be a non-negative integer;
 * every prescribing path derives it from an integer column or a whole-number request field.
 */
export function multiplyNairaByQuantity(
  unitPrice: unknown,
  quantity: unknown,
  field = 'amount'
): string {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    throw new MoneyError(
      `${field} quantity must be a non-negative integer, got ${String(quantity)}.`
    );
  }

  return centsToNaira(nairaToCents(unitPrice, field) * BigInt(qty), field);
}

/** Money as Accounting sends it: a STRING of integer kobo → a 2dp naira string. */
export function koboStringToNairaString(kobo: unknown, field = 'amount'): string {
  if (typeof kobo !== 'string' || !/^\d+$/.test(kobo)) {
    throw new MoneyError(
      `${field} must be a string of integer kobo, got ${typeof kobo} "${String(kobo)}".`
    );
  }
  // 1 kobo is 1 cent: 1000000 kobo = 10000.00 naira.
  return centsToNaira(BigInt(kobo), field);
}

/** True only for a well-formed, strictly positive amount. Used by the additional-item fallback. */
export function isPositiveMoney(value: unknown, field = 'amount'): boolean {
  try {
    return nairaToCents(value, field) > BigInt(0);
  } catch {
    return false;
  }
}

/** Exact comparison between a client number/string and a DECIMAL-string column. */
export function sameMoney(a: unknown, b: unknown, field = 'amount'): boolean {
  try {
    return nairaToCents(a, field) === nairaToCents(b, field);
  } catch {
    return false;
  }
}
