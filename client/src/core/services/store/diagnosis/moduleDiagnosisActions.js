import axios from '../../../../axios';

export default {
  addICD10Disease({ commit }, icd10Disease) {
    return new Promise((resolve, reject) => {
      axios
        .post('/diagnosis/icd10/create', icd10Disease)
        .then(response => {
          commit('ADD_ICD10DISEASE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchICD10Diagnosis({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/diagnosis/icd10/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_ICD10DISEASES', response.data.data.docs);
          commit('SET_ICD10DISEASES_TOTAL', response.data.data.total);
          commit('SET_ICD10_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateICD10Disease({ commit }, disease) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/diagnosis/icd10/update`, disease)
        .then(response => {
          commit('UPDATE_ICD10DISEASE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addICPC2Disease({ commit }, icpc2Disease) {
    return new Promise((resolve, reject) => {
      axios
        .post('/diagnosis/icpc2/create', icpc2Disease)
        .then(response => {
          commit('ADD_ICPC2DISEASE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchICPC2Diagnosis({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/diagnosis/icpc2/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_ICPC2DISEASES', response.data.data.docs);
          commit('SET_ICPC2DISEASES_TOTAL', response.data.data.total);
          commit('SET_ICPC2_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateICPC2Disease({ commit }, investigation) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/diagnosis/icpc2/update`, investigation)
        .then(response => {
          commit('UPDATE_ICPC2DISEASE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
