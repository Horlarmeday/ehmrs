import axios from '@/axios';

export default {
  createRequest({ commit }, requests) {
    return new Promise((resolve, reject) => {
      axios
        .post('/requests/create', requests)
        .then(response => {
          commit('ADD_REQUEST', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/requests/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_REQUESTS', response.data.data.docs);
          commit('SET_REQUESTS_TOTAL', response.data.data.total);
          commit('SET_REQUESTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchCurrentUserRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/requests/get/me', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_REQUESTS', response.data.data.docs);
          commit('SET_REQUESTS_TOTAL', response.data.data.total);
          commit('SET_REQUESTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateRequests({ commit }, requests) {
    return new Promise((resolve, reject) => {
      axios
        .put('/requests/update', requests)
        .then(response => {
          commit('UPDATE_REQUESTS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addSelectedRequest({ commit }, request) {
    commit('ADD_SELECTED_REQUEST', request);
  },

  removeSelectedRequest({ commit }, request) {
    commit('REMOVE_SELECTED_REQUEST', request);
  },

  emptySelectedRequests({ commit }) {
    commit('EMPTY_SELECTED_REQUESTS', []);
  },
};
