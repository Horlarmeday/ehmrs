import { configure, defineRule } from 'vee-validate';
import {
  alpha,
  alpha_dash,
  alpha_num,
  alpha_spaces,
  between,
  confirmed,
  digits,
  dimensions,
  email,
  ext,
  image,
  integer,
  is,
  is_not,
  length,
  max,
  max_value,
  mimes,
  min,
  min_value,
  not_one_of,
  numeric,
  one_of,
  regex,
  required,
  size,
  url,
} from '@vee-validate/rules';

type Message = (field: string, params: unknown[]) => string;

function fileSize(kilobytes: unknown): string {
  const units = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const bytes = Number(kilobytes) * 1024;
  const power = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return `${1 * Number((bytes / 1024 ** power).toFixed(2))} ${units[power]}`;
}

export const legacyMessages: Record<string, Message> = {
  alpha: (field) => `The ${field} field may only contain alphabetic characters`,
  alpha_dash: (field) =>
    `The ${field} field may contain alpha-numeric characters as well as dashes and underscores`,
  alpha_num: (field) => `The ${field} field may only contain alpha-numeric characters`,
  alpha_spaces: (field) =>
    `The ${field} field may only contain alphabetic characters as well as spaces`,
  between: (field, [low, high]) => `The ${field} field must be between ${low} and ${high}`,
  confirmed: (field) => `The ${field} confirmation does not match`,
  digits: (field, [count]) =>
    `The ${field} field must be numeric and contains exactly ${count} digits`,
  dimensions: (field, [width, height]) =>
    `The ${field} field must be ${width} pixels by ${height} pixels`,
  email: (field) => `The ${field} field must be a valid email`,
  ext: (field) => `The ${field} field must be a valid file`,
  image: (field) => `The ${field} field must be an image`,
  integer: (field) => `The ${field} field must be an integer`,
  length: (field, [low, high]) =>
    high === undefined
      ? `The ${field} length must be ${low}`
      : `The ${field} length must be between ${low} and ${high}`,
  max: (field, [count]) => `The ${field} field may not be greater than ${count} characters`,
  max_value: (field, [limit]) => `The ${field} field must be ${limit} or less`,
  mimes: (field) => `The ${field} field must have a valid file type`,
  min: (field, [count]) => `The ${field} field must be at least ${count} characters`,
  min_value: (field, [limit]) => `The ${field} field must be ${limit} or more`,
  not_one_of: (field) => `The ${field} field must be a valid value`,
  numeric: (field) => `The ${field} field may only contain numeric characters`,
  one_of: (field) => `The ${field} field must be a valid value`,
  regex: (field) => `The ${field} field format is invalid`,
  required: (field) => `The ${field} field is required`,
  size: (field, [kilobytes]) => `The ${field} size must be less than ${fileSize(kilobytes)}`,
  url: (field) => `The ${field} field is not a valid URL`,
};

const fallback: Message = (field) => `The ${field} value is not valid`;

function asList(params: unknown): unknown[] {
  if (Array.isArray(params)) return params;
  if (params && typeof params === 'object') return Object.values(params);
  return params === undefined ? [] : [params];
}

export function legacyMessage(field: string, rule: string, params: unknown): string {
  return (legacyMessages[rule] ?? fallback)(field, asList(params));
}

export function legacyRequired(value: unknown, params?: unknown): boolean {
  const [invalidateFalse] = asList(params);
  if (value === false && invalidateFalse !== true && invalidateFalse !== 'true') return true;
  return required(value);
}

export function setupValidation(): void {
  defineRule('alpha', alpha);
  defineRule('alpha_dash', alpha_dash);
  defineRule('alpha_num', alpha_num);
  defineRule('alpha_spaces', alpha_spaces);
  defineRule('between', between);
  defineRule('confirmed', confirmed);
  defineRule('digits', digits);
  defineRule('dimensions', dimensions);
  defineRule('email', email);
  defineRule('ext', ext);
  defineRule('image', image);
  defineRule('integer', integer);
  defineRule('is', is);
  defineRule('is_not', is_not);
  defineRule('length', length);
  defineRule('max', max);
  defineRule('max_value', max_value);
  defineRule('mimes', mimes);
  defineRule('min', min);
  defineRule('min_value', min_value);
  defineRule('not_one_of', not_one_of);
  defineRule('numeric', numeric);
  defineRule('one_of', one_of);
  defineRule('regex', regex);
  defineRule('required', legacyRequired);
  defineRule('size', size);
  defineRule('url', url);
  configure({
    generateMessage: (context) =>
      legacyMessage(context.label ?? context.field, context.rule?.name ?? '', context.rule?.params),
  });
}
