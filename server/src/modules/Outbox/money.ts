/**
 * Naira → integer kobo, as a string. THE money-safety chokepoint of the outbox.
 *
 * WHY THIS IS PURE STRING MANIPULATION
 * ------------------------------------
 * The price columns are `DECIMAL(12,2)`, and `mysql2` returns DECIMAL as a **string** — verified
 * against the live database: a real `total_price` came back as `'2000.00'`, `typeof === 'string'`.
 * So MySQL stores the amount exactly and the driver preserves that exactness all the way here.
 * Converting by string keeps it exact end to end.
 *
 * ⚠️ THE MODELS LIE ABOUT THE TYPE. They annotate these fields as `total_price: number`, which is
 * WRONG at runtime and actively dangerous: it invites `Math.round(price * 100)`, reintroducing the
 * IEEE-754 error the DECIMAL column exists to prevent (`0.1 + 0.2 !== 0.3`, and it compounds
 * across a ledger). Accounting holds money as `bigint` kobo for exactly this reason and rejects a
 * JSON number on the wire. So we never multiply, and never route the value through `Number`.
 *
 * A genuine `number` input is REJECTED rather than coerced: by the time a float reaches us the
 * imprecision has already happened, and "helpfully" accepting it would launder that loss into a
 * hospital's ledger.
 */

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

export class MoneyConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyConversionError';
  }
}

/**
 * @param naira A decimal string from a DECIMAL column, e.g. `'2000.00'`.
 * @returns Integer kobo as a string, e.g. `'200000'` — the wire format Accounting requires.
 */
export function nairaStringToKoboString(naira: unknown, field = 'amount'): string {
  if (typeof naira === 'number') {
    throw new MoneyConversionError(
      `${field} arrived as a JS number (${naira}). DECIMAL columns return strings; a number here ` +
        'means the value already passed through a float and its precision cannot be trusted.'
    );
  }

  if (typeof naira !== 'string' || naira.trim().length === 0) {
    throw new MoneyConversionError(
      `${field} must be a non-empty decimal string, got ${typeof naira}`
    );
  }

  const value = naira.trim();
  if (!DECIMAL_PATTERN.test(value)) {
    throw new MoneyConversionError(`${field} is not a decimal number: "${value}"`);
  }

  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = unsigned.split('.');

  // Sub-kobo is REJECTED, never rounded. Rounding here would silently invent or destroy money,
  // and the caller has no way to know it happened.
  if (fraction.length > 2) {
    const significant = fraction.slice(2).replace(/0+$/, '');
    if (significant.length > 0) {
      throw new MoneyConversionError(
        `${field} has sub-kobo precision ("${value}"). Kobo is the atom; refusing to round.`
      );
    }
  }

  const kobo = `${whole}${fraction.padEnd(2, '0').slice(0, 2)}`;

  // BigInt, not Number: a hospital-scale total can exceed Number.MAX_SAFE_INTEGER kobo, and
  // `parseInt` would silently lose the low digits.
  const asBigInt = BigInt(kobo);
  return (negative ? -asBigInt : asBigInt).toString();
}
