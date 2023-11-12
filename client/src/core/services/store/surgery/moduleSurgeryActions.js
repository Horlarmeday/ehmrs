import axios from '@/axios';

export default {
  requestSurgery({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/surgery/create`, payload)
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
        .get(`/surgery/get`, {
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
};
