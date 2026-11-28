import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import { setupSentry } from '../sentry';

const NAME = 'Zorvik Quellan';
const PHONE = '08031234567';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl';

function env(overrides: Partial<ImportMetaEnv>): ImportMetaEnv {
  return { ...import.meta.env, VITE_SENTRY_DSN: '', ...overrides };
}

describe('setupSentry', () => {
  afterEach(async () => {
    await Sentry.close();
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  test('does nothing without a DSN', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect(await setupSentry(createApp({}), env({}))).toBe(false);
    expect(Sentry.getClient()).toBeUndefined();
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('sends an event tagged v3 with no patient data in it', async () => {
    const bodies: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        bodies.push(String(init?.body ?? ''));
        return new Response('{}', { status: 200 });
      })
    );
    window.history.replaceState(null, '', `/patient/1203?name=${encodeURIComponent(NAME)}`);
    localStorage.setItem('user_token', TOKEN);

    const started = await setupSentry(
      createApp({}),
      env({ VITE_SENTRY_DSN: 'https://public@o1.ingest.sentry.io/1', VITE_SENTRY_ENVIRONMENT: 'test' })
    );
    expect(started).toBe(true);

    Sentry.addBreadcrumb({ category: 'console', message: `patient ${NAME}` });
    Sentry.addBreadcrumb({
      category: 'xhr',
      type: 'http',
      data: { method: 'GET', url: `/api/patients/1203?phone=${PHONE}`, status_code: 200 },
    });
    Sentry.captureException(new Error(`could not save ${PHONE}`));
    await Sentry.flush(2000);

    const sent = bodies.join('\n');
    expect(sent).toContain('"app":"v3"');
    expect(sent).toContain('"environment":"test"');
    expect(sent).toContain('/api/patients/:id');
    expect(sent).toContain('/patient/:id');
    for (const secret of [NAME, 'Quellan', PHONE, TOKEN, '1203']) {
      expect(sent).not.toContain(secret);
    }
    localStorage.removeItem('user_token');
  });
});
