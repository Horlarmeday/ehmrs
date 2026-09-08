export interface Scenario {
  name: string;
  request: { method: string; url: string; body?: unknown };
  response: { status: number; body?: unknown };
}

export interface ReplayCorpus {
  version: 1;
  flow: string;
  capturedAt: string;
  scenarios: Scenario[];
}

export interface StaffCredentials {
  username: string;
  password: string;
}

export function asCredentials(body: unknown): StaffCredentials {
  if (typeof body === 'object' && body !== null) {
    const username = Reflect.get(body, 'username');
    const password = Reflect.get(body, 'password');
    if (typeof username === 'string' && typeof password === 'string') {
      return { username, password };
    }
  }
  throw new Error(`scenario body is not staff credentials: ${JSON.stringify(body)}`);
}

export function stringField(source: unknown, key: string): string | undefined {
  if (typeof source === 'object' && source !== null) {
    const value = Reflect.get(source, key);
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export function jsonBody(value: unknown): Record<string, unknown> | unknown[] | string | number | boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    // eslint-disable-next-line no-restricted-syntax -- single sanctioned boundary conversion, runtime-checked above
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function describeMismatch(
  expected: unknown,
  actual: unknown,
  path = 'value',
): string[] {
  if (expected === actual) return [];
  if (
    typeof expected === 'object' && expected !== null && !Array.isArray(expected) &&
    typeof actual === 'object' && actual !== null && !Array.isArray(actual)
  ) {
    const out: string[] = [];
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const k of keys) {
      out.push(
        ...describeMismatch(
          Reflect.get(expected, k),
          Reflect.get(actual, k),
          `${path}.${k}`,
        ),
      );
    }
    return out;
  }
  return [`${path}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`];
}
