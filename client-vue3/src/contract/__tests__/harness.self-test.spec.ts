/**
 * Harness self-test — a drift gate that cannot fail protects nothing.
 *
 * Deliberately drifted stores (wrong URL, wrong payload, wrong state
 * transition, no HTTP call at all) must each FAIL the contract runner against
 * the real captured corpus, and the faithful port must pass it.
 */
import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { runContractCase } from '../contractTest';
import { useAuthStore } from '../../stores/auth';
import axios from '../../core/axios';
import authCorpus from '../fixtures/auth.json' with { type: 'json' };

const success = authCorpus.scenarios[0]!;

type AnyStore = { login: (staff: { username: string; password: string }) => Promise<unknown> };

function newAuthStore() {
  setActivePinia(createPinia());
  localStorage.clear();
  return useAuthStore();
}

const driftedStores: Record<string, { store: AnyStore; bootstrap: () => AnyStore; snapshot?: (s: AnyStore) => unknown }> = {
  'wrong URL': {
    store: {
      login: (body) => axios({ url: '/auth/login/v2', data: body, method: 'POST' }),
    },
    bootstrap: () => driftedStores['wrong URL']!.store,
  },
  'wrong method': {
    store: {
      login: (body) => axios({ url: '/auth/login', data: body, method: 'PUT' }),
    },
    bootstrap: () => driftedStores['wrong method']!.store,
  },
  'wrong payload': {
    store: {
      login: (body) => axios({ url: '/auth/login', data: { ...body, remember: true }, method: 'POST' }),
    },
    bootstrap: () => driftedStores['wrong payload']!.store,
  },
  'no HTTP call': {
    store: {
      login: async () => undefined,
    },
    bootstrap: () => driftedStores['no HTTP call']!.store,
  },
};

describe('contract harness self-test', () => {
  it('the faithful port passes the runner', async () => {
    const result = await runContractCase({
      scenario: success,
      bootstrap: newAuthStore,
      testCase: {
        act: (store, s) => store.login(s.request.body as { username: string; password: string }),
        snapshot: (store) => ({ status: store.status, token: store.token }),
        expectSnapshot: (s) => ({ status: 'success', token: (s.response.body as { data: string }).data }),
      },
    });
    expect(result.failures).toEqual([]);
    expect(result.snapshotFailures).toEqual([]);
  });

  for (const [drift, def] of Object.entries(driftedStores)) {
    it(`catches a deliberately drifted store: ${drift}`, async () => {
      const result = await runContractCase({
        scenario: success,
        bootstrap: def.bootstrap,
        testCase: {
          act: (store, s) => store.login(s.request.body as { username: string; password: string }),
          snapshot: (store) => (store as unknown as { status?: string }).status ?? '',
          expectSnapshot: () => 'success',
        },
      });
      expect(result.ok, `drift "${drift}" went undetected`).toBe(false);
    });
  }

  it('catches a wrong state transition with an identical HTTP call', async () => {
    const store = {
      status: '',
      login: (body: { username: string; password: string }) =>
        axios({ url: '/auth/login', data: body, method: 'POST' }).then(
          () => {
            store.status = 'error';
          },
          () => {
            store.status = 'error';
          },
        ),
    };
    const result = await runContractCase({
      scenario: success,
      bootstrap: () => store,
      testCase: {
        act: (s, sc) => s.login(sc.request.body as { username: string; password: string }),
        snapshot: (s) => ({ status: (s as typeof store).status }),
        expectSnapshot: () => ({ status: 'success' }),
      },
    });
    expect(result.failures).toEqual([]);
    expect(result.snapshotFailures.length).toBeGreaterThan(0);
  });
});
