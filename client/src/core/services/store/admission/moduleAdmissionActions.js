import axios from '../../../../axios';

export default {
  admitPatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/create`, payload)
        .then(response => {
          commit('ADMIT_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAdmissions({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/admission/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_ADMISSIONS', response.data.data.docs);
          commit('SET_ADMISSIONS_TOTAL', response.data.data.total);
          commit('SET_ADMISSION_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAdmission({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/patient/get`, {
          params: {
            visitId: payload.visitId,
          },
        })
        .then(response => {
          commit('SET_ADMISSION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  recommendForDischarge({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/admission/recommend-discharge`, payload)
        .then(response => {
          commit('ADMIT_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
