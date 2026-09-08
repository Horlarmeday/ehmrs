/** Corpus types — mirror of tools/contract-harness src/corpus.ts output. */
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

/** Deep structural equality with a readable path-annotated diff message. */
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
          (expected as Record<string, unknown>)[k],
          (actual as Record<string, unknown>)[k],
          `${path}.${k}`,
        ),
      );
    }
    return out;
  }
  return [`${path}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`];
}
