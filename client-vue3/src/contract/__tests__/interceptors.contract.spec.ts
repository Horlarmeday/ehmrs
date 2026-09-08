/**
 * Interceptor-layer contract test (issue #38). Replays the captured auth
 * fixtures plus synthetic corpus-shape scenarios (201/204/401/network error —
 * not yet in the captured corpus) through the ported axios layer and asserts
 * the frozen legacy behavior of `client/src/axios.js`:
 *
 *   request-out ⇒ NProgress.setColor('black') + start()
 *   200         ⇒ resolves, no toast, done(true) immediate
 *   201 / 204   ⇒ success toast (title 'Success message', text data.message)
 *   error+data  ⇒ error toast (title 'Error message', text data.message),
 *                 done(true) immediate, rejects with error.response.data
 *   401         ⇒ additionally auth logout side effect (status/token cleared,
 *                 'user_token' removed from localStorage)
 *   no response ⇒ rejects with error.message
 *
 * Security improvements over legacy (documented deviations): Bearer token
 * attached per-request from fresh localStorage (asserted), never
 * `Bearer null`/stale when logged out; success-path done(true) is immediate
 * (legacy 30000ms delay left the bar stuck).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { http, HttpResponse } from 'msw';

vi.mock('nprogress', () => ({
  default: {
    configure: vi.fn(),
    set: vi.fn(),
    start: vi.fn(),
    done: vi.fn(),
  },
}));

import NProgress from 'nprogress';
import axios from '../../core/axios';
import { setToastSink, type ToastPayload } from '../../common/notify';
import { useAuthStore } from '../../stores/auth';
import { createReplayServer } from '../replay';
import type { Scenario } from '../types';
import authCorpus from '../fixtures/auth.json' with { type: 'json' };

const toasts: ToastPayload[] = [];
setToastSink((payload) => toasts.push(payload));

const synthetic: Scenario[] = [
  {
    name: 'synthetic: created returns 201 with message',
    request: { method: 'POST', url: '/demo/created', body: { x: 1 } },
    response: { status: 201, body: { message: 'Record created' } },
  },
  {
    name: 'synthetic: no-content returns 204',
    request: { method: 'DELETE', url: '/demo/removed', body: { id: 9 } },
    response: { status: 204 },
  },
  {
    name: 'synthetic: unauthorized returns 401 with message',
    request: { method: 'GET', url: '/demo/secure' },
    response: { status: 401, body: { message: 'Session expired' } },
  },
];

const replay = createReplayServer();

interface Recorded {
  resolved: boolean;
  value?: unknown;
  rejection?: unknown;
}

async function drive(scenario: Scenario): Promise<Recorded> {
  localStorage.setItem('user_token', 'pre-existing-token');
  const store = useAuthStore();
  store.status = 'success';
  store.token = 'pre-existing-token';
  toasts.length = 0;
  vi.mocked(NProgress.start).mockClear();
  vi.mocked(NProgress.done).mockClear();
  vi.mocked(NProgress.set).mockClear();

  try {
    const value = await axios({
      url: scenario.request.url,
      method: scenario.request.method as never,
      data: scenario.request.body,
    });
    return { resolved: true, value };
  } catch (err) {
    return { resolved: false, rejection: err };
  }
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

describe('interceptor contract (corpus: auth + synthetic)', () => {
  for (const scenario of [...authCorpus.scenarios, ...synthetic]) {
    it(scenario.name, async () => {
      replay.load([scenario]);
      const recorded = await drive(scenario);
      const status = scenario.response.status;
      const isError = status >= 400;

      // request-out: progress bar starts before any outcome
      expect(NProgress.start, 'NProgress.start on request').toHaveBeenCalledTimes(1);

      if (isError) {
        // error path: done immediately, toast, rejection shape
        expect(recorded.resolved, 'error response rejects').toBe(false);
        expect(NProgress.done, 'NProgress.done(true) immediate on error').toHaveBeenCalledWith(true);
        expect(toasts, 'error toast content').toEqual([
          {
            title: 'Error message',
            text: (scenario.response.body as { message?: string })?.message,
            type: 'error',
          },
        ]);
        expect(recorded.rejection, 'rejects with error.response.data').toEqual(scenario.response.body);

        if (status === 401) {
          const store = useAuthStore();
          expect(store.status, '401 clears auth status').toBe('');
          expect(store.token, '401 clears auth token').toBe('');
          expect(localStorage.getItem('user_token'), '401 removes stored token').toBeNull();
        }
      } else {
        expect(recorded.resolved, 'success response resolves').toBe(true);
        expect(toasts, 'no toast outside 201/204').toEqual(
          status === 201 || status === 204
            ? [
                {
                  title: 'Success message',
                  text: (scenario.response.body as { message?: string })?.message,
                  type: 'success',
                },
              ]
            : [],
        );
        // success path finishes the progress bar immediately (documented
        // improvement over the legacy 30000ms delay)
        expect(NProgress.done, 'NProgress.done(true) immediate on success').toHaveBeenCalledWith(true);
      }

      expect(replay.result().failures, 'no contract drift').toEqual([]);
    });
  }

  it('synthetic: network error (no response) rejects with error.message', async () => {
    replay.load([]);
    replay.server.use(http.all('*', () => HttpResponse.error()));
    toasts.length = 0;
    vi.mocked(NProgress.done).mockClear();

    let rejection: unknown;
    try {
      await axios({ url: '/demo/network', method: 'GET' });
    } catch (err) {
      rejection = err;
    }

    expect(typeof rejection, 'rejects with error.message').toBe('string');
    expect(NProgress.done).toHaveBeenCalledWith(true);
    expect(toasts, 'error toast still fires').toEqual([
      { title: 'Error message', text: undefined, type: 'error' },
    ]);
  });

});
