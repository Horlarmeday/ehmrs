import axios from '@/axios';

export default {
  /**
   * ACTIVE VISITS
   */
  addVisit({ commit }, visit) {
    return new Promise((resolve, reject) => {
      axios
        .post('/visits/create', visit)
        .then(response => {
          commit('ADD_VISIT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  getLastActiveVisit({ commit }, visit) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/visits/last-active`, visit)
        .then(response => {
          commit('ADD_VISIT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchActiveVisits({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/visits/active/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_ACTIVE_VISITS', response.data.data.docs);
          commit('SET_ACTIVE_VISITS_TOTAL', response.data.data.total);
          commit('SET_ACTIVE_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchVisit({ commit }, visitId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/visits/${visitId}`)
        .then(response => {
          commit('SET_VISIT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchCategoryVisits({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/visits/category/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            category: payload.category,
            filter: payload?.filter,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_CATEGORY_VISITS', response.data.data.docs);
          commit('SET_CATEGORY_VISITS_TOTAL', response.data.data.total);
          commit('SET_CATEGORY_VISITS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchProfessionalVisits({ commit }, payload) {
    console.log(payload);
    return new Promise((resolve, reject) => {
      axios
        .get('/visits/professional-assigned/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_ASSIGNED_VISITS', response.data.data.docs);
          commit('SET_ASSIGNED_VISITS_TOTAL', response.data.data.total);
          commit('SET_ASSIGNED_VISITS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchAllVisits({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/visits/all/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            start: payload.start,
            end: payload.end,
          },
        })
        .then(response => {
          commit('SET_ALL_VISITS', response.data.data.docs);
          commit('SET_ALL_VISITS_TOTAL', response.data.data.total);
          commit('SET_ALL_VISITS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchVisitPrescriptions({ commit }, visitId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/visits/prescriptions/${visitId}`)
        .then(response => {
          commit('SET_VISIT_PRESCRIPTIONS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateVisit({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/visits/update/${payload.id}`, payload.data)
        .then(response => {
          commit('UPDATE_VISIT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchPendingPrescriptions({ commit }, visitId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/visits/pending-prescriptions/${visitId}`)
        .then(response => {
          commit('SET_PENDING_PRESCRIPTIONS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
