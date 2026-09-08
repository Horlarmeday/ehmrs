// ! expectations authored from the LEGACY Vuex auth module, not the port
import { createPinia, setActivePinia } from 'pinia';
import { defineContractSuite } from '../contractTest';
import { asCredentials, stringField } from '../types';
import { useAuthStore } from '../../stores/auth';
import authCorpus from '../fixtures/auth.json' with { type: 'json' };

defineContractSuite({
  label: 'auth store contract (corpus: auth)',
  corpus: authCorpus,
  bootstrap: () => {
    setActivePinia(createPinia());
    localStorage.clear();
    return useAuthStore();
  },
  cases: [
    {
      name: 'login',
      act: (store, scenario) => store.login(asCredentials(scenario.request.body)),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ status: store.status, token: store.token }),
      expectSnapshot: (scenario) => ({
        status: scenario.response.status >= 400 ? 'error' : 'success',
        token: scenario.response.status >= 400 ? '' : (stringField(scenario.response.body, 'data') ?? ''),
      }),
      effects: (scenario) => {
        const expected =
          scenario.response.status >= 400 ? null : stringField(scenario.response.body, 'data');
        const actual = localStorage.getItem('user_token');
        return expected === actual
          ? []
          : [`localStorage.user_token: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`];
      },
    },
  ],
});
