import axios from "../../../../axios";

export default {
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
  },

  /**
   * LABORATORY ITEMS
   */
  addLaboratoryItem({ commit }, item) {
    return new Promise((resolve, reject) => {
      axios
        .post("/store/laboratory/items/create", item)
        .then(response => {
          commit("ADD_LAB_ITEM", response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchLaboratoryItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get("/store/laboratory/items/get", {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_LAB_ITEMS", response.data.data.docs);
          commit("SET_LAB_ITEMS_TOTAL", response.data.data.total);
          commit("SET_LAB_ITEM_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
