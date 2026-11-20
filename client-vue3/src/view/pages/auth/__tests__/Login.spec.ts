// ! expectations follow the legacy Login-1.vue trace table in tasks/42-auth-tracer-bullet.md
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { createReplayServer } from '../../../../contract/replay';
import { expectHardRedirects, expectToasts, resetSideEffects } from '../../../../contract/effects';
import type { Scenario } from '../../../../contract/types';
import { setupValidation } from '../../../../validation/setup';
import authCorpus from '../../../../contract/fixtures/auth.json' with { type: 'json' };
import settingsCorpus from '../../../../contract/fixtures/settings.json' with { type: 'json' };
import Login from '../Login-1.vue';

const replay = createReplayServer();

function scenario(corpus: { scenarios: Scenario[] }, name: string): Scenario {
  const found = corpus.scenarios.find((s) => s.name === name);
  if (!found) throw new Error(`no scenario "${name}"`);
  return found;
}

const settingsGet = scenario(settingsCorpus, 'GET /api/settings/system-settings/get -> 200');
const loginOk = scenario(authCorpus, 'POST /api/auth/login -> 200');
const loginWrong = scenario(authCorpus, 'POST /api/auth/login -> 400');
const loginDeactivated = scenario(authCorpus, 'POST /api/auth/login -> 401');
const credentials = (s: Scenario) => ({
  username: String(Reflect.get(Object(s.request.body), 'username')),
  password: String(Reflect.get(Object(s.request.body), 'password')),
});
const organization = String(
  Reflect.get(
    Object(Reflect.get(Object(settingsGet.response.body), 'data')),
    'name_of_organization'
  )
);

async function render(): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/auth/login', component: Login },
      { path: '/dashboard', component: { render: () => null } },
    ],
  });
  await router.push('/auth/login');
  await router.isReady();
  const wrapper = mount(Login, { global: { plugins: [router] }, attachTo: document.body });
  await flushPromises();
  return { wrapper, router };
}

async function fill(wrapper: ReturnType<typeof mount>, username: string, password: string) {
  await wrapper.get('input[name="username"]').setValue(username);
  await wrapper.get('input[name="username"]').trigger('blur');
  await wrapper.get('input[name="password"]').setValue(password);
  await wrapper.get('input[name="password"]').trigger('blur');
  await flushPromises();
}

async function submit(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  await flushPromises();
}

beforeAll(() => {
  setupValidation();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
});

beforeEach(() => {
  document.body.innerHTML = '';
  setActivePinia(createPinia());
  resetSideEffects();
  sessionStorage.clear();
});

describe('sign-in view (legacy Login-1.vue)', () => {
  it('fetches the settings on create, caches them and shows the organization name', async () => {
    replay.load([settingsGet]);
    const { wrapper } = await render();
    expect(replay.result().failures).toEqual([]);
    expect(JSON.parse(localStorage.getItem('settings') ?? 'null')).toEqual(
      Reflect.get(Object(settingsGet.response.body), 'data')
    );
    expect(wrapper.text()).toContain(organization);
    wrapper.unmount();
  });

  it('refuses short fields with the legacy messages and sends nothing', async () => {
    replay.load([settingsGet]);
    const { wrapper, router } = await render();
    await fill(wrapper, 'ab', '12345');
    expect(wrapper.text()).toContain('The username field must be at least 3 characters');
    expect(wrapper.text()).toContain('The password field must be at least 6 characters');
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(router.currentRoute.value.fullPath).toBe('/auth/login');
    wrapper.unmount();
  });

  it('sends exactly { username, password } and stays on sign-in when the server refuses', async () => {
    replay.load([settingsGet, loginWrong]);
    const { wrapper, router } = await render();
    const typed = credentials(loginWrong);
    await fill(wrapper, typed.username, typed.password);
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(router.currentRoute.value.fullPath).toBe('/auth/login');
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined();
    expect(localStorage.getItem('user_token')).toBeNull();
    expect(
      expectToasts([
        { title: 'Error message', text: 'Invalid username or password', type: 'error' },
      ])
    ).toEqual([]);
    wrapper.unmount();
  });

  it('stores the token, clears the form and goes to /dashboard on success', async () => {
    replay.load([settingsGet, loginOk]);
    const { wrapper, router } = await render();
    const typed = credentials(loginOk);
    await fill(wrapper, typed.username, typed.password);
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(localStorage.getItem('user_token')).toBe(
      String(Reflect.get(Object(loginOk.response.body), 'data'))
    );
    expect(router.currentRoute.value.fullPath).toBe('/dashboard');
    expect(wrapper.get<HTMLInputElement>('input[name="username"]').element.value).toBe('');
    expect(wrapper.get<HTMLInputElement>('input[name="password"]').element.value).toBe('');
    wrapper.unmount();
  });

  it('sends one request when submitted twice while signing in', async () => {
    replay.load([settingsGet, loginOk]);
    const { wrapper } = await render();
    const typed = credentials(loginOk);
    await fill(wrapper, typed.username, typed.password);
    wrapper.get('form').trigger('submit');
    wrapper.get('form').trigger('submit');
    await flushPromises();
    await flushPromises();
    expect(replay.result().failures).toEqual([]);
    expect(replay.requests().filter((r) => r.url.endsWith('/auth/login'))).toHaveLength(1);
    wrapper.unmount();
  });

  it('keeps the deactivated message across the 401 logout reload and shows it once', async () => {
    replay.load([settingsGet, loginDeactivated]);
    const first = await render();
    const typed = credentials(loginDeactivated);
    await fill(first.wrapper, typed.username, typed.password);
    await submit(first.wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(expectHardRedirects(['/'])).toEqual([]);
    first.wrapper.unmount();

    replay.load([settingsGet]);
    const second = await render();
    expect(second.wrapper.get('[role="alert"]').text()).toBe(
      'This account has been deactivated, please contact support'
    );
    second.wrapper.unmount();

    replay.load([settingsGet]);
    const third = await render();
    expect(third.wrapper.find('[role="alert"]').exists()).toBe(false);
    third.wrapper.unmount();
  });

  it('still works when the settings request fails and the cache is corrupt', async () => {
    localStorage.setItem('settings', '{not json');
    replay.load([{ ...settingsGet, response: { status: 500, body: { message: 'server error' } } }]);
    const { wrapper } = await render();
    expect(wrapper.get('h1').text()).toBe('Sign in');
    expect(wrapper.text()).not.toContain(organization);
    wrapper.unmount();
  });
});
