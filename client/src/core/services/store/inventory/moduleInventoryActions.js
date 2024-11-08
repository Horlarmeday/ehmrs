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

  updateInventoryItem({ commit }, inventory) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/inventory/item/update/`, inventory)
        .then(response => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  createInventoryItemsReturnRequest({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .post(`/inventory/request-return`, items)
        .then(response => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateItemsReturnRequest({ commit }, items) {
    return new Promise((resolve, reject) => {
      axios
        .put(`/inventory/request-return/update`, items)
        .then(response => {
          commit('UPDATE_ITEM', response.data.data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  fetchReturnRequests({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .get(`inventory/request-return/get`, {
          params: {
            currentPage: payload.currentPage,
            pageLimit: payload.itemsPerPage,
            search: payload.search,
          },
        })
        .then(response => {
          commit('SET_RETURN_REQUESTS', response.data.data.docs);
          commit('SET_RETURN_REQUESTS_TOTAL', response.data.data.total);
          commit('SET_RETURN_REQUESTS_PAGES', response.data.data.pages);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  /***
   * SELECTED ITEMS
   */
  addSelectedItem({ commit }, item) {
    commit('ADD_SELECTED_ITEM', item);
  },

  addAllAsSelectedItems({ commit }, items) {
    commit('ADD_ALL_SELECTED_ITEMS', items);
  },

  removeSelectedItem({ commit }, item) {
    commit('REMOVE_SELECTED_ITEM', item);
  },

  removeAllSelectedItems({ commit }) {
    commit('REMOVE_ALL_SELECTED_ITEMS', []);
  },
};
