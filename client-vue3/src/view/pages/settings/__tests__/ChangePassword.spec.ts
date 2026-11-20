// ! expectations follow the legacy ChangePassword.vue trace table in tasks/42-auth-tracer-bullet.md
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createReplayServer } from '../../../../contract/replay';
import { expectToasts, resetSideEffects } from '../../../../contract/effects';
import type { Scenario } from '../../../../contract/types';
import { setupValidation } from '../../../../validation/setup';
import settingsCorpus from '../../../../contract/fixtures/settings.json' with { type: 'json' };
import ChangePassword from '../page/ChangePassword.vue';

const replay = createReplayServer();

function scenario(name: string): Scenario {
  const found = settingsCorpus.scenarios.find((s) => s.name === name);
  if (!found) throw new Error(`no scenario "${name}"`);
  return found;
}

const field = (s: Scenario, key: string) => String(Reflect.get(Object(s.request.body), key));

async function render() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/settings/change-password', component: ChangePassword }],
  });
  await router.push('/settings/change-password');
  await router.isReady();
  const wrapper = mount(ChangePassword, { global: { plugins: [router] }, attachTo: document.body });
  await flushPromises();
  return wrapper;
}

async function type(wrapper: ReturnType<typeof mount>, name: string, value: string) {
  await wrapper.get(`input[name="${name}"]`).setValue(value);
  await wrapper.get(`input[name="${name}"]`).trigger('blur');
  await flushPromises();
}

async function fillFrom(wrapper: ReturnType<typeof mount>, s: Scenario) {
  await type(wrapper, 'current_password', field(s, 'oldPassword'));
  await type(wrapper, 'new_password', field(s, 'newPassword'));
  await type(wrapper, 'confirm_password', field(s, 'confirmPassword'));
}

async function submit(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  await flushPromises();
}

const value = (wrapper: ReturnType<typeof mount>, name: string) =>
  wrapper.get<HTMLInputElement>(`input[name="${name}"]`).element.value;

beforeAll(() => setupValidation());

beforeEach(() => {
  document.body.innerHTML = '';
  setActivePinia(createPinia());
  resetSideEffects();
});

describe('change password view (legacy ChangePassword.vue)', () => {
  it('refuses empty fields with the legacy messages and sends nothing', async () => {
    replay.load([]);
    const wrapper = await render();
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(wrapper.text()).toContain('The current_password field is required');
    expect(wrapper.text()).toContain('The new_password field is required');
    expect(wrapper.text()).toContain('The confirm_password field is required');
    wrapper.unmount();
  });

  it('refuses a new password that does not match, with the legacy confirmed message', async () => {
    replay.load([]);
    const wrapper = await render();
    await type(wrapper, 'current_password', 'OldPass1');
    await type(wrapper, 'confirm_password', 'NewPass2');
    await type(wrapper, 'new_password', 'NewPass1');
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(wrapper.text()).toContain('The new_password confirmation does not match');
    wrapper.unmount();
  });

  it('sends exactly { oldPassword, newPassword, confirmPassword } and clears the fields on success', async () => {
    const ok = scenario('POST /api/auth/change-password -> 201');
    replay.load([ok]);
    const wrapper = await render();
    await fillFrom(wrapper, ok);
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(
      ['current_password', 'new_password', 'confirm_password'].map((n) => value(wrapper, n))
    ).toEqual(['', '', '']);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('field is required');
    expect(
      expectToasts([{ title: 'Success message', text: 'Password changed!', type: 'success' }])
    ).toEqual([]);
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it('saves after an empty submit was refused first', async () => {
    const ok = scenario('POST /api/auth/change-password -> 201');
    replay.load([ok]);
    const wrapper = await render();
    await submit(wrapper);
    expect(wrapper.text()).toContain('The current_password field is required');
    await wrapper.get('input[name="current_password"]').setValue(field(ok, 'oldPassword'));
    await wrapper.get('input[name="new_password"]').setValue(field(ok, 'newPassword'));
    await wrapper.get('input[name="confirm_password"]').setValue(field(ok, 'confirmPassword'));
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    wrapper.unmount();
  });

  it('keeps the fields and shows the server message when the old password is wrong', async () => {
    const wrong = scenario('POST /api/auth/change-password -> 400');
    replay.load([wrong]);
    const wrapper = await render();
    await fillFrom(wrapper, wrong);
    await submit(wrapper);
    expect(replay.result().failures).toEqual([]);
    expect(value(wrapper, 'current_password')).toBe(field(wrong, 'oldPassword'));
    expect(
      expectToasts([{ title: 'Error message', text: 'Old password not correct', type: 'error' }])
    ).toEqual([]);
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });
});
