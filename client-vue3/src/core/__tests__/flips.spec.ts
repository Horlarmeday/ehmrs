import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory } from 'vue-router';
import { createAppRouter } from '../../router';
import { FLIPS_URL, isFlipped, isValidPrefix, loadFlips, parseFlips, setFlips } from '../flips';

const FLIPS = ['/auth', '/settings/change-password'];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('flip list', () => {
  test('accepts path prefixes and rejects anything else', () => {
    expect(isValidPrefix('/auth')).toBe(true);
    expect(isValidPrefix('/settings/change-password')).toBe(true);
    for (const bad of ['auth', '/auth/', '/', '', '/api', '/api/x', '/static', '/v3', '/a b', '/a/../b', '/./a', '/..', 7]) {
      expect(isValidPrefix(bad)).toBe(false);
    }
  });

  test('parses a valid list, drops duplicates, rejects a bad one whole', () => {
    expect(parseFlips({ prefixes: ['/auth', '/auth'] })).toEqual(['/auth']);
    expect(parseFlips({ prefixes: [] })).toEqual([]);
    expect(parseFlips({ prefixes: ['/auth', '/api'] })).toBeNull();
    expect(parseFlips({ prefixes: '/auth' })).toBeNull();
    expect(parseFlips(['/auth'])).toBeNull();
    expect(parseFlips(null)).toBeNull();
  });

  test('matches on whole path segments', () => {
    expect(isFlipped('/auth', FLIPS)).toBe(true);
    expect(isFlipped('/auth/login', FLIPS)).toBe(true);
    expect(isFlipped('/authority', FLIPS)).toBe(false);
    expect(isFlipped('/settings/change-password', FLIPS)).toBe(true);
    expect(isFlipped('/settings', FLIPS)).toBe(false);
    expect(isFlipped('/settings/change-passwords', FLIPS)).toBe(false);
  });
});

describe('loadFlips', () => {
  afterEach(() => setFlips(null));

  test('requests the list without the cache', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ prefixes: FLIPS }));
    await loadFlips(fetcher);
    expect(fetcher).toHaveBeenCalledWith(FLIPS_URL, expect.objectContaining({ cache: 'no-store' }));
  });

  test.each([
    ['a 404', () => Promise.resolve(new Response('nope', { status: 404 }))],
    ['HTML instead of JSON', () => Promise.resolve(new Response('<!doctype html>', { status: 200 }))],
    ['a network failure', () => Promise.reject(new TypeError('offline'))],
  ])('treats %s as "list unknown" and never throws', async (_label, impl) => {
    await expect(loadFlips(vi.fn().mockImplementation(impl))).resolves.toBeUndefined();
    const handOff = vi.fn();
    const router = createAppRouter(createMemoryHistory(), handOff);
    setActivePinia(createPinia());
    localStorage.setItem('user_token', 't');
    await router.push('/auth/login');
    await router.push('/dashboard');
    expect(handOff).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe('/dashboard');
    localStorage.removeItem('user_token');
  });

  test('gives up after the timeout', async () => {
    vi.useFakeTimers();
    const fetcher: typeof fetch = (_url, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    const done = loadFlips(fetcher, 50);
    await vi.advanceTimersByTimeAsync(50);
    await expect(done).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe('hand-off to the legacy client', () => {
  let handOff: ReturnType<typeof vi.fn>;

  function router() {
    return createAppRouter(createMemoryHistory(), handOff);
  }

  beforeEach(() => {
    handOff = vi.fn();
    setActivePinia(createPinia());
    localStorage.removeItem('user_token');
  });

  afterEach(() => setFlips(null));

  test('a flipped route stays in this app', async () => {
    setFlips(FLIPS, '/auth/login');
    const r = router();
    await r.push('/auth/login');
    expect(handOff).not.toHaveBeenCalled();
    expect(r.currentRoute.value.path).toBe('/auth/login');
  });

  test('after sign-in, /dashboard is handed to legacy with a full load and the route does not change', async () => {
    setFlips(FLIPS, '/auth/login');
    localStorage.setItem('user_token', 't');
    const r = router();
    await r.push('/auth/login');
    await r.push('/dashboard');
    expect(handOff).toHaveBeenCalledWith('/dashboard');
    expect(r.currentRoute.value.path).toBe('/auth/login');
  });

  test('query and hash go along', async () => {
    setFlips(FLIPS, '/auth/login');
    localStorage.setItem('user_token', 't');
    const r = router();
    await r.push('/auth/login');
    await r.push('/patient?page=2#top');
    expect(handOff).toHaveBeenCalledWith('/patient?page=2#top');
  });

  test('the hand-off runs before the auth guard, so legacy applies its own guard', async () => {
    setFlips(FLIPS, '/settings/change-password');
    const r = router();
    await r.push('/settings/change-password');
    expect(r.currentRoute.value.path).toBe('/auth/login');
    expect(handOff).not.toHaveBeenCalled();
    await r.push('/dashboard');
    expect(handOff).toHaveBeenCalledWith('/dashboard');
  });

  test('the first page the server served is kept even if the list disagrees, so there is no reload loop', async () => {
    setFlips([], '/auth/login');
    const r = router();
    await r.push('/auth/login');
    expect(handOff).not.toHaveBeenCalled();
    expect(r.currentRoute.value.path).toBe('/auth/login');
  });

  test('a redirect during the first navigation is still handed off', async () => {
    setFlips(FLIPS, '/');
    localStorage.setItem('user_token', 't');
    const r = router();
    await r.push('/');
    expect(handOff).toHaveBeenCalledWith('/dashboard');
  });
});
