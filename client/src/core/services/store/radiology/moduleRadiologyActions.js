import axios from '../../../../axios';

export default {
  addImaging({ commit }, imaging) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/imaging/create', imaging)
        .then(response => {
          commit(
            'ADD_IMAGING',
            Object.assign(imaging, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchImagings({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/imaging/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_IMAGINGS', response.data.data.docs);
          commit('SET_IMAGINGS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateImaging({ commit }, imaging) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/imaging/update`, imaging)
        .then(response => {
          commit('UPDATE_IMAGING', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addInvestigation({ commit }, investigation) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/investigations/create', investigation)
        .then(response => {
          commit('ADD_INVESTIGATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchInvestigations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_INVESTIGATIONS', response.data.data.docs);
          commit('SET_INVESTIGATIONS_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATION_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateInvestigation({ commit }, investigation) {
    return new Promise((resolve, reject) => {
      axios
        .patch(`/radiology/investigations/update`, investigation)
        .then(response => {
          commit('UPDATE_INVESTIGATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * REQUESTED INVESTIGATIONS
   */
  fetchRequestedInvestigations({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/requested-investigations/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            period: payload.period,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_REQUESTED_INVESTIGATIONS', response.data.data.docs);
          commit('SET_REQUESTED_INVESTIGATIONS_TOTAL', response.data.data.total);
          commit('SET_REQUESTED_INVESTIGATIONS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneRequestedInvestigation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/requested-investigations/get/${payload.id}`)
        .then(response => {
          commit('SET_REQUESTED_INVESTIGATION', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  uploadResultImages({ commit }, images) {
    return new Promise((resolve, reject) => {
      axios
        .post('/radiology/upload-images', images)
        .then(response => {
          commit('UPLOAD_RESULT_IMAGES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  addInvestigationResult({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/radiology/requested-investigations/add-result`, { results: payload })
        .then(response => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * INVESTIGATIONS APPROVAL
   */
  fetchInvestigationsApproval({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations-approval/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_INVESTIGATIONS_APPROVAL', response.data.data.docs);
          commit('SET_INVESTIGATIONS_APPROVAL_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATIONS_APPROVAL_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  approveInvestigationResult({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/radiology/requested-investigations/approve/${payload.id}`)
        .then(response => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * RESULTS
   */
  fetchInvestigationsResults({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/radiology/investigations-results/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_INVESTIGATIONS_RESULTS', response.data.data.docs);
          commit('SET_INVESTIGATIONS_RESULTS_TOTAL', response.data.data.total);
          commit('SET_INVESTIGATIONS_RESULTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneInvestigationResult({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/radiology/investigations-results/get/${payload.id}`)
        .then(response => {
          commit('SET_INVESTIGATION_RESULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
