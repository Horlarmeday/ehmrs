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
};
