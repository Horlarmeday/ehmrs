import '@fontsource-variable/figtree';
import '@fontsource/geist-mono/400.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setupValidation } from './validation/setup';
import './style.css';

setupValidation();

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
