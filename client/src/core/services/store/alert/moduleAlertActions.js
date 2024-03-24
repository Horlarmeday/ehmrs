import axios from '@/axios';

export default {
  addAlert({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/alerts/create`, payload)
        .then(response => {
          commit('ADD_ALERT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAlerts({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/alerts/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            visit_id: payload.id,
          },
        })
        .then(response => {
          commit('SET_ALERTS', response.data.data.docs);
          commit('SET_ALERTS_TOTAL', response.data.data.total);
          commit('SET_ALERTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateAlert({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/alerts/update/${payload.id}`, payload)
        .then(response => {
          commit('ADD_ALERT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
