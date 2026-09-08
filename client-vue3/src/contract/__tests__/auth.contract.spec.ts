/**
 * Auth-flow contract test — the template exemplar for store ports.
 *
 * Expected behavior is authored from the LEGACY Vuex module
 * (client/src/core/services/store/auth/*), not from the Pinia port:
 *
 *   login(staff) commits auth_request; POSTs to /auth/login; on success stores
 *   response.data.data in localStorage('user_token') + state.token and commits
 *   auth_success (status 'success'); on failure commits auth_error (status
 *   'error'), removes the token, and rejects.
 */
import { createPinia, setActivePinia } from 'pinia';
import { defineContractSuite } from '../contractTest';
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
      act: (store, scenario) => store.login(scenario.request.body as { username: string; password: string }),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ status: store.status, token: store.token }),
      expectSnapshot: (scenario) => ({
        status: scenario.response.status >= 400 ? 'error' : 'success',
        token: scenario.response.status >= 400 ? '' : (scenario.response.body as { data: string }).data,
      }),
      effects: (scenario) => {
        const expected =
          scenario.response.status >= 400 ? null : (scenario.response.body as { data: string }).data;
        const actual = localStorage.getItem('user_token');
        return expected === actual
          ? []
          : [`localStorage.user_token: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`];
      },
    },
  ],
});
