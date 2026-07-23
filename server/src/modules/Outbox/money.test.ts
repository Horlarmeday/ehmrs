import { MoneyConversionError, nairaStringToKoboString } from './money';

describe('nairaStringToKoboString', () => {
  it.each([
    ['2000.00', '200000'],
    ['0.01', '1'],
    ['0.10', '10'],
    ['1234.56', '123456'],
    ['0.00', '0'],
    ['999999999.99', '99999999999'],
  ])('converts %s naira to %s kobo', (naira, kobo) => {
    expect(nairaStringToKoboString(naira)).toBe(kobo);
  });

  it('accepts a whole-naira string with no decimal point', () => {
    expect(nairaStringToKoboString('2000')).toBe('200000');
  });

  it('accepts a single-decimal string', () => {
    expect(nairaStringToKoboString('2000.5')).toBe('200050');
  });

  it('handles a negative amount', () => {
    expect(nairaStringToKoboString('-150.25')).toBe('-15025');
  });

  it('stays exact beyond Number.MAX_SAFE_INTEGER kobo', () => {
    // 90,071,992,547,409.93 naira = 9007199254740993 kobo, one past MAX_SAFE_INTEGER.
    // A Number-based implementation returns ...992 here and loses a kobo.
    expect(nairaStringToKoboString('90071992547409.93')).toBe('9007199254740993');
  });

  it('REJECTS a JS number - the float damage has already happened by then', () => {
    expect(() => nairaStringToKoboString(2000.0)).toThrow(MoneyConversionError);
    expect(() => nairaStringToKoboString(2000.0)).toThrow(/number/);
  });

  it('REJECTS sub-kobo precision rather than rounding it away', () => {
    expect(() => nairaStringToKoboString('10.005')).toThrow(/sub-kobo/);
  });

  it('allows trailing zeros beyond kobo, which carry no value', () => {
    expect(nairaStringToKoboString('10.5000')).toBe('1050');
  });

  it.each([
    ['empty', ''],
    ['whitespace', '   '],
    ['not a number', 'abc'],
    ['currency symbol', '₦2000.00'],
    ['thousands separator', '2,000.00'],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_case, input) => {
    expect(() => nairaStringToKoboString(input)).toThrow(MoneyConversionError);
  });

  it('names the field in the error, so a failure points at the column', () => {
    expect(() => nairaStringToKoboString(12.5, 'total_price')).toThrow(/total_price/);
  });
});
