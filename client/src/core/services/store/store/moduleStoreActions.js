import axios from "../../../../axios";

export default {
  /**
   * GENERIC DRUGS
   */
  addGenericDrug({ commit }, drug) {
    return new Promise((resolve, reject) => {
      axios
        .post("/store/pharmacy/generic/create", drug)
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
        .get("/store/pharmacy/generic/get", {
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
        .put(`/store/pharmacy/generic/update`, drug)
        .then(response => {
          commit("UPDATE_GENERIC_DRUG", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /**
   * PHARMACY ITEMS
   */
  addPharmacyItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios
        .post("/store/pharmacy/items/create", item)
        .then(response => {
          commit(
            "ADD_PHARM_ITEM",
            Object.assign(item, {
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

  fetchPharmacyItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/store/pharmacy/items/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            sort_by: payload.sort_by,
            order: payload.order,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_PHARM_ITEMS", response.data.data.docs);
          commit("SET_PHARM_ITEMS_TOTAL", response.data.data.total);
          commit("SET_PHARM_ITEM_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
