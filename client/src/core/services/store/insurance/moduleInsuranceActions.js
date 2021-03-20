import axios from "../../../../axios";

export default {
  /**
   * INSURANCE
   */
  addInsurance({ commit }, insurance) {
    return new Promise((resolve, reject) => {
      axios
        .post("/insurances/create", insurance)
        .then(response => {
          commit(
            "ADD_INSURANCE",
            Object.assign(insurance, {
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
  fetchInsurances({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/insurances/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_INSURANCES", response.data.data.docs);
          commit("SET_INSURANCES_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateInsurance({ commit }, insurance) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/insurances/update`, insurance)
        .then(response => {
          commit("UPDATE_INSURANCE", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * HMO
   */
  addHMO({ commit }, hmo) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/insurances/create/hmo`, hmo)
        .then(response => {
          commit("ADD_HMO", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchHMOs({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/insurances/get/hmo", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload.filter
          }
        })
        .then(response => {
          commit("SET_HMOS", response.data.data.docs);
          commit("SET_HMOS_TOTAL", response.data.data.total);
          commit("SET_HMO_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateHMO({ commit }, hmo) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/insurances/update/hmo`, hmo)
        .then(response => {
          commit("UPDATE_HMO", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
