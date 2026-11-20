import { describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import axios from '../../core/axios';
import { runContractCase } from '../contractTest';
import { resetSideEffects } from '../effects';
import type { Scenario } from '../types';
import settingsCorpus from '../fixtures/settings.json' with { type: 'json' };
import alertCorpus from '../fixtures/alert.json' with { type: 'json' };

function scenario(corpus: { scenarios: Scenario[] }, name: string): Scenario {
  const found = corpus.scenarios.find((s) => s.name === name);
  if (!found) throw new Error(`corpus has no scenario "${name}"`);
  return found;
}

const data = (s: Scenario): unknown => Reflect.get(Object(s.response.body), 'data');
const body = (s: Scenario, key: string): unknown => Reflect.get(Object(s.request.body), key);

interface Drifted {
  state: Record<string, unknown>;
  run: (s: Scenario) => Promise<unknown>;
}

const drifts: {
  name: string;
  scenario: Scenario;
  make: () => Drifted;
  expected: (s: Scenario) => Record<string, unknown>;
}[] = [
  {
    name: 'settings.fetchSettings calls the wrong URL',
    scenario: scenario(settingsCorpus, 'GET /api/settings/system-settings/get -> 200'),
    make: () => {
      const state: Record<string, unknown> = { settings: null };
      return {
        state,
        run: () =>
          axios.get('/settings/system-settings').then((r) => (state.settings = r.data.data)),
      };
    },
    expected: (s) => ({ settings: data(s) }),
  },
  {
    name: 'settings.fetchSettings skips SET_SETTINGS',
    scenario: scenario(settingsCorpus, 'GET /api/settings/system-settings/get -> 200'),
    make: () => {
      const state: Record<string, unknown> = { settings: null };
      return { state, run: () => axios.get('/settings/system-settings/get') };
    },
    expected: (s) => ({ settings: data(s) }),
  },
  {
    name: 'settings.changePassword drops confirmPassword',
    scenario: scenario(settingsCorpus, 'POST /api/auth/change-password -> 201'),
    make: () => ({
      state: {},
      run: (s) =>
        axios.post('/auth/change-password', {
          oldPassword: body(s, 'oldPassword'),
          newPassword: body(s, 'newPassword'),
        }),
    }),
    expected: () => ({}),
  },
  {
    name: 'alert.fetchAlerts renames pageLimit',
    scenario: scenario(
      alertCorpus,
      'GET /api/alerts/get?currentPage=1&pageLimit=10&visit_id=27693 -> 200'
    ),
    make: () => ({
      state: {},
      run: () =>
        axios.get('/alerts/get', {
          params: { currentPage: 1, itemsPerPage: 10, visit_id: 27693 },
        }),
    }),
    expected: () => ({}),
  },
  {
    name: 'alert.updateAlert uses POST',
    scenario: scenario(alertCorpus, 'PUT /api/alerts/update/8 -> 200'),
    make: () => ({
      state: {},
      run: (s) => axios.post(`/alerts/update/${body(s, 'id')}`, s.request.body),
    }),
    expected: () => ({}),
  },
];

describe('negative controls: drifted settings and alert stores fail their contracts', () => {
  for (const drift of drifts) {
    it(drift.name, async () => {
      setActivePinia(createPinia());
      resetSideEffects();
      const store = drift.make();
      const result = await runContractCase({
        scenario: drift.scenario,
        bootstrap: () => store,
        testCase: {
          act: (s, sc) => s.run(sc),
          rejects: () => false,
          snapshot: (s) => s.state,
          expectSnapshot: drift.expected,
        },
      });
      const caught = [...result.failures, ...result.snapshotFailures];
      expect(caught.length, `drift "${drift.name}" went undetected`).toBeGreaterThan(0);
    });
  }
});
