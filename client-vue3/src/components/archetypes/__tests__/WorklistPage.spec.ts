import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import WorklistPage from '../WorklistPage.vue';

interface Item extends Record<string, unknown> {
  id: number;
  name: string;
}
const items: Item[] = [
  { id: 1, name: 'Full blood count' },
  { id: 2, name: 'Widal reaction' },
  { id: 3, name: 'Malaria parasite' },
];

function screen(wide: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: wide && query.includes('min-width'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

async function setup(path: string, wide: boolean) {
  screen(wide);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/lab', component: { render: () => null } }],
  });
  await router.push(path);
  await router.isReady();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          WorklistPage<Item>,
          { label: 'Tests', items, itemKey: 'id', itemLabel: (item: Item) => item.name },
          { detail: ({ item }: { item: Item }) => h('p', { 'data-testid': 'detail' }, item.name) }
        ),
    }),
    { global: { plugins: [router] }, attachTo: document.body }
  );
  const settle = async () => {
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await flushPromises();
  };
  await settle();
  return { wrapper, router, settle };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('WorklistPage', () => {
  it('chooses the first item on wide screens and keeps it in the URL', async () => {
    const { wrapper, router } = await setup('/lab', true);
    expect(wrapper.get('[data-testid="detail"]').text()).toBe('Full blood count');
    expect(router.currentRoute.value.query.item).toBe('1');
  });

  it('opens the item named in the URL', async () => {
    const { wrapper } = await setup('/lab?item=3', true);
    expect(wrapper.get('[data-testid="detail"]').text()).toBe('Malaria parasite');
    expect(wrapper.get('[aria-current="true"]').text()).toBe('Malaria parasite');
  });

  it('ignores an item that is not in the list', async () => {
    const { wrapper } = await setup('/lab?item=99', true);
    expect(wrapper.get('[data-testid="detail"]').text()).toBe('Full blood count');
  });

  it('shows only the list on narrow screens until an item is chosen, then only the item', async () => {
    const { wrapper, settle } = await setup('/lab', false);
    expect(wrapper.find('[data-testid="detail"]').exists()).toBe(false);
    await wrapper.findAll('button[data-key]')[1]?.trigger('click');
    await settle();
    expect(wrapper.get('[data-testid="detail"]').text()).toBe('Widal reaction');
    expect(wrapper.find('ul').exists()).toBe(false);
    await wrapper.get('button:not([data-key])').trigger('click');
    await settle();
    expect(wrapper.find('[data-testid="detail"]').exists()).toBe(false);
    expect(wrapper.find('ul').exists()).toBe(true);
    expect(document.activeElement?.textContent?.trim()).toBe('Widal reaction');
  });

  it('moves between items with the arrow keys', async () => {
    const { wrapper } = await setup('/lab', true);
    const buttons = wrapper.findAll<HTMLButtonElement>('button[data-key]');
    buttons[0]?.element.focus();
    await wrapper.get('ul').trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]?.element);
    await wrapper.get('ul').trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[0]?.element);
  });
});
