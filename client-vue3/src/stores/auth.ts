/**
 * Pinia port of the legacy Vuex `auth` module (ADR-0003 dialect):
 * - store id = legacy module name
 * - actions keep exact names, bodies and payload shapes; axios calls identical
 * - mutations (auth_request/auth_success/auth_error/logout) become same-named
 *   actions with the same bodies — no idiomatic cleanup during migration
 * - cross-module dispatch: none in this module
 * - mapping deviation: legacy dispatch('auth/logout') → logoutSession() — the
 *   legacy action name `logout` clashes with the ported same-named
 *   mutation-action (Vuex could distinguish commit vs dispatch; Pinia cannot)
 */
import { defineStore } from 'pinia';
import axios from '../core/axios';

interface StaffCredentials {
  username: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: '',
    token: localStorage.getItem('user_token') || '',
    user: null,
    isLoggedInUser: null,
    search: null,
  }),
  actions: {
    auth_request() {
      this.status = 'loading';
    },
    auth_success(token: string) {
      this.status = 'success';
      this.token = token;
    },
    auth_error() {
      this.status = 'error';
    },
    logout() {
      this.status = '';
      this.token = '';
    },
    login(staff: StaffCredentials) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        axios({
          url: `/auth/login`,
          data: staff,
          method: 'POST',
        })
          .then(response => {
            const token = response.data.data;
            localStorage.setItem('user_token', token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.auth_success(token);
            resolve(response);
          })
          .catch(err => {
            this.auth_error();
            localStorage.removeItem('user_token');
            reject(err);
          });
      });
    },
    register(user: Record<string, unknown>) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        axios({
          url: '/users/register',
          data: user,
          method: 'POST',
        })
          .then(response => {
            const token = response.data.token;
            const user = response.data.data;
            void user;
            localStorage.setItem('user_token', token);
            axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
            this.auth_success(token);
            resolve(response);
          })
          .catch(err => {
            this.auth_error();
            localStorage.removeItem('user_token');
            reject(err);
          });
      });
    },
    forgot(phone: { phone: string }) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        axios({
          url: '/auth/forgot-password',
          data: phone,
          method: 'POST',
        })
          .then(response => {
            const user = response.data.data;
            this.auth_success(user);
            resolve(response);
          })
          .catch(err => {
            this.auth_error();
            reject(err);
          });
      });
    },
    logoutSession() {
      return new Promise(resolve => {
        this.logout();
        localStorage.removeItem('user_token');
        delete axios.defaults.headers.common['authorization'];
        window.location.replace('/');
        resolve(null);
      });
    },
  },
});
