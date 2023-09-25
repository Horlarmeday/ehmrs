import axios from '@/axios';

export default {
  enrolAntenatalPatient({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/antenatal/create`, payload)
        .then(response => {
          commit('ENROL_ANTENATAL_PATIENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAntenatalAccounts({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/antenatal/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_ANTENATAL_ACCOUNTS', response.data.data.docs);
          commit('SET_ANTENATAL_ACCOUNTS_TOTAL', response.data.data.total);
          commit('SET_ANTENATAL_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneAntenatalAccount({ commit }, antenatalId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/antenatal/get/${antenatalId}`)
        .then(response => {
          commit('SET_ONE_ANTENATAL_ACCOUNT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateAccount({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/antenatal/update-account/${payload.id}`, payload.data)
        .then(response => {
          commit('SET_ONE_ANTENATAL_ACCOUNT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * TRIAGE
   */

  createTriage({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/antenatal/triage/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_ANTENATAL_TRIAGE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAntenatalTriages({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/antenatal/triage/${payload.id}`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
          },
        })
        .then(response => {
          commit('SET_ANTENATAL_TRIAGES', response.data.data.docs);
          commit('SET_ANTENATAL_TRIAGE_TOTAL', response.data.data.total);
          commit('SET_ANTENATAL_TRIAGE_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * CLINICAL NOTES
   */
  createClinicalNote({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/antenatal/clinical-notes/${payload.id}`, payload.data)
        .then(response => {
          commit('CREATE_CLINICAL_NOTE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchClinicalNotes({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/antenatal/clinical-notes/${payload.id}`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
          },
        })
        .then(response => {
          commit('SET_CLINICAL_NOTES', response.data.data.docs);
          commit('SET_CLINICAL_NOTES_TOTAL', response.data.data.total);
          commit('SET_CLINICAL_NOTES_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateClinicalNote({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/antenatal/clinical-notes/update/${payload.id}`, payload.data)
        .then(response => {
          commit('UPDATE_CLINICAL_NOTE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
