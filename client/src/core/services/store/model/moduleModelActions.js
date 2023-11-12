import axios from '../../../../axios';

export default {
  /**
   * DEPARTMENT
   */
  addDepartment({ commit }, department) {
    return new Promise((resolve, reject) => {
      axios
        .post('/settings/departments/create', department)
        .then(response => {
          commit(
            'ADD_DEPARTMENT',
            Object.assign(department, {
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
  fetchDepartments({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/departments/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_DEPARTMENTS', response.data.data.docs);
          commit('SET_DEPARTMENTS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateDepartment({ commit }, department) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/settings/departments/update`, department)
        .then(response => {
          commit('UPDATE_DEPARTMENT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * UNIT
   */
  addUnit({ commit }, unit) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/settings/units/create`, unit)
        .then(response => {
          commit(
            'ADD_UNIT',
            Object.assign(unit, {
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

  fetchUnits({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/units/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_UNITS', response.data.data.docs);
          commit('SET_UNITS_TOTAL', response.data.data.total);
          commit('SET_UNIT_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateUnit({ commit }, unit) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/settings/units/update`, unit)
        .then(response => {
          commit('UPDATE_UNIT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * WARD
   */
  addWard({ commit }, ward) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/settings/wards/create`, ward)
        .then(response => {
          commit(
            'ADD_WARD',
            Object.assign(ward, {
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

  fetchWards({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/wards/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_WARDS', response.data.data.docs);
          commit('SET_WARDS_TOTAL', response.data.data.total);
          commit('SET_WARD_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateWard({ commit }, ward) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/settings/wards/update`, ward)
        .then(response => {
          commit('UPDATE_WARD', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchWardsAndBeds({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/wards-and-beds/get', {
          params: {
            search: payload?.search,
          },
        })
        .then(response => {
          commit('SET_WARDS_AND_BEDS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * BED
   */
  addBed({ commit }, bed) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/settings/beds/create`, bed)
        .then(response => {
          commit(
            'ADD_BED',
            Object.assign(bed, {
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

  fetchBeds({ commit }, ward_id) {
    return new Promise((resolve, reject) => {
      axios
        .post('/settings/ward/beds', ward_id)
        .then(response => {
          commit('SET_BEDS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateBed({ commit }, bed) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/settings/beds/update`, bed)
        .then(response => {
          commit('UPDATE_BED', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * SERVICES
   */
  addService({ commit }, service) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/settings/services/create`, service)
        .then(response => {
          commit('ADD_SERVICE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchServices({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/services/get', {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_SERVICES', response.data.data.docs);
          commit('SET_SERVICES_TOTAL', response.data.data.total);
          commit('SET_SERVICE_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  updateService({ commit }, service) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/settings/services/update`, service)
        .then(response => {
          commit('UPDATE_SERVICE', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * DEFAULTS
   */
  addDefault({ commit }, adminDefault) {
    return new Promise((resolve, reject) => {
      axios
        .post('/settings/defaults/create', adminDefault)
        .then(response => {
          commit('ADD_ADMIN_DEFAULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchDefaults({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get('/settings/defaults/get')
        .then(response => {
          commit('SET_ADMIN_DEFAULTS', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchOneDefault({ commit }, defaultId) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/settings/defaults/${defaultId}/get`)
        .then(response => {
          commit('SET_ADMIN_DEFAULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  deleteDefaultData({ commit }, adminDefault) {
    return new Promise((resolve, reject) => {
      axios
        .delete('/settings/defaults/delete', { data: adminDefault })
        .then(response => {
          commit('ADD_ADMIN_DEFAULT', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
