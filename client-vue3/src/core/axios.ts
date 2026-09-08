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

const setProgressBarColor = (color: string) => {
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
    setProgressBarColor('black');
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
