import axios from '@/axios';

export default {
  requestSurgery({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/surgeries/create`, payload)
        .then(response => {
          commit('REQUEST_SURGERY', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchSurgery({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/surgeries/get`, {
          params: {
            visitId: payload.visitId,
          },
        })
        .then(response => {
          commit('SET_SURGERY', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchSurgeryRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/surgeries/requests/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_SURGERIES', response.data.data.docs);
          commit('SET_SURGERIES_TOTAL', response.data.data.total);
          commit('SET_SURGERIES_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  createOperationNote({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/surgeries/operation-notes/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_OPERATION_NOTE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOperationNotes({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/surgeries/operation-notes/${payload.id}`)
        .then(response => {
          commit('SET_OPERATION_NOTES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
