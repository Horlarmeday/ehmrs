import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { notifyError, notifySuccess } from '@/common/notify'
import { routes } from '@/router'

async function mountApp() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router] },
  })
  await router.isReady()
  return wrapper
}

describe('App', () => {
  it('mounts the router shell', async () => {
    const wrapper = await mountApp()
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders frozen toast content for success and error', async () => {
    const wrapper = await mountApp()
    notifySuccess({ data: { message: 'Patient saved' } })
    notifyError({ response: { data: { message: 'Save failed' } } })
    await flushPromises()
    const text = document.body.textContent ?? ''
    expect(text).toContain('Success message')
    expect(text).toContain('Patient saved')
    expect(text).toContain('Error message')
    expect(text).toContain('Save failed')
    wrapper.unmount()
  })
})
