// ! expectations authored from the LEGACY Vuex alert module and legacy axios.js, not the port
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
import { useAlertStore } from '../../stores/alert';
import alertCorpus from '../fixtures/alert.json' with { type: 'json' };

const ok = (scenario: Scenario) => scenario.response.status < 400;
const dataOf = (scenario: Scenario): unknown => Reflect.get(Object(scenario.response.body), 'data');
const field = (source: unknown, key: string): unknown => Reflect.get(Object(source), key);

function numberField(source: unknown, key: string): number {
  const value = Number(field(source, key));
  if (!Number.isFinite(value)) throw new Error(`scenario has no numeric ${key}`);
  return value;
}

function createBody(body: unknown): { alert: string; visit_id: number } {
  numberField(body, 'visit_id');
  return Object.assign(Object.create(null), body);
}

function legacyFetchPayload(scenario: Scenario) {
  const query = new URLSearchParams(scenario.request.url.split('?')[1] ?? '');
  return {
    currentPage: Number(query.get('currentPage')),
    itemsPerPage: Number(query.get('pageLimit')),
    id: Number(query.get('visit_id')),
  };
}

const sideEffects = (scenario: Scenario) => [
  ...expectHardRedirects(legacyRedirectsFor(scenario)),
  ...expectToasts(legacyToastsFor(scenario)),
];

defineContractSuite({
  label: 'alert store contract (corpus: alert)',
  corpus: alertCorpus,
  bootstrap: () => {
    setActivePinia(createPinia());
    resetSideEffects();
    return useAlertStore();
  },
  cases: [
    {
      name: 'addAlert',
      match: isRoute('POST', '/alerts/create'),
      act: (store, scenario) => store.addAlert(createBody(scenario.request.body)),
      rejects: (scenario) => !ok(scenario),
      snapshot: (store) => ({ alert: store.alert }),
      expectSnapshot: (scenario) => ({ alert: ok(scenario) ? dataOf(scenario) : null }),
      effects: sideEffects,
    },
    {
      name: 'fetchAlerts',
      match: isRoute('GET', '/alerts/get'),
      act: (store, scenario) => store.fetchAlerts(legacyFetchPayload(scenario)),
      rejects: (scenario) => !ok(scenario),
      snapshot: (store) => ({ alerts: store.alerts, total: store.total, pages: store.pages }),
      expectSnapshot: (scenario) =>
        ok(scenario)
          ? {
              alerts: field(dataOf(scenario), 'docs'),
              total: field(dataOf(scenario), 'total'),
              pages: field(dataOf(scenario), 'pages'),
            }
          : { alerts: [], total: null, pages: 0 },
      effects: sideEffects,
    },
    {
      name: 'updateAlert',
      match: (scenario) =>
        scenario.request.method === 'PUT' && scenario.request.url.includes('/alerts/update/'),
      act: (store, scenario) =>
        store.updateAlert({
          id: numberField(scenario.request.body, 'id'),
          status: field(scenario.request.body, 'status'),
        }),
      rejects: (scenario) => !ok(scenario),
      snapshot: (store) => ({ alert: store.alert }),
      expectSnapshot: (scenario) => ({ alert: ok(scenario) ? dataOf(scenario) : null }),
      effects: sideEffects,
    },
  ],
});
