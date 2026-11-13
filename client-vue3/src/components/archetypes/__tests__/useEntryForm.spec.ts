import { beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { setupValidation } from '../../../validation/setup';
import { useEntryForm } from '../useEntryForm';

beforeAll(() => {
  setupValidation();
});

async function setup(handler: (values: Record<string, unknown>) => Promise<unknown> | unknown) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  });
  await router.push('/');
  await router.isReady();
  let api!: {
    form: ReturnType<typeof useEntryForm>;
    name: ReturnType<ReturnType<typeof useEntryForm>['field']>;
    phone: ReturnType<ReturnType<typeof useEntryForm>['field']>;
    notes: ReturnType<ReturnType<typeof useEntryForm>['field']>;
    submit: (event?: Event) => Promise<unknown>;
  };
  const Host = defineComponent({
    setup() {
      const form = useEntryForm();
      api = {
        form,
        name: form.field('patient_name', {
          label: 'Patient name',
          as: 'name',
          rules: 'required|min:3',
          initial: '',
        }),
        phone: form.field('phone', {
          label: 'Phone',
          rules: 'required|min:11|max:11',
          initial: '',
        }),
        notes: form.field('notes', { label: 'Notes', initial: '' }),
        submit: form.submit(handler),
      };
      return () => h('div');
    },
  });
  mount(Host, { global: { plugins: [router] } });
  await flushPromises();
  return api;
}

describe('useEntryForm binding contract', () => {
  it('enforces exactly the rules given, with the legacy messages and names', async () => {
    const handler = vi.fn();
    const api = await setup(handler);
    await api.submit();
    await flushPromises();
    expect(handler).not.toHaveBeenCalled();
    expect(api.name.errorMessage.value).toBe('The name field is required');
    expect(api.phone.errorMessage.value).toBe('The phone field is required');
    expect(api.notes.errorMessage.value).toBeUndefined();
    expect(api.form.errors.value).toEqual([
      { field: 'patient_name', label: 'Patient name' },
      { field: 'phone', label: 'Phone' },
    ]);
    api.name.value.value = 'Al';
    await api.submit();
    await flushPromises();
    expect(api.name.errorMessage.value).toBe('The name field must be at least 3 characters');
  });

  it('calls the handler once with exactly the bound values when valid', async () => {
    const handler = vi.fn();
    const api = await setup(handler);
    api.name.value.value = 'Ada Obi';
    api.phone.value.value = '08012345678';
    await api.submit();
    await flushPromises();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toEqual({
      patient_name: 'Ada Obi',
      phone: '08012345678',
      notes: '',
    });
    expect(api.form.errors.value).toEqual([]);
  });

  it('ignores a second submit while the first is saving', async () => {
    let finish!: () => void;
    const handler = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const api = await setup(handler);
    api.name.value.value = 'Ada Obi';
    api.phone.value.value = '08012345678';
    const first = api.submit();
    await flushPromises();
    expect(api.form.saving.value).toBe(true);
    await api.submit();
    await flushPromises();
    finish();
    await first;
    await flushPromises();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(api.form.saving.value).toBe(false);
  });

  it('is dirty after typing and clean again after a successful save', async () => {
    const api = await setup(() => undefined);
    expect(api.form.dirty.value).toBe(false);
    expect(await api.form.confirmDiscard()).toBe(true);
    api.name.value.value = 'Ada Obi';
    api.phone.value.value = '08012345678';
    await flushPromises();
    expect(api.form.dirty.value).toBe(true);
    await api.submit();
    await flushPromises();
    expect(api.form.dirty.value).toBe(false);
  });

  it('keeps unsaved changes after a failed save', async () => {
    const api = await setup(() => {
      throw new Error('server refused');
    });
    api.name.value.value = 'Ada Obi';
    api.phone.value.value = '08012345678';
    await flushPromises();
    await api.submit().catch(() => undefined);
    await flushPromises();
    expect(api.form.dirty.value).toBe(true);
    expect(api.form.saving.value).toBe(false);
  });
});
