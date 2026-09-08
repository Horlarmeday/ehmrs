/**
 * Verbatim port of legacy `client/src/axios.js` (issue #38, frozen logic):
 * defaults (baseURL '/api', Bearer token from shared 'user_token' localStorage
 * key, 180000ms timeout), NProgress wiring (download progress + setColor
 * monkey-patch + request start + response done), toast triggers on 201/204
 * success and on any error, and 401 ⇒ logout. Deviations, all documented:
 * toast chrome is PrimeVue via the sink adapter in `common/notify.ts`
 * (content/timing frozen); legacy `store.dispatch('auth/logout')` maps to
 * `useAuthStore().logoutSession()` per the #36 mapping deviation.
 */
import axios from 'axios';
import NProgress from 'nprogress';
import { useAuthStore } from '../stores/auth';
import { notifyError, notifySuccess } from '../common/notify';

const token = localStorage.getItem('user_token');

const calculatePercentage = (loaded: number, total: number | undefined) => Math.floor((loaded * 1.0) / (total ?? 0));

axios.defaults.onDownloadProgress = (e) => {
  const percentage = calculatePercentage(e.loaded, e.total);
  NProgress.set(percentage);
};

axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.timeout = 180000;

(NProgress as unknown as { setColor: (color: string) => void }).setColor = (color: string) => {
  const style = document.createElement('style');
  style.textContent = `
  #nprogress .bar {
    background: ${color} !important;
  }
  #nprogress .peg {
    width: 250px;
    box-shadow: 0 0 10px #ffffff, 0 0 10px #000;  }
  `;
  document.body.appendChild(style);
};

axios.interceptors.request.use(
  (config) => {
    (NProgress as unknown as { setColor: (color: string) => void }).setColor('black');
    NProgress.start();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
axios.interceptors.response.use(
  (response) => {
    switch (response.status) {
      case 201:
        notifySuccess(response);
        break;
      case 204:
        notifySuccess(response);
        break;
      case 401:
        useAuthStore().logoutSession();
        break;
    }
    setTimeout(() => {
      NProgress.done(true);
    }, 30000);
    return response;
  },
  (error) => {
    NProgress.done(true);
    const res = error.response;
    if (res && res.data) {
      if (res.status === 401) useAuthStore().logoutSession();
      notifyError(error);
      return Promise.reject(error.response.data);
    }
    notifyError(error);
    return Promise.reject(error.message);
  },
);

export default axios;
