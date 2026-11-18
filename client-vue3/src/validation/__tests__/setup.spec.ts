import { beforeAll, describe, expect, it } from 'vitest';
import { validate } from 'vee-validate';
import { legacyMessage, setupValidation } from '../setup';

beforeAll(() => {
  setupValidation();
});

const firstError = async (value: unknown, rules: string, label: string) =>
  (await validate(value, rules, { label })).errors[0];

describe('legacy vee-validate 2 messages', () => {
  it.each([
    ['required', [], 'The phone field is required'],
    ['min', ['3'], 'The phone field must be at least 3 characters'],
    ['max', ['11'], 'The phone field may not be greater than 11 characters'],
    ['between', ['0', '2'], 'The phone field must be between 0 and 2'],
    ['min_value', ['1'], 'The phone field must be 1 or more'],
    ['max_value', ['9'], 'The phone field must be 9 or less'],
    ['confirmed', ['confirmPassword'], 'The phone confirmation does not match'],
    ['email', [], 'The phone field must be a valid email'],
    ['numeric', [], 'The phone field may only contain numeric characters'],
    ['digits', ['11'], 'The phone field must be numeric and contains exactly 11 digits'],
    ['length', ['4'], 'The phone length must be 4'],
    ['length', ['2', '4'], 'The phone length must be between 2 and 4'],
    ['size', ['1024'], 'The phone size must be less than 1 MB'],
    ['size', ['500'], 'The phone size must be less than 500 KB'],
    ['regex', ['^a$'], 'The phone field format is invalid'],
    ['one_of', ['a'], 'The phone field must be a valid value'],
    ['is', ['a'], 'The phone value is not valid'],
  ])('%s %j', (rule, params, message) => {
    expect(legacyMessage('phone', rule, params)).toBe(message);
  });

  it('uses the field label in messages produced by validation', async () => {
    expect(await firstError('', 'required', 'phone')).toBe('The phone field is required');
    expect(await firstError('080', 'required|min:11|max:11', 'phone')).toBe(
      'The phone field must be at least 11 characters'
    );
    expect(await firstError('3', 'required|between:0,2', 'grade')).toBe(
      'The grade field must be between 0 and 2'
    );
  });
});

describe('legacy rule behaviour', () => {
  it.each([
    ['required', '', false],
    ['required', ' ', false],
    ['required', '0', true],
    ['required', 0, true],
    ['required', false, true],
    ['required', null, false],
    ['required', [], false],
    ['required:true', false, false],
    ['required|min:3', 'ab', false],
    ['required|min:3', 123, true],
    ['required|min:11|max:11', '08012345678', true],
    ['required|min:11|max:11', '080123456789', false],
    ['required|min:6|max:255', 'abcde', false],
    ['required|between:0,2', '1.5', true],
    ['required|between:0,2', '3', false],
    ['required|between:0,2', 'a', false],
    ['required|min_value:1', '0', false],
    ['required|min_value:1', 1, true],
    ['required|min:1', 0, true],
  ])('%s with %j is %s, as in vee-validate 2', async (rules, value, valid) => {
    expect((await validate(value, rules)).valid).toBe(valid);
  });

  it('confirmed compares against the named field', async () => {
    const values = { confirmPassword: 'secret1' };
    expect(
      (await validate('secret1', 'required|confirmed:@confirmPassword', { values })).valid
    ).toBe(true);
    expect(
      (await validate('secret2', 'required|confirmed:@confirmPassword', { values })).valid
    ).toBe(false);
  });
});
