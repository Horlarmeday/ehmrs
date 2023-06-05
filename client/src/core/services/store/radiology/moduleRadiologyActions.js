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
};
