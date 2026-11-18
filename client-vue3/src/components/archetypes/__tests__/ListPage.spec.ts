import { beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import ListPage, { type ListQuery } from '../ListPage.vue';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
});

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
}

const rows: Row[] = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

async function setup(path = '/items', guard?: (query: Record<string, unknown>) => true | string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/items', component: { render: () => null } }],
  });
  await router.push(path);
  await router.isReady();
  const load = vi.fn<
    [ListQuery & Record<string, unknown>],
    Promise<{ rows: Row[]; total: number }>
  >(async () => ({ rows, total: 45 }));
  const filters = reactive<{ search: string; status: string | null }>({ search: '', status: null });
  const Host = defineComponent({
    setup() {
      return () =>
        h(ListPage<Row>, {
          title: 'Items',
          label: 'Items',
          columns: [
            { id: 'name', header: 'Name', sortable: true },
            { id: 'id', header: 'Number', numeric: true },
          ],
          rowKey: 'id',
          load,
          query: filters,
          guard,
          defaultPageSize: 10,
        });
    },
  });
  const wrapper = mount(Host, { global: { plugins: [router] }, attachTo: document.body });
  await flushPromises();
  const settle = async () => {
    await flushPromises();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await flushPromises();
  };
  await settle();
  return { wrapper, router, load, filters, settle };
}

describe('ListPage binding contract', () => {
  it('calls load with exactly the view’s filters plus page, page size and sort', async () => {
    const { load } = await setup();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.calls[0]?.[0]).toEqual({
      search: '',
      status: null,
      page: 1,
      pageSize: 10,
      sort: null,
    });
  });

  it('starts from the page, size and sort in the URL', async () => {
    const { load } = await setup('/items?page=3&size=20&sort=name&order=desc');
    expect(load.mock.calls[0]?.[0]).toMatchObject({
      page: 3,
      pageSize: 20,
      sort: { id: 'name', desc: true },
    });
  });

  it('ignores a tampered URL instead of sending it to load', async () => {
    const { load } = await setup('/items?page=-4&size=7&sort=password&order=sideways');
    expect(load.mock.calls[0]?.[0]).toMatchObject({ page: 1, pageSize: 10, sort: null });
  });

  it('goes back to page 1 when a filter changes, and passes the new filter', async () => {
    const { load, filters, router, settle } = await setup('/items?page=3');
    filters.status = 'Pending';
    await settle();
    expect(load.mock.lastCall?.[0]).toMatchObject({ status: 'Pending', page: 1 });
    expect(router.currentRoute.value.query.page).toBeUndefined();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('sorting from a column header reaches load and the URL', async () => {
    const { wrapper, load, router, settle } = await setup();
    await wrapper.get('th button').trigger('click');
    await settle();
    expect(load.mock.lastCall?.[0]).toMatchObject({ sort: { id: 'name', desc: false }, page: 1 });
    expect(router.currentRoute.value.query).toMatchObject({ sort: 'name' });
  });

  it('a guard refusal stops the request and shows the reason', async () => {
    const guard = (query: Record<string, unknown>) =>
      query.search ? true : 'Type a name to search.';
    const { wrapper, load, filters, settle } = await setup('/items', guard);
    expect(load).not.toHaveBeenCalled();
    expect(wrapper.get('[data-testid="list-summary"]').text()).toBe('Type a name to search.');
    filters.search = 'ada';
    await settle();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.lastCall?.[0]).toMatchObject({ search: 'ada', page: 1 });
  });
});
