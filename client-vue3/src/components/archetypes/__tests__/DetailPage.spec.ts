import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, onMounted } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import DetailPage from '../DetailPage.vue';

async function setup(path: string, hidden = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/item', component: { render: () => null } }],
  });
  await router.push(path);
  await router.isReady();
  const historyLoader = vi.fn();
  const billingLoader = vi.fn();
  const Panel = (loader: () => void, text: string) => ({
    setup() {
      onMounted(loader);
      return () => h('p', text);
    },
  });
  const History = Panel(historyLoader, 'History rows');
  const Billing = Panel(billingLoader, 'Billing rows');
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            DetailPage,
            {
              title: 'Amoxicillin 500mg',
              tabsLabel: 'Sections',
              backLabel: 'Store items',
              tabs: [
                { value: 'detail', label: 'Item detail' },
                { value: 'history', label: 'History', lazy: true },
                { value: 'billing', label: 'Billing', lazy: true, hidden },
              ],
            },
            {
              'panel-detail': () => h('p', 'Detail rows'),
              'panel-history': () => h(History),
              'panel-billing': () => h(Billing),
            }
          );
      },
    }),
    { global: { plugins: [router] }, attachTo: document.body }
  );
  await flushPromises();
  return { wrapper, router, historyLoader, billingLoader };
}

describe('DetailPage binding contract', () => {
  it('does not load a lazy section until its tab opens', async () => {
    const { wrapper, router, historyLoader } = await setup('/item');
    expect(historyLoader).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Detail rows');
    const tab = wrapper.findAll('[role="tab"]').find((node) => node.text() === 'History');
    await tab?.trigger('mousedown', { button: 0 });
    await tab?.trigger('focus');
    await router.replace({ query: { tab: 'history' } });
    await flushPromises();
    expect(historyLoader).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('History rows');
  });

  it('opens the tab named in the URL', async () => {
    const { wrapper, historyLoader } = await setup('/item?tab=history');
    expect(historyLoader).toHaveBeenCalledTimes(1);
    expect(wrapper.get('[role="tab"][data-state="active"]').text()).toBe('History');
  });

  it('falls back to the first tab for a tampered or hidden tab in the URL', async () => {
    const tampered = await setup('/item?tab=../../admin');
    expect(tampered.wrapper.get('[role="tab"][data-state="active"]').text()).toBe('Item detail');
    const hidden = await setup('/item?tab=billing', true);
    expect(hidden.wrapper.get('[role="tab"][data-state="active"]').text()).toBe('Item detail');
    expect(hidden.billingLoader).not.toHaveBeenCalled();
  });

  it('does not render a hidden tab at all', async () => {
    const { wrapper } = await setup('/item', true);
    const labels = wrapper.findAll('[role="tab"]').map((node) => node.text());
    expect(labels).toEqual(['Item detail', 'History']);
    expect(wrapper.text()).not.toContain('Billing');
  });

  it('writes the chosen tab to the URL', async () => {
    const { wrapper, router } = await setup('/item');
    const tab = wrapper.findAll('[role="tab"]').find((node) => node.text() === 'History');
    await tab?.trigger('mousedown', { button: 0, ctrlKey: false });
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe('history');
  });
});
