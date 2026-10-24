import {
  centsToNaira,
  isPositiveMoney,
  koboStringToNairaString,
  MoneyError,
  multiplyNairaByQuantity,
  nairaToCents,
  sameMoney,
} from './money';

describe('exact naira money helpers', () => {
  describe('nairaToCents', () => {
    it('parses DECIMAL strings exactly', () => {
      expect(nairaToCents('2500.00')).toBe(BigInt(250000));
      expect(nairaToCents('0.05')).toBe(BigInt(5));
      expect(nairaToCents('12.5')).toBe(BigInt(1250));
    });

    it('accepts finite numbers with at most 2dp', () => {
      expect(nairaToCents(150.5)).toBe(BigInt(15050));
    });

    it('rejects sub-kobo precision instead of rounding', () => {
      expect(() => nairaToCents('10.005')).toThrow(MoneyError);
      expect(() => nairaToCents(10.005)).toThrow(MoneyError);
    });

    it('rejects negative values and non-numeric input', () => {
      expect(() => nairaToCents('-1.00')).toThrow(MoneyError);
      expect(() => nairaToCents('abc')).toThrow(MoneyError);
      expect(() => nairaToCents(null)).toThrow(MoneyError);
    });
  });

  describe('multiplyNairaByQuantity', () => {
    it('returns an exact 2dp line total', () => {
      expect(multiplyNairaByQuantity('12.35', 3)).toBe('37.05');
      expect(multiplyNairaByQuantity('100.00', 0)).toBe('0.00');
      expect(multiplyNairaByQuantity('0.10', 3)).toBe('0.30');
    });

    it('rejects a non-integer or negative quantity', () => {
      expect(() => multiplyNairaByQuantity('10.00', 1.5)).toThrow(MoneyError);
      expect(() => multiplyNairaByQuantity('10.00', -1)).toThrow(MoneyError);
    });
  });

  describe('koboStringToNairaString', () => {
    it('converts integer kobo strings exactly', () => {
      expect(koboStringToNairaString('1000000')).toBe('10000.00');
      expect(koboStringToNairaString('150000')).toBe('1500.00');
      expect(koboStringToNairaString('0')).toBe('0.00');
    });

    it('refuses anything that is not an integer-kobo string', () => {
      expect(() => koboStringToNairaString('10.00')).toThrow(MoneyError);
      expect(() => koboStringToNairaString('-1')).toThrow(MoneyError);
      expect(() => koboStringToNairaString(1000)).toThrow(MoneyError);
    });
  });

  describe('centsToNaira', () => {
    it('formats cents with two decimals', () => {
      expect(centsToNaira(BigInt(5))).toBe('0.05');
      expect(centsToNaira(BigInt(250000))).toBe('2500.00');
    });
  });

  describe('isPositiveMoney and sameMoney', () => {
    it('treats zero and malformed values as not positive', () => {
      expect(isPositiveMoney('0.00')).toBe(false);
      expect(isPositiveMoney('')).toBe(false);
      expect(isPositiveMoney('10.00')).toBe(true);
    });

    it('compares a client number with a DECIMAL string', () => {
      expect(sameMoney(2500, '2500.00')).toBe(true);
      expect(sameMoney('2500.00', '2500.00')).toBe(true);
      expect(sameMoney(2500.01, '2500.00')).toBe(false);
    });
  });
});
