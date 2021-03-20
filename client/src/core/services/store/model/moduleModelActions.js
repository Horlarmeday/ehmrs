import axios from "../../../../axios";

export default {
  /**
   * DEPARTMENT
   */
  addDepartment({ commit }, department) {
    return new Promise((resolve, reject) => {
      axios
        .post("/settings/department/create", department)
        .then(response => {
          commit(
            "ADD_DEPARTMENT",
            Object.assign(department, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt
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
        .get("/settings/department/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_DEPARTMENTS", response.data.data.docs);
          commit("SET_DEPARTMENTS_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
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
        .put(`/settings/department/update`, department)
        .then(response => {
          commit("UPDATE_DEPARTMENT", response.data.data);
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
        .post(`/settings/unit/create`, unit)
        .then(response => {
          commit(
            "ADD_UNIT",
            Object.assign(unit, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt
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
        .get("/settings/unit/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_UNITS", response.data.data.docs);
          commit("SET_UNITS_TOTAL", response.data.data.total);
          commit("SET_UNIT_NUMB_PAGES", response.data.data.pages);
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
        .put(`/settings/unit/update`, unit)
        .then(response => {
          commit("UPDATE_UNIT", response.data.data);
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
        .post(`/settings/ward/create`, ward)
        .then(response => {
          commit(
            "ADD_WARD",
            Object.assign(ward, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt
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
        .get("/settings/ward/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_WARDS", response.data.data.docs);
          commit("SET_WARDS_TOTAL", response.data.data.total);
          commit("SET_WARD_NUMB_PAGES", response.data.data.pages);
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
        .put(`/settings/ward/update`, ward)
        .then(response => {
          commit("UPDATE_WARD", response.data.data);
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
        .post(`/settings/bed/create`, bed)
        .then(response => {
          commit(
            "ADD_BED",
            Object.assign(bed, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt
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
        .post("/settings/ward/one", ward_id)
        .then(response => {
          commit("SET_BEDS", response.data.data);
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
        .put(`/settings/bed/update`, bed)
        .then(response => {
          commit("UPDATE_BED", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
