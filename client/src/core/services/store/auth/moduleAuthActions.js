/* eslint-disable no-unused-vars */
import axios from 'axios';

export default {
  login({ commit }, staff) {
    return new Promise((resolve, reject) => {
      commit('auth_request');
      axios({
        url: `/auth/login`,
        data: staff,
        method: 'POST',
      })
        .then(response => {
          const token = response.data.data;
          localStorage.setItem('user_token', token);

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          commit('auth_success', token);
          resolve(response);
        })
        .catch(err => {
          commit('auth_error');
          localStorage.removeItem('user_token');
          reject(err);
        });
    });
  },

  register({ commit }, user) {
    return new Promise((resolve, reject) => {
      commit('auth_request');
      axios({
        url: '/users/register',
        data: user,
        method: 'POST',
      })
        .then(response => {
          const token = response.data.token;
          const user = response.data.data;
          localStorage.setItem('user_token', token);
          axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
          commit('auth_success', token, user);
          resolve(response);
        })
        .catch(err => {
          commit('auth_error', err);
          localStorage.removeItem('user_token');
          reject(err);
        });
    });
  },

  forgot({ commit }, phone) {
    return new Promise((resolve, reject) => {
      commit('auth_request');
      axios({
        url: '/auth/forgot-password',
        data: phone,
        method: 'POST',
      })
        .then(response => {
          const user = response.data.data;
          commit('auth_success', user);
          resolve(response);
        })
        .catch(err => {
          commit('auth_error', err);
          reject(err);
        });
    });
  },

  logout({ commit }) {
    return new Promise((resolve, reject) => {
      commit('logout');
      localStorage.removeItem('user_token');
      delete axios.defaults.headers.common['authorization'];
      window.location.replace('/');
      resolve();
    });
  },
};
