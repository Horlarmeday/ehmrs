import { describe, expect, it } from 'vitest';
import { createReplayServer } from './replay';
import { describeMismatch } from './types';
import type { Scenario } from './types';

export interface ContractCase<S> {
  name?: string;
  act: (store: S, scenario: Scenario) => Promise<unknown> | unknown;
  rejects?: (scenario: Scenario) => boolean;
  snapshot: (store: S) => unknown;
  expectSnapshot: (scenario: Scenario) => unknown;
  effects?: (scenario: Scenario) => string[];
}

export interface ContractCaseResult extends ReturnType<ReturnType<typeof createReplayServer>['result']> {
  snapshotFailures: string[];
}

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
