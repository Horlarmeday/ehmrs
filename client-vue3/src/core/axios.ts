/**
 * Minimal port of the legacy `client/src/axios.js` defaults that stores rely
 * on (baseURL, Authorization header, timeout). NProgress/interceptor chrome
 * is app-shell concern and lands with the shell, not with store ports.
 */
import axios from 'axios';

const token = localStorage.getItem('user_token');

axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.timeout = 180000;

export default axios;
