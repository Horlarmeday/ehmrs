import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from '@/core/services/store';
import Notifications from 'vue-notification';
import dayjs from '@/core/plugins/dayjs';

Vue.config.productionTip = false;

// Global 3rd party plugins
import 'popper.js';
import 'tooltip.js';
import PerfectScrollbar from 'perfect-scrollbar';
window.PerfectScrollbar = PerfectScrollbar;
import ClipboardJS from 'clipboard';
window.ClipboardJS = ClipboardJS;

// Vue 3rd party plugins
import '@/core/plugins/portal-vue';
import '@/core/plugins/bootstrap-vue';
import '@/core/plugins/perfect-scrollbar';
import '@/core/plugins/highlight-js';
import '@/core/plugins/inline-svg';
import '@/core/plugins/apexcharts';
import '@/core/plugins/metronic';
import 'nprogress/nprogress.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vue-select/dist/vue-select.css';
import './assets/font/stylesheet.css';

// VeeValidate
import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);
Vue.use(Notifications);
Vue.use(dayjs);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
