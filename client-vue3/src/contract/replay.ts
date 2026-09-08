import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ReplayCorpus, Scenario } from './types';
import { describeMismatch, jsonBody } from './types';

export interface ActualRequest {
  method: string;
  url: string;
  body?: unknown;
}

export interface ReplayResult {
  ok: boolean;
  failures: string[];
}

const DRIFT_STATUS = 599;

export function createReplayServer() {
  let queue: Scenario[] = [];
  const requests: ActualRequest[] = [];
  const failures: string[] = [];

  const catchAll = http.all('*', async ({ request }) => {
    const expected = queue.shift();
    const url = new URL(request.url);
    if (!expected) {
      const detail = `store made an HTTP call when the corpus expected none (extra ${request.method} ${url.pathname})`;
      failures.push(detail);
      return HttpResponse.json({ error: 'contract drift', detail }, { status: DRIFT_STATUS });
    }

    const text = await request.text();
    let actualBody: unknown;
    try {
      actualBody = text ? JSON.parse(text) : undefined;
    } catch {
      actualBody = text;
    }
    const actual: ActualRequest = {
      method: request.method,
      url: url.pathname + url.search,
      body: actualBody,
    };
    requests.push(actual);

    const expectedPaths = [expected.request.url, `/api${expected.request.url}`];
    const mismatches: string[] = [];
    if (actual.method !== expected.request.method) {
      mismatches.push(`method: expected ${expected.request.method} got ${actual.method}`);
    }
    if (!expectedPaths.includes(actual.url)) {
      mismatches.push(`url: expected ${expected.request.url} got ${actual.url}`);
    }
    mismatches.push(...describeMismatch(expected.request.body, actual.body, 'payload'));

    if (mismatches.length > 0) {
      const detail = `scenario "${expected.name}" request drift — ${mismatches.join('; ')}`;
      failures.push(detail);
      return HttpResponse.json({ error: 'contract drift', detail }, { status: DRIFT_STATUS });
    }

    return HttpResponse.json(jsonBody(expected.response.body), {
      status: expected.response.status,
    });
  });

  const server = setupServer();
  let listening = false;

  return {
    server,
    load(scenarios: Scenario[]) {
      queue = scenarios.map((s) => ({ ...s }));
      requests.length = 0;
      failures.length = 0;
      server.resetHandlers();
      server.use(catchAll);
      if (!listening) {
        server.listen({ onUnhandledRequest: 'error' });
        listening = true;
      }
    },
    requests: () => [...requests],
    pending: () => queue.map((s) => s.name),
    result(): ReplayResult {
      const all = [...failures];
      const pending = this.pending();
      if (pending.length > 0) {
        all.push(`store made no HTTP call for ${pending.length} scenario(s): ${pending.join(', ')}`);
      }
      return { ok: all.length === 0, failures: all };
    },
  };
}

export type { ReplayCorpus };
