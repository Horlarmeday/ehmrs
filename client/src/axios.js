// axios
import axios from 'axios';
import NProgress from 'nprogress';
import store from './core/services/store/index';
import { notifyError, notifySuccess } from './common/common';

const token = localStorage.getItem('user_token');

const calculatePercentage = (loaded, total) => Math.floor((loaded * 1.0) / total);

axios.defaults.onDownloadProgress = e => {
  const percentage = calculatePercentage(e.loaded, e.total);
  NProgress.set(percentage);
};

axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.timeout = 180000;

axios.interceptors.request.use(
  config => {
    NProgress.start();
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(
  response => {
    switch (response.status) {
      case 201:
        notifySuccess(response);
        break;
      case 204:
        notifySuccess(response);
        break;
      case 401:
        store.dispatch('auth/logout');
        break;
    }
    NProgress.done(true);
    return response;
  },
  error => {
    NProgress.done(true);
    let res = error.response;
    if (res && res.data) {
      if (res.status === 401) store.dispatch('auth/logout');
      notifyError(error);
      return Promise.reject(error.response.data);
    }
    notifyError(error);
    return Promise.reject(error.message);
  }
);

export default axios;
