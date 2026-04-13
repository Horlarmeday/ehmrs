import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

/**
 * EHMRS Vue 3 Application Entry Point
 * 
 * Initializes:
 * - Vue 3 app
 * - Pinia store
 * - Vue Router
 * - Global styles
 */
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
