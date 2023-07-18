import axios from '../../../../axios';

export default {
  addInventory({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/create`, inventory)
        .then(response => {
          commit('ADD_INVENTORY', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchInventories({ commit }) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get`)
        .then(response => {
          commit('SET_INVENTORIES', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateInventory({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/update`, inventory)
        .then(response => {
          commit('UPDATE_INVENTORY', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchInventoryItems({ commit }, payload) {
    console.log(payload);
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/${payload.inventory}/items`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
            filter: payload?.filter,
          },
        })
        .then(response => {
          commit('SET_ITEMS', response.data.data.docs);
          commit('SET_ITEMS_TOTAL', response.data.data.total);
          commit('SET_NUMB_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchInventoryItem({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/items/${payload.id}`)
        .then(response => {
          commit('SET_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchInventoryItemHistory({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`/inventory/get/${payload.id}/history`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            filter: payload.filter,
          },
        })
        .then(response => {
          commit('SET_ITEM_HISTORY', response.data.data.docs);
          commit('SET_ITEM_HISTORY_TOTAL', response.data.data.total);
          commit('SET_ITEM_HISTORY_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};
