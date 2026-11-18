// ! expectations authored from the LEGACY Vuex settings module and legacy axios.js, not the port
import { createPinia, setActivePinia } from 'pinia';
import { defineContractSuite } from '../contractTest';
import {
  expectHardRedirects,
  expectToasts,
  isRoute,
  legacyRedirectsFor,
  legacyToastsFor,
  resetSideEffects,
} from '../effects';
import type { Scenario } from '../types';
import { useSettingsStore, type SystemSettings } from '../../stores/settings';
import type { ChangePasswordRequest } from '../../types/api/auth';
import settingsCorpus from '../fixtures/settings.json' with { type: 'json' };

const dataOf = (scenario: Scenario): unknown =>
  scenario.response.status >= 400 ? null : Reflect.get(Object(scenario.response.body), 'data');

function settingsBody(body: unknown): SystemSettings {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error(`scenario body is not a settings object: ${JSON.stringify(body)}`);
  }
  return Object.assign(Object.create(null), body);
}

function passwordBody(body: unknown): ChangePasswordRequest {
  const read = (key: string) => {
    const value = Reflect.get(Object(body), key);
    if (typeof value !== 'string') throw new Error(`scenario body has no ${key}`);
    return value;
  };
  return {
    oldPassword: read('oldPassword'),
    newPassword: read('newPassword'),
    confirmPassword: read('confirmPassword'),
  };
}

const sideEffects = (scenario: Scenario) => [
  ...expectHardRedirects(legacyRedirectsFor(scenario)),
  ...expectToasts(legacyToastsFor(scenario)),
];

defineContractSuite({
  label: 'settings store contract (corpus: settings)',
  corpus: settingsCorpus,
  bootstrap: () => {
    setActivePinia(createPinia());
    resetSideEffects();
    return useSettingsStore();
  },
  cases: [
    {
      name: 'fetchSettings',
      match: isRoute('GET', '/settings/system-settings/get'),
      act: (store) => store.fetchSettings(),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ settings: store.settings }),
      expectSnapshot: (scenario) => ({ settings: dataOf(scenario) }),
      effects: sideEffects,
    },
    {
      name: 'updateSettings',
      match: isRoute('POST', '/settings/system-settings/update'),
      act: (store, scenario) => store.updateSettings(settingsBody(scenario.request.body)),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ settings: store.settings }),
      expectSnapshot: (scenario) => ({ settings: dataOf(scenario) }),
      effects: sideEffects,
    },
    {
      name: 'changePassword',
      match: isRoute('POST', '/auth/change-password'),
      act: (store, scenario) => store.changePassword(passwordBody(scenario.request.body)),
      rejects: (scenario) => scenario.response.status >= 400,
      snapshot: (store) => ({ settings: store.settings }),
      expectSnapshot: () => ({ settings: null }),
      effects: sideEffects,
    },
  ],
});
