import '@fontsource-variable/figtree';
import '@fontsource/geist-mono/400.css';
import 'nprogress/nprogress.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setupValidation } from './validation/setup';
import { loadFlips } from './core/flips';
import { setupSentry } from './core/sentry';
import './style.css';

setupValidation();

const app = createApp(App);
void setupSentry(app);
app.use(createPinia());
void loadFlips().then(() => {
  app.use(router);
  app.mount('#app');
});
