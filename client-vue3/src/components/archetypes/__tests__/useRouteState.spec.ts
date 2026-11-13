import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import {
  choiceField,
  intField,
  numberChoiceField,
  textField,
  useRouteParam,
} from '../useRouteState';

async function setup(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/list', component: { render: () => null } },
      { path: '/other', component: { render: () => null } },
    ],
  });
  await router.push(path);
  await router.isReady();
  let state!: {
    page: ReturnType<typeof useRouteParam<number>>;
    size: ReturnType<typeof useRouteParam<number>>;
    search: ReturnType<typeof useRouteParam<string>>;
    status: ReturnType<typeof useRouteParam<'Pending' | 'Complete' | null>>;
  };
  const Probe = defineComponent({
    setup() {
      state = {
        page: useRouteParam('page', intField({ fallback: 1, min: 1 })),
        size: useRouteParam('size', numberChoiceField([10, 50], 50)),
        search: useRouteParam('search', textField({ maxLength: 20 })),
        status: useRouteParam('status', choiceField(['Pending', 'Complete'] as const)),
      };
      return () => h('div');
    },
  });
  mount(Probe, { global: { plugins: [router] } });
  const settle = async () => {
    await Promise.resolve();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { router, state, settle };
}

describe('useRouteParam', () => {
  it('reads valid values from the URL and defaults for missing ones', async () => {
    const { state } = await setup('/list?page=3&search=ada&status=Pending');
    expect(state.page.value).toBe(3);
    expect(state.size.value).toBe(50);
    expect(state.search.value).toBe('ada');
    expect(state.status.value).toBe('Pending');
  });

  it('falls back to defaults for tampered or invalid values', async () => {
    const { state } = await setup(`/list?page=-2&size=999&status=DROP&search=${'x'.repeat(30)}`);
    expect(state.page.value).toBe(1);
    expect(state.size.value).toBe(50);
    expect(state.status.value).toBeNull();
    expect(state.search.value).toBe('');
  });

  it('rejects non-numeric and fractional pages', async () => {
    for (const page of ['abc', '1.5', '1e3', '']) {
      const { state } = await setup(`/list?page=${page}`);
      expect(state.page.value).toBe(1);
    }
  });

  it('writes changes to the URL, leaves defaults out, and keeps other query keys', async () => {
    const { router, state, settle } = await setup('/list?keep=yes&page=4');
    state.search.value = 'obi';
    state.page.value = 1;
    await settle();
    expect(router.currentRoute.value.query).toEqual({ keep: 'yes', search: 'obi' });
    expect(state.search.value).toBe('obi');
    expect(state.page.value).toBe(1);
  });

  it('merges several changes made together into one history entry', async () => {
    const { router, state, settle } = await setup('/list');
    await router.push('/list?page=2');
    state.status.value = 'Complete';
    state.page.value = 1;
    state.size.value = 10;
    await settle();
    expect(router.currentRoute.value.fullPath).toBe('/list?status=Complete&size=10');
    router.back();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.currentRoute.value.fullPath).toBe('/list');
  });

  it('restores state when coming back to the page', async () => {
    const { router, state, settle } = await setup('/list');
    state.page.value = 3;
    await settle();
    await router.push('/other');
    router.back();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.currentRoute.value.fullPath).toBe('/list?page=3');
  });
});
