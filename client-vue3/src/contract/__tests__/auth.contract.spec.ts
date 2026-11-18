// ! expectations authored from the LEGACY Vuex auth module and legacy axios.js, not the port
import { createPinia, setActivePinia } from 'pinia';
import { defineContractSuite } from '../contractTest';
import { asCredentials, stringField } from '../types';
import {
  expectHardRedirects,
  expectStoredToken,
  expectToasts,
  isRoute,
  legacyRedirectsFor,
  legacyToastsFor,
  resetSideEffects,
} from '../effects';
import { useAuthStore } from '../../stores/auth';
import authCorpus from '../fixtures/auth.json' with { type: 'json' };

function phoneOf(body: unknown): { phone: string } {
  const phone = stringField(body, 'phone');
  if (phone === undefined) throw new Error(`scenario body has no phone: ${JSON.stringify(body)}`);
  return { phone };
}

defineContractSuite({
  label: 'auth store contract (corpus: auth)',
  corpus: authCorpus,
  bootstrap: () => {
    setActivePinia(createPinia());
    resetSideEffects();
    return useAuthStore();
  },
  cases: [
    {
      name: 'login',
      match: isRoute('POST', '/auth/login'),
      act: (store, scenario) => store.login(asCredentials(scenario.request.body)),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ status: store.status, token: store.token }),
      expectSnapshot: (scenario) => ({
        status: scenario.response.status >= 400 ? 'error' : 'success',
        token:
          scenario.response.status >= 400
            ? ''
            : (stringField(scenario.response.body, 'data') ?? ''),
      }),
      effects: (scenario) => [
        ...expectStoredToken(
          scenario.response.status >= 400
            ? null
            : (stringField(scenario.response.body, 'data') ?? null)
        ),
        ...expectHardRedirects(legacyRedirectsFor(scenario)),
        ...expectToasts(legacyToastsFor(scenario)),
      ],
    },
    {
      name: 'forgot',
      match: isRoute('POST', '/auth/forgot-password'),
      act: (store, scenario) => store.forgot(phoneOf(scenario.request.body)),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ status: store.status, token: store.token }),
      expectSnapshot: (scenario) => ({
        status: scenario.response.status >= 400 ? 'error' : 'success',
        token:
          scenario.response.status >= 400
            ? ''
            : Reflect.get(Object(scenario.response.body), 'data'),
      }),
      effects: (scenario) => [
        ...expectStoredToken(null),
        ...expectHardRedirects(legacyRedirectsFor(scenario)),
        ...expectToasts(legacyToastsFor(scenario)),
      ],
    },
  ],
});
