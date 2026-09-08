/**
 * Contract-test template for store ports (issue #36).
 *
 * A contract test drives the ported store exactly as the legacy view layer
 * drove the Vuex module and asserts both halves of ADR-0003's drift gate:
 *
 *   request-out: same store call in ⇒ same HTTP request out (method, URL, payload)
 *   state-in:    same response in ⇒ same state transition
 *
 * Expected state transitions are authored from the LEGACY module semantics
 * (mutations + action bodies), not from the port — that is what makes the
 * template a gate rather than a tautology.
 */
import { describe, expect, it } from 'vitest';
import { createReplayServer } from './replay';
import { describeMismatch } from './types';
import type { Scenario } from './types';

export interface ContractCase<S> {
  /** Vitest test label prefix; defaults to the case's field order. */
  name?: string;
  /** Drive the store the way the legacy view drove the Vuex module. */
  act: (store: S, scenario: Scenario) => Promise<unknown> | unknown;
  /** Whether the legacy action rejects for this scenario (e.g. failed login). */
  rejects?: (scenario: Scenario) => boolean;
  /** State snapshot after the action — a projection of legacy state. */
  snapshot: (store: S) => unknown;
  /** Expected snapshot value, authored from legacy mutation semantics. */
  expectSnapshot: (scenario: Scenario) => unknown;
  /** Extra observable side effects, e.g. localStorage (returns failure strings). */
  effects?: (scenario: Scenario) => string[];
}

export interface ContractCaseResult extends ReturnType<ReturnType<typeof createReplayServer>['result']> {
  snapshotFailures: string[];
}

/**
 * Run one scenario against one case without vitest wiring (used by the
 * self-test). Uses the module-level shared replay server — callers must run
 * cases sequentially.
 */
const sharedReplay = createReplayServer();

export async function runContractCase<S>(opts: {
  scenario: Scenario;
  bootstrap: () => S;
  testCase: ContractCase<S>;
}): Promise<ContractCaseResult> {
  const { scenario, bootstrap, testCase } = opts;
  sharedReplay.load([scenario]);

  const store = bootstrap();

  let rejected = false;
  let rejection: unknown;
  try {
    await testCase.act(store, scenario);
  } catch (err) {
    rejected = true;
    rejection = err;
  }
  void rejection;

  const failures: string[] = [];
  const expectedReject = testCase.rejects?.(scenario) ?? false;
  if (expectedReject && !rejected) {
    failures.push('action was expected to reject but resolved');
  }
  if (!expectedReject && rejected) {
    failures.push('action rejected unexpectedly');
  }

  const requestResult = sharedReplay.result();
  const snapshotFailures = describeMismatch(
    testCase.expectSnapshot(scenario),
    testCase.snapshot(store),
    'state',
  );
  const effectFailures = testCase.effects?.(scenario) ?? [];

  return {
    ...requestResult,
    failures: [...failures, ...requestResult.failures, ...effectFailures],
    snapshotFailures,
  };
}

/**
 * Wire a suite into vitest: one `it` per (scenario × case). The suite is green
 * only when every request-out and state-in assertion holds.
 */
export function defineContractSuite<S>(opts: {
  label: string;
  corpus: { scenarios: Scenario[] };
  bootstrap: () => S;
  cases: ContractCase<S>[];
}) {
  describe(opts.label, () => {
    for (const scenario of opts.corpus.scenarios) {
      it(scenario.name, async () => {
        const failures: string[] = [];
        for (const testCase of opts.cases) {
          const result = await runContractCase({ scenario, bootstrap: opts.bootstrap, testCase });
          failures.push(...result.failures, ...result.snapshotFailures);
        }
        expect(failures, `contract drift in "${scenario.name}"`).toEqual([]);
      });
    }
  });
}
