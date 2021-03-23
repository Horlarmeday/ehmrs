import axios from "../../../../axios";

export default {
  /**
   * GENERIC DRUGS
   */
  addGenericDrug({ commit }, drug) {
    return new Promise((resolve, reject) => {
      axios
        .post("/pharmacy/generic/create", drug)
        .then(response => {
          commit(
            "ADD_GENERIC_DRUG",
            Object.assign(drug, {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
              code: response.data.data.code
            })
          );
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  fetchGenericDrugs({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/pharmacy/generic/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_GENERIC_DRUGS", response.data.data.docs);
          commit("SET_GENERIC_DRUGS_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateGenericDrug({ commit }, drug) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/pharmacy/generic/update`, drug)
        .then(response => {
          commit("UPDATE_GENERIC_DRUG", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
