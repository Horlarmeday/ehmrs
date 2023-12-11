import axios from '@/axios';

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
            admissionId: payload.admissionId,
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

  /**
   * Observations
   */
  createObservation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/observations/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_OBSERVATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchObservations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/observations/${payload.id}`)
        .then(response => {
          commit('SET_OBSERVATIONS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * Care plans
   */
  createCarePlan({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/care-plans/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_CARE_PLAN', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchCarePlans({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/care-plans/${payload.id}`)
        .then(response => {
          commit('SET_CARE_PLANS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * IO Charts
   */
  createIOChart({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/admission/iocharts/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_IO_CHART', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchIOCharts({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/admission/iocharts/${payload.id}`)
        .then(response => {
          commit('SET_IO_CHARTS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
