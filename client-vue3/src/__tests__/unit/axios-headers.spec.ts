import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

vi.mock('nprogress', () => ({ default: { configure: vi.fn(), set: vi.fn(), start: vi.fn(), done: vi.fn() } }));

import axios from '../../core/axios';

describe('axios token attach', () => {
  const seen: { authorization: string | null }[] = [];
  const headerServer = setupServer(
    http.all('*', ({ request }) => {
      seen.push({ authorization: request.headers.get('authorization') });
      return HttpResponse.json({}, { status: 200 });
    }),
  );

  beforeEach(() => {
    seen.length = 0;
    localStorage.clear();
  });

  it('sends Bearer <token> from a fresh localStorage read', async () => {
    headerServer.listen({ onUnhandledRequest: 'error' });
    localStorage.setItem('user_token', 'fresh-token-1');
    await axios({ url: '/demo/headers', method: 'GET' });
    localStorage.setItem('user_token', 'fresh-token-2');
    await axios({ url: '/demo/headers', method: 'GET' });
    headerServer.close();

    expect(seen).toEqual([
      { authorization: 'Bearer fresh-token-1' },
      { authorization: 'Bearer fresh-token-2' },
    ]);
  });

  it('never sends Authorization (no "Bearer null") when logged out', async () => {
    headerServer.listen({ onUnhandledRequest: 'error' });
    await axios({ url: '/demo/headers', method: 'GET' });
    headerServer.close();

    expect(seen).toEqual([{ authorization: null }]);
  });
});
