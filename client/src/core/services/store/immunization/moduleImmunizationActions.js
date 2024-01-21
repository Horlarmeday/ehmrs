import axios from '@/axios';

export default {
  enrolImmunizationPatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/immunizations/create`, payload)
        .then(response => {
          commit('ENROL_IMMUNIZATION_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchImmunizationAccounts({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/immunizations/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_IMMUNIZATION_ACCOUNTS', response.data.data.docs);
          commit('SET_IMMUNIZATION_ACCOUNTS_TOTAL', response.data.data.total);
          commit('SET_IMMUNIZATION_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneImmunizationAccount({ commit }, immunizationId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/immunizations/get/${immunizationId}`)
        .then(response => {
          commit('SET_ONE_IMMUNIZATION_ACCOUNT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateImmunizationAccount({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/immunizations/${payload.id}`, payload.data)
        .then(response => {
          commit('SET_ONE_IMMUNIZATION_ACCOUNT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
