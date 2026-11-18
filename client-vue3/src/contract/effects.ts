import { vi } from 'vitest';
import { setToastSink, type ToastPayload } from '../common/notify';
import type { Scenario } from './types';

let replace = vi.fn();
const toasts: ToastPayload[] = [];

export function resetSideEffects(): void {
  localStorage.clear();
  vi.unstubAllGlobals();
  replace = vi.fn();
  vi.stubGlobal('location', { ...window.location, replace });
  toasts.length = 0;
  setToastSink((toast) => toasts.push(toast));
}

function compare(label: string, expected: unknown, actual: unknown): string[] {
  return JSON.stringify(expected) === JSON.stringify(actual)
    ? []
    : [`${label}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`];
}

export function expectHardRedirects(expected: string[]): string[] {
  return compare(
    'location.replace calls',
    expected,
    replace.mock.calls.map((call) => String(call[0]))
  );
}

export function expectStoredToken(expected: string | null): string[] {
  return compare('localStorage.user_token', expected, localStorage.getItem('user_token'));
}

export function expectToasts(expected: ToastPayload[]): string[] {
  return compare('toasts', expected, toasts);
}

function messageOf(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const message = Reflect.get(body, 'message');
  return typeof message === 'string' ? message : undefined;
}

export function legacyToastsFor(scenario: Scenario): ToastPayload[] {
  const { status, body } = scenario.response;
  if (status === 201 || status === 204) {
    return [{ title: 'Success message', text: messageOf(body), type: 'success' }];
  }
  if (status >= 400) return [{ title: 'Error message', text: messageOf(body), type: 'error' }];
  return [];
}

export function legacyRedirectsFor(scenario: Scenario): string[] {
  return scenario.response.status === 401 ? ['/'] : [];
}

export const isRoute =
  (method: string, path: string) =>
  (scenario: Scenario): boolean =>
    scenario.request.method === method && (scenario.request.url.split('?')[0] ?? '').endsWith(path);
