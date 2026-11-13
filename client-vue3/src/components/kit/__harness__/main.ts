import '@fontsource-variable/figtree';
import '@fontsource/geist-mono/400.css';
import { createApp, h } from 'vue';
import { RouterView, createRouter, createWebHistory } from 'vue-router';
import HarnessApp from './HarnessApp.vue';
import { setupValidation } from '../../../validation/setup';
import '../../../style.css';

setupValidation();

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:any(.*)*', component: HarnessApp }],
});

createApp({ render: () => h(RouterView) })
  .use(router)
  .mount('#app');
