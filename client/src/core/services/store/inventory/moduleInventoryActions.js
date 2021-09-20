import axios from "../../../../axios";

export default {
  fetchInventoryItems({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/${payload.inventoryType}`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search
          }
        })
        .then(response => {
          commit("SET_ITEMS", response.data.data.docs);
          commit("SET_ITEMS_TOTAL", response.data.data.total);
          commit("SET_NUMB_PAGES", response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
