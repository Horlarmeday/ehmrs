import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'

describe('App', () => {
  it('mounts the router shell', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    })
    await router.isReady()
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
