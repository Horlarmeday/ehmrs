import axios from '@/axios';

export default {
  addObservation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/consultations/observation/create/${payload.visit_id}`, payload.complaint)
        .then(response => {
          commit('ADD_OBSERVATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addDiagnosis({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/consultations/diagnosis/create/${payload.visit_id}`, payload.complaint)
        .then(response => {
          commit('ADD_DIAGNOSIS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  changeTestsType({ commit }, type) {
    commit('CHANGE_TEST_TYPE', type);
  },

  changeSampleId({ commit }, id) {
    commit('CHANGE_SAMPLE_ID', id);
  },

  fetchVisitsHistory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/consultations/history/get`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            visitId: payload.visitId,
          },
        })
        .then(response => {
          commit('SET_VISITS_HISTORY', response.data.data.docs);
          commit('SET_VISITS_HISTORY_TOTAL', response.data.data.total);
          commit('SET_VISITS_HISTORY_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDiagnosesAndFindings({ commit }, visitId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/consultations/diagnoses/get/${visitId}`)
        .then(response => {
          commit('SET_DIAGNOSES_FINDINGS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDiagnoses({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/consultations/diagnoses/get/`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_DIAGNOSES', response.data.data.docs);
          commit('SET_DIAGNOSES_TOTAL', response.data.data.total);
          commit('SET_DIAGNOSES_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchHistories({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/consultations/histories/get/`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_PATIENT_HISTORIES', response.data.data.docs);
          commit('SET_PATIENT_HISTORY_TOTAL', response.data.data.total);
          commit('SET_PATIENT_HISTORY_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
