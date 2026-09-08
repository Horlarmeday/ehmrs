/**
 * Port of legacy `client/src/axios.js` (issue #38). The frozen contract
 * surface (what the harness gates) is unchanged: baseURL '/api', 180000ms
 * timeout, NProgress start/done + setColor, toast triggers on 201/204 and on
 * errors, 401 ⇒ logout, rejection shapes (`error.response.data` /
 * `error.message`). Legacy `store.dispatch('auth/logout')` maps to
 * `useAuthStore().logoutSession()` per the #36 mapping deviation.
 *
 * Deliberate improvements over the legacy file, each documented in
 * `tasks/38-http-layer-port.md`:
 * - Bearer token is attached per-request from a fresh localStorage read and
 *   omitted entirely when absent — legacy stamped `Bearer null` on every
 *   request when logged out and never refreshed the token after
 *   login/logout in another tab.
 * - `NProgress.setColor` validates its argument against a safe color
 *   pattern before interpolating into CSS.
 * - Success path calls `NProgress.done(true)` immediately instead of after
 *   the legacy 30000ms delay (the delay left the bar stuck on screen).
 * - The unreachable `case 401` in the success switch is removed (axios
 *   rejects non-2xx, so the error handler owns 401).
 */
import axios from 'axios';
import NProgress from 'nprogress';
import { useAuthStore } from '../stores/auth';
import { notifyError, notifySuccess } from '../common/notify';

const TOKEN_KEY = 'user_token';
const SAFE_COLOR = /^#[0-9a-f]{3,8}$|^[a-z]+$/i;

const calculatePercentage = (loaded: number, total: number | undefined) => Math.floor((loaded * 1.0) / (total ?? 0));

axios.defaults.onDownloadProgress = (e) => {
  const percentage = calculatePercentage(e.loaded, e.total);
  NProgress.set(percentage);
};

axios.defaults.baseURL = '/api';
delete axios.defaults.headers.common['Authorization'];
axios.defaults.timeout = 180000;

(NProgress as unknown as { setColor: (color: string) => void }).setColor = (color: string) => {
  if (!SAFE_COLOR.test(color)) return;
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
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
    }
    NProgress.done(true);
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
