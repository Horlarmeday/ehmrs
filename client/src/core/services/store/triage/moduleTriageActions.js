import axios from '@/axios';

export default {
  addTriage({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/triage/create/${payload.visit_id}`, payload.triage)
        .then(response => {
          commit('ADD_TRIAGE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneTriage({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/triage/visit/get`, {
          params: {
            patientId: payload.patientId,
          },
        })
        .then(response => {
          commit('SET_TRIAGE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchTriageInAVisit({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/triage/visit/get/${payload.visit_id}`)
        .then(response => {
          commit('SET_TRIAGE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchTriages({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/triage/get`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_TRIAGES', response.data.data.docs);
          commit('SET_TRIAGES_TOTAL', response.data.data.total);
          commit('SET_TRIAGES_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
