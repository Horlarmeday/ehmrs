// ! legacy dispatch('auth/logout') maps to logoutSession: the action name clashes with the ported mutation-action
import { defineStore } from 'pinia';
import axios from '../core/axios';
import type { ForgotPasswordRequest, LoginRequest } from '../types/api/auth';

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
    login(staff: LoginRequest) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        axios({
          url: `/auth/login`,
          data: staff,
          method: 'POST',
        })
          .then((response) => {
            const token = response.data.data;
            localStorage.setItem('user_token', token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.auth_success(token);
            resolve(response);
          })
          .catch((err) => {
            this.auth_error();
            localStorage.removeItem('user_token');
            reject(err);
          });
      });
    },
    forgot(phone: ForgotPasswordRequest) {
      return new Promise((resolve, reject) => {
        this.auth_request();
        axios({
          url: '/auth/forgot-password',
          data: phone,
          method: 'POST',
        })
          .then((response) => {
            const user = response.data.data;
            this.auth_success(user);
            resolve(response);
          })
          .catch((err) => {
            this.auth_error();
            reject(err);
          });
      });
    },
    logoutSession() {
      return new Promise((resolve) => {
        this.logout();
        localStorage.removeItem('user_token');
        delete axios.defaults.headers.common['authorization'];
        window.location.replace('/');
        resolve(null);
      });
    },
  },
});
